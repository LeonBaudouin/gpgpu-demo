import { FolderApi } from '@tweakpane/core'
import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import observableState from '../../utils/observableState'
import AbstractObject from '../abstract/AbstractObject'
import GPGPU from '../GPGPU'
import { MainSceneContext } from '../Scenes/MainScene'
import gpgpuFragment from './gpgpu.frag'
import gpgpuVertex from './gpgpu.vert'
import particlesFragment from './particles.frag'
import particlesVertex from './particles.vert'
import Text from './Text'
import gsap from 'gsap'
import remap from '../../utils/math/remap'

export default class Particules extends AbstractObject<MainSceneContext> {
  private gpgpu: GPGPU
  private text: Text

  private gpgpuShader: THREE.ShaderMaterial
  private particlesShader: THREE.ShaderMaterial

  private debugPlane: THREE.Mesh
  private gui: FolderApi

  private amount = 64 * 64
  private texSize = [64, 64]

  private params = observableState({
    lifespan: { min: 0, max: 12.25 },
    color: '#ff5555',
    edges: { min: -2.26, max: 2.48 },
    rotation: new THREE.Euler(0, -0.2, 0.7),
    progress: 0,
  })

  constructor(context: MainSceneContext) {
    super(context)
    this.output = new THREE.Group()
    this.setupGPGPU()
    this.setupParticles()
    this.setupGUI()

    this.debugPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(),
      new THREE.MeshBasicMaterial({ map: new THREE.Texture() })
    )
    this.debugPlane.visible = false
    this.output.add(this.debugPlane)

