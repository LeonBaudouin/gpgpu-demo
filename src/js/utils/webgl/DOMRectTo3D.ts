import WindowSize from '../page/WindowSize'
import tuple from '../types/tuple'
import { Viewport } from './viewport'

function DOMRectTo3D(domRect: DOMRect | undefined, viewport: Viewport, size: WindowSize) {
  const result = {
    position: tuple(0, 0, 0),
    scale: tuple(0, 0, 0),
  }
  if (domRect == null) return result
  result.scale[2] = 1
  result.scale[0] = (domRect.width / size.state.width) * viewport.width
  result.scale[1] = (domRect.height / size.state.height) * viewport.height
  result.position[0] = (domRect.left / size.state.width) * viewport.width + result.scale[0] / 2 - viewport.width / 2
  result.position[1] = -((domRect.top / size.state.height) * viewport.height + result.scale[1] / 2 - viewport.height / 2)
  return result
}

export default DOMRectTo3D
