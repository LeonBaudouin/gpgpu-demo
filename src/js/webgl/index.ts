import * as THREE from 'three'
import MainScene from './Scenes/MainScene'
import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'

export default class WebGL {
  private renderer: THREE.WebGLRenderer
  private mainScene: MainScene
  // private postProcessing: EffectComposer

  private clock: THREE.Clock
  private gui: Pane

  constructor(htmlElement: HTMLCanvasElement) {
    this.clock = new THREE.Clock(true)
    this.gui = new Pane()
    this.gui.registerPlugin(EssentialsPlugin)
    this.setupRenderer(htmlElement)
    this.mainScene = new MainScene(this.genContext())

    // this.postProcessing = new EffectComposer(this.renderer)
    // this.postProcessing.addPass(
    //   new RenderPass(this.mainScene.scene, this.mainScene.camera)
    // )
    // const v = new THREE.Vector2()
    // const bloom = new UnrealBloomPass(this.renderer.getSize(v), 1.2, 0, 0)
    // this.postProcessing.addPass(bloom)

    // const postprocessingGui = this.gui.addFolder({
    //   title: 'Post Processing',
    //   index: 0,
    // })
    // postprocessingGui.addInput(bloom, 'strength', {
    //   min: 0,
    //   max: 5,
    //   label: 'Strength',
    // })
    // postprocessingGui.addInput(bloom, 'threshold', {
    //   min: 0,
    //   max: 1,
    //   label: 'Threshold',
    // })
  }

  private genContext = () => ({
    clock: this.clock,
    renderer: this.renderer,
    gui: this.gui,
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
    // this.postProcessing.render()
    this.renderer.render(this.mainScene.scene, this.mainScene.camera)
  }
}

export type WebGLAppContext = ReturnType<WebGL['genContext']>
