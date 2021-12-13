import * as THREE from 'three'
import { WebGLAppContext } from '../..'
import AbstractObject from '../../abstract/AbstractObject'
import AbstractObjectWithSize from '../../abstract/AbstractObjectWithSize'
import Particules from '../../Particules'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import modelUrl from '../../../../models/500.glb'

export type MainSceneContext = WebGLAppContext & {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
}
export default class MainScene extends AbstractObjectWithSize {
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera

  private tickingObjects: AbstractObject[] = []

  private controls: OrbitControls

  constructor(context: WebGLAppContext) {
    super(context)
    this.setCamera()
    this.setObjects()
    this.context.renderer.compile(this.scene, this.camera)
  }

  private genContext = (): MainSceneContext => ({
    ...this.context,
    camera: this.camera,
    scene: this.scene,
  })

  protected onResize(width: number, height: number) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.controls = new OrbitControls(this.camera, this.context.renderer.domElement)
    this.controls.enableDamping = true
  }

  private setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      22.9,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.z = 10
    this.onResize(window.innerWidth, window.innerHeight)
  }

  private setObjects() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1f1f1f)

    new GLTFLoader().load(
      modelUrl,
      (gltf) => {
        const particles = new Particules(this.genContext(), gltf)
        this.scene.add(particles.output)
        this.tickingObjects.push(particles)
      }
    )

    // this.scene.background = new THREE.Color(0xfff00)
  }

  public tick(...params: Parameters<AbstractObject['tick']>) {
    this.controls.update()
    for (const obj of this.tickingObjects) {
      obj.tick(...params)
    }
  }
}