    new GLTFLoader()
      .loadAsync(require('../../../models/500.glb').default)
      .then((gltf: GLTF) => {
        const mesh = gltf.scene.getObjectByName('600_final') as THREE.Mesh
        const { position, normal } = this.genTexture(
          // sphere
          mesh
        )
        this.gpgpu.updateInitTexture(position)
        this.gpgpuShader.uniforms.uInitTexture.value = position
        this.gpgpuShader.uniforms.uNormals.value = normal
        this.text = new Text(context, this.params, mesh.geometry, this.gui)
        this.output.add(this.text.output)
      })
      .catch(console.error)
  }

  private setupParticles() {
    const origGeometry = new THREE.PlaneGeometry()
    origGeometry.scale(0.002, 0.002, 0.002)
    // origGeometry.scale(0.5, 0.5, 0.5)
    const geometry = new THREE.InstancedBufferGeometry()
    geometry.instanceCount = this.amount
    Object.keys(origGeometry.attributes).forEach((attributeName) => {
      geometry.attributes[attributeName] =
        origGeometry.attributes[attributeName]
    })
    geometry.index = origGeometry.index
    const index = new Float32Array(this.amount)
    for (let i = 0; i < this.amount; i++) index[i] = i
    geometry.setAttribute(
      'aIndex',
      new THREE.InstancedBufferAttribute(index, 1, false)
    )
    const pixelPosition = new Float32Array(this.amount * 2)
    for (let index = 0; index < this.amount; index++) {
      pixelPosition[index * 2 + 0] = (index % this.texSize[0]) / this.texSize[0]
      pixelPosition[index * 2 + 1] =
        Math.floor(index / this.texSize[0]) / this.texSize[1]
    }
    geometry.setAttribute(
      'aPixelPosition',
      new THREE.InstancedBufferAttribute(pixelPosition, 2)
    )
    const uvOffset = new Float32Array(this.amount * 2)
    for (let index = 0; index < this.amount; index++) {
      uvOffset[index * 2 + 0] = Math.random()
      uvOffset[index * 2 + 1] = Math.random()
    }
    geometry.setAttribute(
      'aUvOffset',
      new THREE.InstancedBufferAttribute(uvOffset, 2)
    )
    const loader = new THREE.TextureLoader()
    // this.particlesShader = new THREE.MeshBasicMaterial() as any
    this.particlesShader = new THREE.ShaderMaterial({
      fragmentShader: particlesFragment,
      // fragmentShader: f,
      vertexShader: particlesVertex,
      // vertexShader: v,
      uniforms: {
        uSize: { value: 10 },
        uFbo: { value: null },
        uPreviousFbo: { value: null },
        uColor: { value: new THREE.Color(this.params.color) },
        uTexture: {
          value: loader.load(
            require('../../../textures/noise.jpg').default,
            (t) => {
              t.wrapS = THREE.MirroredRepeatWrapping
              t.wrapT = THREE.MirroredRepeatWrapping
            }
          ),
        },
        uRamp: {
          value: loader.load(require('../../../textures/ramp3.png').default),
        },
      },
      side: THREE.DoubleSide,
      // transparent: true,
      // blending: THREE.AdditiveBlending,
      // visible: false,
    })
    const particles = new THREE.InstancedMesh(
      geometry,
      this.particlesShader,
      this.amount
    )
    particles.count = this.amount

    geometry.drawRange.count = this.amount
    console.log(particles)
    // particles.frustumCulled = false
    this.output.add(particles)
  }

  // const particlesGeometry = new THREE.BufferGeometry()

  // const positions = new Float32Array(this.amount * 3).fill(0)
  // particlesGeometry.setAttribute(
  //   'position',
  //   new THREE.BufferAttribute(positions, 3)
  // )

  // const pixelPosition = new Float32Array(this.amount * 2)
  // for (let index = 0; index < this.amount; index++) {
  //   pixelPosition[index * 2 + 0] = (index % this.texSize[0]) / this.texSize[0]
  //   pixelPosition[index * 2 + 1] =
  //     Math.floor(index / this.texSize[0]) / this.texSize[1]
  // }
  // particlesGeometry.setAttribute(
  //   'aPixelPosition',
  //   new THREE.BufferAttribute(pixelPosition, 2)
  // )

  // const loader = new THREE.TextureLoader()
  // this.particlesShader = new THREE.ShaderMaterial({
  //   fragmentShader: particlesFragment,
  //   vertexShader: particlesVertex,
  //   uniforms: {
  //     uSize: { value: 10 },
  //     uFbo: { value: null },
  //     uColor: { value: new THREE.Color(this.params.color) },
  //     uTexture: {
  //       value: loader.load(require('../../../textures/particle.png').default),
  //     },
  //     uRamp: {
  //       value: loader.load(require('../../../textures/ramp.png').default),
  //     },
  //   },
  //   transparent: true,
  //   // blending: THREE.AdditiveBlending,
  //   // visible: false,
  // })

  // const particles = new THREE.Points(particlesGeometry, this.particlesShader)
  // particles.frustumCulled = false
  // this.output.add(particles)

  private genTexture(mesh: THREE.Mesh) {
    const sampler = new MeshSurfaceSampler(mesh)
    sampler.build()

    const position = new THREE.Vector3()
    const normal = new THREE.Vector3()

    const normals = new Float32Array(this.amount * 4)
    const positions = new Float32Array(this.amount * 4)
    for (let index = 0; index < this.amount; index++) {
      sampler.sample(position, normal)
      normals[index * 4 + 0] /* x */ = normal.x
      normals[index * 4 + 1] /* y */ = normal.y
      normals[index * 4 + 2] /* z */ = normal.z
      normals[index * 4 + 3] /* w */ = 0
      positions[index * 4 + 0] /* x */ = position.x
      positions[index * 4 + 1] /* y */ = position.y
      positions[index * 4 + 2] /* z */ = position.z
      positions[index * 4 + 3] /* w */ = -1
    }
    const normalTexture = new THREE.DataTexture(
      normals,
      this.texSize[0],
      this.texSize[1],
      THREE.RGBAFormat,
      THREE.FloatType
    )
    normalTexture.magFilter = THREE.NearestFilter
    normalTexture.needsUpdate = true
    const positionTex = new THREE.DataTexture(
      positions,
      this.texSize[0],
      this.texSize[1],
      THREE.RGBAFormat,
      THREE.FloatType
    )
    positionTex.magFilter = THREE.NearestFilter
    positionTex.needsUpdate = true
    return { position: positionTex, normal: normalTexture }
  }

  private setupGPGPU() {
    this.gpgpuShader = new THREE.ShaderMaterial({
      uniforms: {
        uFbo: { value: null },
        uDeltaTime: { value: 0 },
        uTime: { value: 0 },
        uInitTexture: { value: null },
        uNormals: { value: null },
        uNoiseScale: { value: 0.65 },
        uLifeSpan: {
          value: new THREE.Vector2(
            this.params.lifespan.min,
            this.params.lifespan.max
          ),
        },
        uSpeed: { value: 0.17 },
        uBurnDirection: {
          value: new THREE.Quaternion().setFromEuler(this.params.rotation),
        },
        uProgress: {
          value: this.params.edges.min,
        },
      },
      fragmentShader: gpgpuFragment,
      vertexShader: gpgpuVertex,
    })

    this.gpgpu = new GPGPU({
      renderer: this.context.renderer,
      size: new THREE.Vector2().fromArray(this.texSize),
      shader: this.gpgpuShader,
    })
    this.params.__onChange(
      'progress',
      (v) =>
        (this.gpgpuShader.uniforms.uProgress.value = remap(
          v,
          [0, 1],
          [this.params.edges.min, this.params.edges.max]
        ))
    )
    this.params.__onChange('rotation', (v) => {
      this.gpgpuShader.uniforms.uBurnDirection.value.setFromEuler(v)
    })
  }

  private setupGUI() {
    this.gui = this.context.gui.addFolder({ title: 'Particles' })

    this.gui.addInput(this.params, 'edges', { min: -5, max: 5 })
    this.gui
      .addInput(this.params, 'rotation')
      .on('change', () => this.params.__trigger('rotation'))
    let anim: gsap.core.Tween
    this.gui.addButton({ title: 'Trigger' }).on('click', () => {
      if (anim) anim.kill()
      this.params.progress = 0
      anim = gsap.to(this.params, { progress: 1, duration: 15, ease: 'linear' })
    })

    const gpgpuFolder = this.gui.addFolder({ title: 'GPGPU' })
    gpgpuFolder
      .addInput(this.params, 'lifespan', { min: 0, max: 20, label: 'Lifespan' })
      .on('change', ({ value: { min, max } }) =>
        this.gpgpuShader.uniforms.uLifeSpan.value.set(min, max)
      )
    gpgpuFolder.addInput(this.gpgpuShader.uniforms.uSpeed, 'value', {
      min: 0,
      max: 1,
      label: 'Speed',
    })
    gpgpuFolder.addInput(this.gpgpuShader.uniforms.uNoiseScale, 'value', {
      min: 0,
      max: 10,
      label: 'NoiseScale',
    })

    const materialFolder = this.gui.addFolder({ title: 'Particles' })
    materialFolder.addInput(this.particlesShader.uniforms.uSize, 'value', {
      label: 'Size',
    })
    materialFolder
      .addInput(this.params, 'color', {
        label: 'Color',
        picker: 'inline',
        expanded: true,
      })
      .on('change', ({ value }) =>
        this.particlesShader.uniforms.uColor.value.set(value)
      )
  }

  public tick(time: number, deltaTime: number) {
    this.gpgpuShader.uniforms.uDeltaTime.value = deltaTime
    this.gpgpuShader.uniforms.uTime.value = time

    this.gpgpu.render()
    ;(this.debugPlane.material as THREE.MeshBasicMaterial).map = (
      this.gpgpu as any
    ).targetA.texture
    // this.particlesShader.uniforms.uFbo.value
    this.particlesShader.uniforms.uPreviousFbo.value = (
      this.gpgpu as any
    ).targetA.texture
    this.particlesShader.uniforms.uFbo.value = this.gpgpu.outputTexture
    if (this.text) this.text.tick(time, deltaTime)
  }
}
