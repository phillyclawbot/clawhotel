export function tileToScreen(x: number, y: number) {
  return {
    sx: (x - y) * 32,
    sy: (x + y) * 16,
  };
}

export function screenToTile(sx: number, sy: number) {
  return {
    x: Math.round((sx / 32 + sy / 16) / 2),
    y: Math.round((sy / 16 - sx / 32) / 2),
  };
}
