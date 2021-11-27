import AbstractObject from '../abstract/AbstractObject'
import GPGPU from '../GPGPU'
import { MainSceneContext } from '../Scenes/MainScene'
import * as THREE from 'three'
import gpgpuFragment from './gpgpu.frag'
import gpgpuVertex from './gpgpu.vert'
import particlesFragment from './particles.frag'
import particlesVertex from './particles.vert'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import remap from '../../utils/math/remap'
import { FolderApi } from 'tweakpane'
import observableState from '../../utils/observableState'

export default class Particules extends AbstractObject<MainSceneContext> {
  private gpgpu: GPGPU

  private gpgpuShader: THREE.ShaderMaterial
  private particlesShader: THREE.ShaderMaterial
  private firstStatePlane: THREE.Mesh
  private secondStatePlane: THREE.Mesh
  private gui: FolderApi
  public animate = false

  private amount = 64 * 64
  private texSize = [64, 64]
  private params = observableState({ colorToAdd: '#000000' })

  constructor(context: MainSceneContext) {
    super(context)
    this.output = new THREE.Group()
    this.setupGPGPU()
    this.setupParticles()

    this.firstStatePlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(),
      new THREE.MeshBasicMaterial({ map: new THREE.Texture() })
    )
    this.firstStatePlane.visible = true
    this.firstStatePlane.position.x = -1
    this.output.add(this.firstStatePlane)

    this.secondStatePlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(),
      new THREE.MeshBasicMaterial({ map: new THREE.Texture() })
    )
    this.secondStatePlane.visible = true
    this.secondStatePlane.position.x = 1
    this.output.add(this.secondStatePlane)

    new GLTFLoader().load(
      require('../../../models/500.glb').default,
      (gltf: GLTF) => {
        const texture = this.genTexture(
          gltf.scene.getObjectByName('600_final') as THREE.Mesh
        )
        this.gpgpu.updateInitTexture(texture)
        this.gpgpuShader.uniforms.uInitFbo.value = texture
        this.updateTextures()
      }
    )

    this.output.add(new THREE.AxesHelper(1))

    this.gui = this.context.gui.addFolder({ title: 'GPGPU' })
    this.gui.addButton({ title: 'Render' }).on('click', this.render)
    this.gui.addButton({ title: 'Reset' }).on('click', () => {
      this.gpgpuShader.uniforms.uReset.value = true
      this.render()
      this.gpgpuShader.uniforms.uReset.value = false
    })
    this.gui.addInput(this, 'animate', { label: 'Animate' })
    this.gui.addInput(this.particlesShader, 'visible', {
      label: 'Show Particles',
    })
    this.gui.addInput(this.particlesShader.uniforms.uDebugColor, 'value', {
      label: 'Debug Colors',
    })
    this.params.__onChange('colorToAdd', (value) => {
      this.gpgpuShader.uniforms.uColorToAdd.value.set(value)
    })
    this.gui.addInput(this.params, 'colorToAdd', { label: 'Color To Add' })
    this.gui.addInput(this.gpgpuShader.uniforms.uStepSize, 'value', {
      label: 'Step Size',
      min: -0.15,
      max: 0.15,
    })
  }

  private setupParticles() {
    const particlesGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(this.amount * 3).fill(0)
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )

    const pixelPosition = new Float32Array(this.amount * 2)
    for (let index = 0; index < this.amount; index++) {
      pixelPosition[index * 2 + 0] = (index % this.texSize[0]) / this.texSize[0]
      pixelPosition[index * 2 + 1] =
        Math.floor(index / this.texSize[0]) / this.texSize[1]
    }
    particlesGeometry.setAttribute(
      'aPixelPosition',
      new THREE.BufferAttribute(pixelPosition, 2)
    )

    this.particlesShader = new THREE.ShaderMaterial({
      fragmentShader: particlesFragment,
      vertexShader: particlesVertex,
      uniforms: {
        uSize: { value: 40 },
        uFbo: { value: null },
        uDebugColor: { value: false },
      },
    })
    this.particlesShader.visible = false

    const particles = new THREE.Points(particlesGeometry, this.particlesShader)
    this.output.add(particles)
  }

  private genTexture(mesh: THREE.Mesh) {
    const sampler = new MeshSurfaceSampler(mesh)
    sampler.build()

    const position = new THREE.Vector3()

    const positions = new Float32Array(this.amount * 4)
    for (let index = 0; index < this.amount; index++) {
      sampler.sample(position)
      positions[index * 4 + 0] /* x */ = Math.random()
      positions[index * 4 + 1] /* y */ = Math.random()
      positions[index * 4 + 2] /* z */ = Math.random()
      positions[index * 4 + 3] /* w */ = Math.random()
    }
    const texture = new THREE.DataTexture(
      positions,
      this.texSize[0],
      this.texSize[1],
      THREE.RGBAFormat,
      THREE.FloatType
    )
    texture.magFilter = THREE.NearestFilter
    texture.needsUpdate = true
    return texture
  }

  private setupGPGPU() {
    this.gpgpuShader = new THREE.ShaderMaterial({
      uniforms: {
        uFbo: { value: null },
        uInitFbo: { value: null },
        uColorToAdd: { value: new THREE.Color(0x000000) },
        uReset: { value: false },
        uStepSize: { value: 0.1 },
      },
      fragmentShader: gpgpuFragment,
      vertexShader: gpgpuVertex,
    })

    this.gpgpu = new GPGPU({
      renderer: this.context.renderer,
      size: new THREE.Vector2().fromArray(this.texSize),
      shader: this.gpgpuShader,
    })
  }

  private updateTextures = () => {
    ;(this.secondStatePlane.material as THREE.MeshBasicMaterial).map = (
      this.gpgpu as any
    ).targetA.texture
    ;(this.firstStatePlane.material as THREE.MeshBasicMaterial).map = (
      this.gpgpu as any
    ).targetB.texture
    this.particlesShader.uniforms.uFbo.value = (
      this.gpgpu as any
    ).targetB.texture
  }

  private render = () => {
    this.gpgpu.render()
    this.updateTextures()
  }

  private tickValue: number = 0
  public tick(_: number, deltaTime: number) {
    if (this.animate) {
      this.tickValue += deltaTime
      this.gpgpuShader.uniforms.uStepSize.value =
        0.01 * Math.cos(this.tickValue / 2)
      this.params.colorToAdd = `hsl(${remap(
        Math.cos(this.tickValue),
        [-1, 1],
        [0, 360]
      )}, 100%, 50%)`
      this.context.gui.refresh()
      this.render()
    }
  }
}
