export type Orientation = { alpha: number | null; beta: number | null; gamma: number | null };
export type Quaternion = readonly [number, number, number, number];

// DeviceOrientation uses intrinsic Z-X-Y rotations. Compare orientations in
// device space so crossing ±180° or holding the phone upright doesn't jump.
export function orientationQuaternion({ alpha, beta, gamma }: Orientation): Quaternion | null {
  if (beta === null || gamma === null || !Number.isFinite(beta) || !Number.isFinite(gamma)) return null;
  const halfRadians = Math.PI / 360;
  const x = beta * halfRadians, y = gamma * halfRadians;
  const z = (alpha !== null && Number.isFinite(alpha) ? alpha : 0) * halfRadians;
  const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
  return [sx * cy * cz - cx * sy * sz, cx * sy * cz + sx * cy * sz,
    cx * cy * sz + sx * sy * cz, cx * cy * cz - sx * sy * sz];
}

export function relativeTilt(neutral: Quaternion, current: Quaternion, screenAngle: number): [number, number] {
  const [ax, ay, az, aw] = neutral, [bx, by, bz, bw] = current;
  // inverse(neutral) * current
  let x = aw * bx - ax * bw - ay * bz + az * by;
  let y = aw * by + ax * bz - ay * bw - az * bx;
  let w = aw * bw + ax * bx + ay * by + az * bz;
  if (w < 0) { x = -x; y = -y; w = -w; }
  const angle = screenAngle * Math.PI / 180;
  const pitch = 2 * Math.atan2(x, w), roll = 2 * Math.atan2(y, w);
  const range = 25 * Math.PI / 180;
  const limit = (value: number) => Math.max(-1, Math.min(1, value / range));
  return [limit(roll * Math.cos(angle) + pitch * Math.sin(angle)),
    limit(pitch * Math.cos(angle) - roll * Math.sin(angle))];
}
