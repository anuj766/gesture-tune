'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getHandLandmarker } from '@/lib/handDetection';
import { detectFingerExtensions, correctHandedness, FingerStateDebouncer } from '@/lib/fingerExtension';
import { getActiveNotesFromGestures, loadSavedMapping, saveMapping } from '@/lib/noteMapping';
import { ChordHysteresisStabilizer, recognizeChord } from '@/lib/chordEngine';
import { audioSynth } from '@/lib/audioSynth';
import {
  HandDetectionData,
  ActiveNoteInfo,
  ChordResult,
  NoteMappingConfig,
  AppSettings,
} from '@/types';

import { getInputModeHandler } from '@/lib/inputModes/registry';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky & Palm base
];

const DEFAULT_SETTINGS: AppSettings = {
  inputMode: 'finger-mapping',
  instrumentId: 'piano',
  capoFret: 0,
  cameraDeviceId: '',
  mirrorVideo: true,
  swapHandedness: false,
  hysteresisMs: 180,
  showSkeleton: true,
  showLandmarkDots: true,
  soundEnabled: true,
  synthVolume: 0.6,
  synthWaveform: 'sine',
};

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<ActiveNoteInfo[]>([]);
  const [chordResult, setChordResult] = useState<ChordResult>(recognizeChord([]));
  const [activeGestureId, setActiveGestureId] = useState<string | undefined>(undefined);
  const [detectedHands, setDetectedHands] = useState<HandDetectionData[]>([]);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);

  const [mappingConfig, setMappingConfig] = useState<NoteMappingConfig>(loadSavedMapping());
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const stabilizerRef = useRef<ChordHysteresisStabilizer>(new ChordHysteresisStabilizer());
  const debouncerRef = useRef<FingerStateDebouncer>(new FingerStateDebouncer());
  const animFrameIdRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const mappingConfigRef = useRef(mappingConfig);
  mappingConfigRef.current = mappingConfig;

  // Stop current audio voices on input mode, capo fret, or instrument change
  useEffect(() => {
    audioSynth.stopAll();
    setActiveNotes([]);
    setChordResult(recognizeChord([]));
    setActiveGestureId(undefined);
  }, [settings.inputMode, settings.capoFret, settings.instrumentId]);

  // Initialize and unlock Audio Context & Sync Instrument
  useEffect(() => {
    audioSynth.setVolume(settings.synthVolume);
    audioSynth.setEnabled(settings.soundEnabled);
    if (settings.instrumentId) {
      audioSynth.setInstrument(settings.instrumentId);
    }
  }, [settings.synthVolume, settings.soundEnabled, settings.instrumentId]);

  const updateMappingConfig = useCallback((newConfig: NoteMappingConfig) => {
    setMappingConfig(newConfig);
    saveMapping(newConfig);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
      }
    } catch (e) {
      console.warn('Could not enumerate media devices', e);
    }
  }, []);

  // Native Canvas Skeleton Rendering
  const drawSkeleton = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, hands: HandDetectionData[]) => {
      ctx.clearRect(0, 0, width, height);

      if (!settingsRef.current.showSkeleton && !settingsRef.current.showLandmarkDots) return;

      for (const handData of hands) {
        const landmarks = handData.landmarks;
        if (!landmarks || landmarks.length < 21) continue;

        // Draw Bone Connections
        if (settingsRef.current.showSkeleton) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = handData.hand === 'Left' ? 'rgba(0, 243, 255, 0.7)' : 'rgba(168, 85, 247, 0.7)';

          for (const [i, j] of HAND_CONNECTIONS) {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            if (p1 && p2) {
              ctx.beginPath();
              ctx.moveTo(p1.x * width, p1.y * height);
              ctx.lineTo(p2.x * width, p2.y * height);
              ctx.stroke();
            }
          }
        }

        // Draw Fingertip & Joint Dots
        if (settingsRef.current.showLandmarkDots) {
          const isLeft = handData.hand === 'Left';
          for (let i = 0; i < landmarks.length; i++) {
            const pt = landmarks[i];
            const isTip = [4, 8, 12, 16, 20].includes(i);
            ctx.beginPath();
            ctx.arc(pt.x * width, pt.y * height, isTip ? 6 : 3, 0, 2 * Math.PI);
            ctx.fillStyle = isTip
              ? isLeft ? '#00f3ff' : '#c084fc'
              : isLeft ? '#0284c7' : '#7e22ce';
            ctx.shadowColor = isTip ? (isLeft ? '#00f3ff' : '#c084fc') : 'transparent';
            ctx.shadowBlur = isTip ? 10 : 0;
            ctx.fill();
          }
        }
      }
    },
    []
  );

  // Initialize MediaPipe & Start Detection Loop
  useEffect(() => {
    let isSubscribed = true;
    let stream: MediaStream | null = null;

    async function startCameraAndTracking() {
      try {
        setIsLoading(true);
        setError(null);
        await refreshDevices();

        const landmarker = await getHandLandmarker();
        if (!isSubscribed) return;

        const constraints: MediaStreamConstraints = {
          video: settingsRef.current.cameraDeviceId
            ? { deviceId: { exact: settingsRef.current.cameraDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isSubscribed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsLoading(false);

        // Frame Detection Loop
        const detectFrame = () => {
          if (!isSubscribed) return;
          const video = videoRef.current;

          if (video && video.readyState >= 2) {
            if (video.currentTime !== lastVideoTimeRef.current) {
              lastVideoTimeRef.current = video.currentTime;
              const currentSettings = settingsRef.current;
              const currentMapping = mappingConfigRef.current;

              const results = landmarker.detectForVideo(video, performance.now());
              
              const processedHands: HandDetectionData[] = [];
              if (results.landmarks && results.handedness) {
                for (let i = 0; i < results.landmarks.length; i++) {
                  const rawLandmarks = results.landmarks[i];
                  const handednessCategory = results.handedness[i]?.[0]?.categoryName || 'Left';
                  const score = results.handedness[i]?.[0]?.score || 0.9;

                  const correctHand = correctHandedness(
                    handednessCategory,
                    rawLandmarks,
                    currentSettings.mirrorVideo,
                    currentSettings.swapHandedness
                  );

                  const rawFingerState = detectFingerExtensions(rawLandmarks, correctHand);
                  const fingerState = debouncerRef.current.debounce(correctHand, rawFingerState);

                  processedHands.push({
                    hand: correctHand,
                    landmarks: rawLandmarks,
                    fingers: fingerState,
                    score,
                  });
                }
              }

              // Reset debouncer if a hand was completely removed from view
              const detectedLeft = processedHands.some(h => h.hand === 'Left');
              const detectedRight = processedHands.some(h => h.hand === 'Right');
              if (!detectedLeft) debouncerRef.current.reset('Left');
              if (!detectedRight) debouncerRef.current.reset('Right');

              // Canvas Skeleton Rendering
              if (canvasRef.current) {
                const canvas = canvasRef.current;
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                  canvas.width = video.videoWidth || 1280;
                  canvas.height = video.videoHeight || 720;
                }
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  drawSkeleton(ctx, canvas.width, canvas.height, processedHands);
                }
              }

              // Modular Input Mode Processing (Finger Mapping vs Gesture Mode)
              const handler = getInputModeHandler(currentSettings.inputMode);
              const inputResult = handler.processInput(
                processedHands,
                currentMapping,
                currentSettings,
                stabilizerRef.current
              );

              setDetectedHands(processedHands);
              setActiveNotes(inputResult.activeNotes);
              setChordResult(inputResult.chordResult);
              setActiveGestureId(inputResult.activeGestureId);

              // State-Based Audio Management
              if (currentSettings.soundEnabled) {
                const activeNoteNames = inputResult.activeNotes.map((n) => n.note);
                audioSynth.updateActiveNotes(activeNoteNames);
              }
            }
          }

          animFrameIdRef.current = requestAnimationFrame(detectFrame);
        };

        animFrameIdRef.current = requestAnimationFrame(detectFrame);
      } catch (err: unknown) {
        if (!isSubscribed) return;
        setIsLoading(false);
        console.error('Camera or HandLandmarker Initialization Error:', err);

        const errorObj = err as { name?: string; message?: string };
        if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
          setError('Camera access permission was denied. Please allow camera access in your browser to use gesture tracking.');
        } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
          setError('No camera device was found on your system. Please connect a webcam.');
        } else {
          setError(errorObj.message || 'Failed to access camera stream or initialize gesture tracking.');
        }
      }
    }

    startCameraAndTracking();

    return () => {
      isSubscribed = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      audioSynth.stopAll();
    };
  }, [
    settings.cameraDeviceId,
    drawSkeleton,
    refreshDevices,
  ]);

  return {
    videoRef,
    canvasRef,
    isLoading,
    error,
    activeNotes,
    chordResult,
    activeGestureId,
    detectedHands,
    availableDevices,
    mappingConfig,
    settings,
    updateMappingConfig,
    updateSettings,
    refreshDevices,
  };
}
