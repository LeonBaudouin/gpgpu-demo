import * as THREE from 'three'
import WindowSize from '../utils/page/WindowSize'
import MainScene from './Scenes/MainScene'

export default class WebGL {
  private renderer: THREE.WebGLRenderer
  private mainScene: MainScene

  private clock: THREE.Clock

  constructor(htmlElement: HTMLCanvasElement) {
    this.clock = new THREE.Clock(true)
    this.setupRenderer(htmlElement)
    this.mainScene = new MainScene(this.genContext())
  }

  private genContext = (): WebGLAppContext => ({
    clock: this.clock,
    renderer: this.renderer,
  })

  private setupRenderer(htmlElement: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: htmlElement,
      antialias: true,
    })
    this.renderer.debug.checkShaderErrors = true
    const resize = () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    resize()
    window.addEventListener('resize', resize)
  }

  public tick() {
    const deltaTime = this.clock.getDelta()
    const elapsedTime = this.clock.elapsedTime
    this.mainScene.tick(elapsedTime, deltaTime)
    this.renderer.render(this.mainScene.scene, this.mainScene.camera)
  }
}

export type WebGLAppContext = {
  renderer: THREE.WebGLRenderer
  clock: THREE.Clock
}
