export default function remap(value: number, [start1, stop1]: [number, number], [start2, stop2]: [number, number]) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
}
