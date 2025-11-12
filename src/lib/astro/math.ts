export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export const normalizeDeg = (value: number): number => {
  let v = value % 360;
  if (v < 0) v += 360;
  return v;
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const degToSignIndex = (longitude: number): number =>
  Math.floor(normalizeDeg(longitude) / 30) % 12;

export const degInSign = (longitude: number): number => normalizeDeg(longitude) % 30;
