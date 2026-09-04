/**
 * Bộ sinh số giả ngẫu nhiên TẤT ĐỊNH — cùng seed luôn cho cùng kết quả.
 *
 * Dùng cho artwork generative (đặt vị trí blob, chip bay...) để hình vẽ giống
 * nhau giữa server và client (không vỡ hydration) và không vi phạm quy tắc
 * "không gọi `Math.random()` khi render" của dự án.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Băm một chuỗi thành số nguyên 32-bit để làm seed. */
export function stringSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Sinh `count` điểm "ngẫu nhiên nhưng cố định" trong khung `width` x `height`,
 * kèm bán kính/độ trễ animation — tiện cho các trường blob/hạt trong artwork.
 */
export function seededField(
  seedKey: string,
  count: number,
  width: number,
  height: number,
): { cx: number; cy: number; r: number; delay: number; dur: number }[] {
  const rng = mulberry32(stringSeed(seedKey));
  return Array.from({ length: count }, () => ({
    cx: rng() * width,
    cy: rng() * height,
    r: 40 + rng() * 120,
    delay: -rng() * 12,
    dur: 14 + rng() * 12,
  }));
}
