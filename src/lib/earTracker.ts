export interface Point3D {
  x: number;
  y: number;
  z: number;
}

function euclideanDistance(p1: Point3D, p2: Point3D) {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
  );
}

// MediaPipe FaceMesh produces 478 landmarks.
// Standard 6 points for eyes:
// Left eye: 33, 160, 158, 133, 153, 144
// Right eye: 362, 385, 387, 263, 373, 380
// We can use FaceLandmarker blendshapes instead, it's much more stable!
// Blendshapes provide "eyeBlinkLeft" and "eyeBlinkRight" scores (0.0 to 1.0)
