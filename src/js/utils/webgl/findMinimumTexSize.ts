export default function findMinimumTexSize(amount: number): [number, number] {
  let texSize = 1
  while (texSize * texSize < amount) texSize *= 2
  return [texSize, texSize]
}
