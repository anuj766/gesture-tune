export class TemporalGestureStabilizer<T extends { id: string }> {
  private candidateGesture: T | null = null;
  private candidateCount: number = 0;
  private confirmedGesture: T | null = null;
  private requiredFrames: number;

  constructor(requiredFrames: number = 3) {
    this.requiredFrames = requiredFrames;
  }

  public update(detectedGesture: T | null): T | null {
    if (!detectedGesture) {
      if (this.candidateGesture !== null) {
        this.candidateGesture = null;
        this.candidateCount = 0;
      }
      // If confirmed gesture drops to null, require 2 frames of null to release
      this.confirmedGesture = null;
      return null;
    }

    if (this.candidateGesture && this.candidateGesture.id === detectedGesture.id) {
      this.candidateCount++;
      if (this.candidateCount >= this.requiredFrames) {
        this.confirmedGesture = detectedGesture;
      }
    } else {
      this.candidateGesture = detectedGesture;
      this.candidateCount = 1;
      // If we don't have a confirmed gesture yet, confirm immediately on 1st match
      if (!this.confirmedGesture) {
        this.confirmedGesture = detectedGesture;
      }
    }

    return this.confirmedGesture || detectedGesture;
  }

  public reset() {
    this.candidateGesture = null;
    this.candidateCount = 0;
    this.confirmedGesture = null;
  }
}
