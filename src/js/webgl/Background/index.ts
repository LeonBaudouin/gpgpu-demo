import fragmentShader from './fragmentShader.frag'
import vertexShader from './vertexShader.vert'
import * as THREE from 'three'
import AbstractObject from '../abstract/AbstractObject'
import { MainSceneContext } from '../Scenes/MainScene'
import { FolderApi } from 'tweakpane'

export default class Background extends AbstractObject<MainSceneContext> {
  private params = {
    insideColor: '#373232',
    outsideColor: '#141414',
    gradientStart: 0,
    gradientEnd: 0.8,
  }

  private gui: FolderApi

  private uniforms: Record<string, THREE.IUniform>

  public mesh: THREE.Mesh

  constructor(context: MainSceneContext) {
    super(context)
    this.gui = this.context.gui.addFolder({ title: 'Background' })
    this.setupMesh(this.context.camera)
  }

  private setupMesh(camera: THREE.Camera) {
    this.uniforms = {
      uInsideColor: { value: new THREE.Color(this.params.insideColor) },
      uOutsideColor: { value: new THREE.Color(this.params.outsideColor) },
      uGradientStart: { value: this.params.gradientStart },
      uGradientEnd: { value: this.params.gradientEnd },
      uCameraPosition: { value: camera.position },
      uScreenResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    }

    this.output = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(100, 100),
      new THREE.RawShaderMaterial({
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        depthTest: false,
        uniforms: this.uniforms,
      })
    )
    this.output.renderOrder = -1

    this.gui
      .addInput(this.params, 'insideColor')
      .on(
        'change',
        ({ value }) =>
          (this.uniforms.uInsideColor.value = new THREE.Color(value))
      )
    this.gui
      .addInput(this.params, 'outsideColor')
      .on(
        'change',
        ({ value }) =>
          (this.uniforms.uOutsideColor.value = new THREE.Color(value))
      )
    this.gui
      .addInput(this.params, 'gradientStart', { min: 0, max: 1, step: 0.01 })
      .on('change', ({ value }) => (this.uniforms.uGradientStart.value = value))
    this.gui
      .addInput(this.params, 'gradientEnd', { min: 0, max: 1, step: 0.01 })
      .on('change', ({ value }) => (this.uniforms.uGradientEnd.value = value))
  }
}
