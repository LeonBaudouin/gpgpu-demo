import * as THREE from 'three'

const position = new THREE.Vector3()
const defaultTarget = new THREE.Vector3()
const tempTarget = new THREE.Vector3()

function getViewport(camera: THREE.Camera, target: THREE.Vector3 | Parameters<THREE.Vector3['set']> = defaultTarget) {
  const { width, height } = { width: window.innerWidth, height: window.innerHeight }
  const aspect = width / height
  if (target instanceof THREE.Vector3) tempTarget.copy(target)
  else tempTarget.set(...target)
  const distance = camera.getWorldPosition(position).distanceTo(tempTarget)
  if ((camera as THREE.OrthographicCamera).isOrthographicCamera) {
    return {
      width: width / (camera as THREE.OrthographicCamera).zoom,
      height: height / (camera as THREE.OrthographicCamera).zoom,
      factor: 1,
      distance,
      aspect,
    }
  } else {
    const fov = ((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180 // convert vertical fov to radians
    const h = 2 * Math.tan(fov / 2) * distance // visible height
    const w = h * (width / height)
    return { width: w, height: h, factor: width / w, distance, aspect }
  }
}

export type Viewport = ReturnType<typeof getViewport>

export default getViewport
