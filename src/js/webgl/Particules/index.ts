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

export default class Particules extends AbstractObject<MainSceneContext> {
  private gpgpu: GPGPU

  private gpgpuShader: THREE.ShaderMaterial
  private particlesShader: THREE.ShaderMaterial
  private debugPlane: THREE.Mesh

  private amount = 256 * 256
  private texSize = [256, 256]

  constructor(context: MainSceneContext) {
    super(context)
    this.output = new THREE.Group()
    this.setupGPGPU()
    this.setupParticles()

    this.debugPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(),
      new THREE.MeshBasicMaterial({ map: new THREE.Texture() })
    )
    this.debugPlane.visible = false
    this.output.add(this.debugPlane)

    new GLTFLoader().load(
      require('../../../models/500.glb').default,
      (gltf: GLTF) => {
        const texture = this.genTexture(
          gltf.scene.getObjectByName('final') as THREE.Mesh
        )
        this.gpgpu.updateInitTexture(texture)
        this.gpgpuShader.uniforms.uInitTexture.value = texture
      }
    )
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
        uSize: { value: 20 },
        uFbo: { value: null },
      },
    })

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
      positions[index * 4 + 0] /* x */ = position.x
      positions[index * 4 + 1] /* y */ = position.y
      positions[index * 4 + 2] /* z */ = position.z
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
        uDeltaTime: { value: 0 },
        uInitTexture: { value: null },
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

  public tick(_: number, deltaTime: number) {
    this.gpgpuShader.uniforms.uDeltaTime.value = deltaTime

    this.gpgpu.render()
    ;(this.debugPlane.material as THREE.MeshBasicMaterial).map =
      this.gpgpu.outputTexture
    this.particlesShader.uniforms.uFbo.value = this.gpgpu.outputTexture
  }
}
