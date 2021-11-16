import WindowSize from '../page/WindowSize'
import tuple from '../types/tuple'
import { Viewport } from './viewport'

function DOMPosTo3D(pos: [number, number] | THREE.Vector2, viewport: Viewport, size: WindowSize) {
  const result = tuple(0, 0, 0)
  const position = 'toArray' in pos ? pos.toArray() : pos

  result[0] = (position[0] / size.state.width) * viewport.width - viewport.width / 2
  result[1] = -((position[1] / size.state.height) * viewport.height - viewport.height / 2)
  return result
}

export default DOMPosTo3D
