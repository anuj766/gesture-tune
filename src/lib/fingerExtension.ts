import { Landmark, FingerState, Hand, Finger } from '@/types';

function euclideanDistance3D(p1: Landmark, p2: Landmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calculateAngle3D(a: Landmark, b: Landmark, c: Landmark): number {
  const baX = a.x - b.x;
  const baY = a.y - b.y;
  const baZ = (a.z || 0) - (b.z || 0);

  const bcX = c.x - b.x;
  const bcY = c.y - b.y;
  const bcZ = (c.z || 0) - (b.z || 0);

  const dot = baX * bcX + baY * bcY + baZ * bcZ;
  const magBA = Math.sqrt(baX * baX + baY * baY + baZ * baZ);
  const magBC = Math.sqrt(bcX * bcX + bcY * bcY + bcZ * bcZ);

  if (magBA * magBC === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Robust Multi-Criteria Finger Extension Analysis
 * Uses 3D joint angles (MCP-PIP-DIP & PIP-DIP-TIP) combined with relational landmark distances.
 * Resilient against hand rotation, pitch, yaw, and distance from camera.
 */
export function detectFingerExtensions(landmarks: Landmark[], _handSide: Hand): FingerState {
  if (!landmarks || landmarks.length < 21) {
    return { thumb: false, index: false, middle: false, ring: false, pinky: false };
  }

  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const pinkyMcp = landmarks[17];

  // Palm Reference Scale
  const palmWidth = euclideanDistance3D(indexMcp, pinkyMcp);
  const palmLength = euclideanDistance3D(wrist, landmarks[9]); // Wrist to Middle MCP
  const scale = Math.max(0.01, (palmWidth + palmLength) / 2);

  // --- 1. Index Finger ---
  // Landmarks: 5 (MCP), 6 (PIP), 7 (DIP), 8 (TIP)
  const indexPipAngle = calculateAngle3D(indexMcp, landmarks[6], landmarks[7]);
  const indexDipAngle = calculateAngle3D(landmarks[6], landmarks[7], landmarks[8]);
  const indexTipDistMcp = euclideanDistance3D(landmarks[8], indexMcp);
  const indexPipDistMcp = euclideanDistance3D(landmarks[6], indexMcp);

  const indexAngleExtended = indexPipAngle > 145 && indexDipAngle > 140;
  const indexRatioExtended = indexTipDistMcp / Math.max(0.001, indexPipDistMcp) > 1.6;
  const indexExtended = indexAngleExtended || (indexPipAngle > 135 && indexRatioExtended);

  // --- 2. Middle Finger ---
  // Landmarks: 9 (MCP), 10 (PIP), 11 (DIP), 12 (TIP)
  const middleMcp = landmarks[9];
  const middlePipAngle = calculateAngle3D(middleMcp, landmarks[10], landmarks[11]);
  const middleDipAngle = calculateAngle3D(landmarks[10], landmarks[11], landmarks[12]);
  const middleTipDistMcp = euclideanDistance3D(landmarks[12], middleMcp);
  const middlePipDistMcp = euclideanDistance3D(landmarks[10], middleMcp);

  const middleAngleExtended = middlePipAngle > 145 && middleDipAngle > 140;
  const middleRatioExtended = middleTipDistMcp / Math.max(0.001, middlePipDistMcp) > 1.6;
  const middleExtended = middleAngleExtended || (middlePipAngle > 135 && middleRatioExtended);

  // --- 3. Ring Finger ---
  // Landmarks: 13 (MCP), 14 (PIP), 15 (DIP), 16 (TIP)
  const ringMcp = landmarks[13];
  const ringPipAngle = calculateAngle3D(ringMcp, landmarks[14], landmarks[15]);
  const ringDipAngle = calculateAngle3D(landmarks[14], landmarks[15], landmarks[16]);
  const ringTipDistMcp = euclideanDistance3D(landmarks[16], ringMcp);
  const ringPipDistMcp = euclideanDistance3D(landmarks[14], ringMcp);

  const ringAngleExtended = ringPipAngle > 140 && ringDipAngle > 135;
  const ringRatioExtended = ringTipDistMcp / Math.max(0.001, ringPipDistMcp) > 1.55;
  const ringExtended = ringAngleExtended || (ringPipAngle > 130 && ringRatioExtended);

  // --- 4. Pinky Finger ---
  // Landmarks: 17 (MCP), 18 (PIP), 19 (DIP), 20 (TIP)
  const pinkyPipAngle = calculateAngle3D(pinkyMcp, landmarks[18], landmarks[19]);
  const pinkyDipAngle = calculateAngle3D(landmarks[18], landmarks[19], landmarks[20]);
  const pinkyTipDistMcp = euclideanDistance3D(landmarks[20], pinkyMcp);
  const pinkyPipDistMcp = euclideanDistance3D(landmarks[18], pinkyMcp);

  const pinkyAngleExtended = pinkyPipAngle > 140 && pinkyDipAngle > 135;
  const pinkyRatioExtended = pinkyTipDistMcp / Math.max(0.001, pinkyPipDistMcp) > 1.5;
  const pinkyExtended = pinkyAngleExtended || (pinkyPipAngle > 130 && pinkyRatioExtended);

  // --- 5. Thumb Finger (Enhanced 3D Joint Angle & Relative Span Math) ---
  // Landmarks: 1 (CMC), 2 (MCP), 3 (IP), 4 (TIP)
  const thumbIpAngle = calculateAngle3D(landmarks[2], landmarks[3], landmarks[4]);
  const thumbMcpAngle = calculateAngle3D(landmarks[1], landmarks[2], landmarks[3]);

  // Distance from Thumb Tip (4) to Pinky MCP (17) normalized by palm width
  const thumbTipToPinkyMcp = euclideanDistance3D(landmarks[4], pinkyMcp);
  const thumbSpanRatio = thumbTipToPinkyMcp / scale;

  // Distance from Thumb Tip (4) to Index MCP (5)
  const thumbTipToIndexMcp = euclideanDistance3D(landmarks[4], indexMcp);

  const thumbOpenSpan = thumbSpanRatio > 1.15;
  const thumbOpenJoints = thumbIpAngle > 140 && thumbMcpAngle > 135;
  const thumbAwayFromIndex = thumbTipToIndexMcp > scale * 0.45;

  const thumbExtended = (thumbOpenSpan && thumbAwayFromIndex) || (thumbOpenJoints && thumbAwayFromIndex);

  return {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended,
  };
}

/**
 * Finger State Debouncer to hold state across temporary camera noise
 */
export class FingerStateDebouncer {
  private lastStates: Record<Hand, Record<Finger, { active: boolean; inactiveFrameCount: number }>> = {
    Left: {
      thumb: { active: false, inactiveFrameCount: 0 },
      index: { active: false, inactiveFrameCount: 0 },
      middle: { active: false, inactiveFrameCount: 0 },
      ring: { active: false, inactiveFrameCount: 0 },
      pinky: { active: false, inactiveFrameCount: 0 },
    },
    Right: {
      thumb: { active: false, inactiveFrameCount: 0 },
      index: { active: false, inactiveFrameCount: 0 },
      middle: { active: false, inactiveFrameCount: 0 },
      ring: { active: false, inactiveFrameCount: 0 },
      pinky: { active: false, inactiveFrameCount: 0 },
    },
  };

  private DEBOUNCE_INACTIVE_FRAMES = 3;

  public debounce(hand: Hand, rawState: FingerState): FingerState {
    const fingers: Finger[] = ['thumb', 'index', 'middle', 'ring', 'pinky'];
    const debouncedState: FingerState = { ...rawState };

    for (const f of fingers) {
      const isDetected = rawState[f];
      const record = this.lastStates[hand][f];

      if (isDetected) {
        record.active = true;
        record.inactiveFrameCount = 0;
        debouncedState[f] = true;
      } else {
        if (record.active) {
          record.inactiveFrameCount++;
          if (record.inactiveFrameCount <= this.DEBOUNCE_INACTIVE_FRAMES) {
            debouncedState[f] = true;
          } else {
            record.active = false;
            debouncedState[f] = false;
          }
        } else {
          debouncedState[f] = false;
        }
      }
    }

    return debouncedState;
  }

  public reset(hand?: Hand) {
    const handsToReset: Hand[] = hand ? [hand] : ['Left', 'Right'];
    const fingers: Finger[] = ['thumb', 'index', 'middle', 'ring', 'pinky'];

    for (const h of handsToReset) {
      for (const f of fingers) {
        this.lastStates[h][f] = { active: false, inactiveFrameCount: 0 };
      }
    }
  }
}

/**
 * Robust handedness correction based on spatial screen position.
 */
export function correctHandedness(
  mpCategoryName: string,
  landmarks: Landmark[],
  mirrorVideo: boolean = true,
  swapHandedness: boolean = false
): Hand {
  let determinedHand: Hand = 'Left';

  if (landmarks && landmarks.length > 0) {
    const wristX = landmarks[0].x;
    if (mirrorVideo) {
      determinedHand = wristX < 0.5 ? 'Left' : 'Right';
    } else {
      determinedHand = wristX < 0.5 ? 'Right' : 'Left';
    }
  } else {
    determinedHand = mpCategoryName === 'Left' ? 'Right' : 'Left';
  }

  if (swapHandedness) {
    determinedHand = determinedHand === 'Left' ? 'Right' : 'Left';
  }

  return determinedHand;
}
