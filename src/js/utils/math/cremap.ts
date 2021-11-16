import clamp from './clamp'
import remap from './remap'

export default function cremap(value: number, inRange: [number, number], outRange: [number, number]) {
  return clamp(remap(value, inRange, outRange), Math.min(...outRange), Math.max(...outRange))
}
