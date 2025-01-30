import { MathUtils, Matrix4, Quaternion, Vector3 } from "three";

export const lookAtPlusX = (
  matrix: Matrix4,
  position: Vector3,
  target: Vector3,
  up: Vector3
) => {
  const forward = new Vector3().subVectors(target, position).normalize();
  if (forward.lengthSq() < 1e-6) forward.set(1, 0, 0);
  const right = new Vector3().crossVectors(forward, up).normalize();
  const realUp = new Vector3().crossVectors(right, forward).normalize();
  return matrix.makeBasis(forward, realUp, right);
};

export const clampVectorCone = (
  v: Vector3,
  maxDegrees: number,
  centerAxis = new Vector3(1, 0, 0)
): Vector3 => {
  const maxRad = MathUtils.degToRad(maxDegrees);
  const angle = v.angleTo(centerAxis); // in [0..π]

  if (angle > maxRad) {
    const length = v.length();
    const rotationAxis = new Vector3().crossVectors(centerAxis, v);
    // If cross is 0, means v is collinear with centerAxis => no unique rotation axis
    // fallback: pick any orthonormal axis, e.g. (0,1,0)
    if (rotationAxis.lengthSq() < 1e-12) {
      rotationAxis.set(0, 1, 0);
    } else {
      rotationAxis.normalize();
    }

    const rotateBy = angle - maxRad;
    const quat = new Quaternion().setFromAxisAngle(rotationAxis, -rotateBy);

    v.applyQuaternion(quat);
    v.setLength(length);
  }

  return v;
};

export const clampVectorConeRespectDirection = (
  v: Vector3,
  maxDegrees: number,
  axis = new Vector3(1, 0, 0)
): Vector3 => {
  // Check if v is in front or behind the axis
  if (v.dot(axis) >= 0) {
    // front side => clamp around +axis
    clampVectorCone(v, maxDegrees, axis);
  } else {
    // behind => clamp around -axis
    const negAxis = new Vector3().copy(axis).negate();
    clampVectorCone(v, maxDegrees, negAxis);
  }
  return v;
};
