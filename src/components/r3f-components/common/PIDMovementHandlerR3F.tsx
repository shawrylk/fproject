import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  MutableRefObject,
} from "react";
import { useFrame } from "@react-three/fiber";
import { Object3D, Vector3 } from "three";

export interface PIDMovementHandlerProps {
  objectRef: MutableRefObject<Object3D | undefined>;
  destination: Vector3;
  p?: number;
  i?: number;
  d?: number;
  randomFactor?: number;
}

export interface PIDMovementHandlerRef {
  /** Reset everything: velocity, integral, and last error. */
  fullResetController: () => void;
  /** Reset only the integral and last error, but keep velocity. */
  softResetController: () => void;
}

export const PIDMovementHandlerR3F = forwardRef<
  PIDMovementHandlerRef,
  PIDMovementHandlerProps
>(function PIDMovementHandler(
  { objectRef, destination, p = 1.0, i = 0.0, d = 0.0, randomFactor = 0.0 },
  ref
) {
  const errorSum = useRef(new Vector3(0, 0, 0));
  const lastError = useRef(new Vector3(0, 0, 0));
  const velocity = useRef(new Vector3(0, 0, 0));

  /** Reset everything (velocity, integrals, etc.) */
  const fullResetController = () => {
    errorSum.current.set(0, 0, 0);
    lastError.current.set(0, 0, 0);
    velocity.current.set(0, 0, 0);
  };

  const softResetController = () => {
    errorSum.current.set(0, 0, 0);
    lastError.current.set(0, 0, 0);
    // velocity remains as-is
  };

  useImperativeHandle(ref, () => ({
    fullResetController,
    softResetController,
  }));

  useLayoutEffect(() => {
    softResetController();
  }, [destination]);

  useFrame((_, delta) => {
    if (!objectRef.current) return;

    const currentPosition = new Vector3();
    objectRef.current.getWorldPosition(currentPosition);

    const error = new Vector3().subVectors(destination, currentPosition);

    errorSum.current.add(error.clone().multiplyScalar(delta));

    const dError = new Vector3()
      .subVectors(error, lastError.current)
      .divideScalar(delta);

    const control = new Vector3()
      .addScaledVector(error, p)
      .addScaledVector(errorSum.current, i)
      .addScaledVector(dError, d);

    if (randomFactor > 0) {
      control.x += (Math.random() - 0.5) * randomFactor;
      control.y += (Math.random() - 0.5) * randomFactor;
      control.z += (Math.random() - 0.5) * randomFactor;
    }

    velocity.current.addScaledVector(control, delta);

    const moveDelta = velocity.current.clone().multiplyScalar(delta);
    objectRef.current.position.add(moveDelta);

    lastError.current.copy(error);
  });

  return null;
});
