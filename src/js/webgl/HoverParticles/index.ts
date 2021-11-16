// import { watchEffect, Ref } from 'vue'
// import * as THREE from 'three'
// import { MainSceneContext } from '../Scenes/MainScene'
// import DOMRectTo3D from '~/utils/webgl/DOMRectTo3D'
// import findMinimumTexSize from '~~/utils/webgl/findMinimumTexSize'
// import { getPositionTextureFromBox } from '~~/utils/webgl/getPositionTexture'
// import GPGPU from '../GPGPU'
// import gpgpuFragment from './gpgpu.frag?raw'
// import gpgpuVertex from './gpgpu.vert?raw'
// import particleFragment from './particle.frag?raw'
// import particleVertex from './particle.vert?raw'
// import DOMPosTo3D from '~~/utils/webgl/DOMPosTo3D'
// import cremap from '~~/utils/math/cremap'
// import { FolderApi } from '@tweakpane/core'
// import observableState from '~~/utils/observableState'
// import addFolder from '~~/utils/tweakpane/addFolder'
// import AbstractObjectWithSize from '../abstract/AbstractObjectWithSize'

// const tempVector1 = new THREE.Vector3()
// const tempVector2 = new THREE.Vector3()

// const maxIdleTime = 2

// export default class HoverParticles extends AbstractObjectWithSize<MainSceneContext> {
//   private folder: FolderApi

//   private rectMesh: THREE.Mesh
//   private particleMesh: THREE.Points

//   private startTexture: THREE.Texture
//   private particleAmount = 1000 // 64 * 64
//   private gpgpu: GPGPU
//   private gpgpuMaterial: THREE.ShaderMaterial
//   private lastMousePosition = new THREE.Vector3()

//   private params = observableState({
//     size: 15,
//     production: 0.04,
//     lifeSpan: { min: 1.4, max: 1.7 },
//     speed: { min: 0.006, max: 0.008 },
//     noiseSize: 5,
//     noiseSpeed: 1,
//   })

//   private _show: boolean = false
//   private idleTime: number = 0

//   private get show(): boolean {
//     return this._show
//   }
//   private set show(v: boolean) {
//     const lastShow = this._show
//     this._show = v
//     if (lastShow !== this._show) this.onShowUpdate(v)
//   }

//   private get texSize(): [number, number] {
//     return findMinimumTexSize(this.particleAmount)
//   }

//   private genBox = new THREE.Box3(new THREE.Vector3(-1000), new THREE.Vector3(-1000))

//   constructor(context: MainSceneContext, domRect: Ref<DOMRect>) {
//     super(context)

//     this.gui()

//     const particleGeom = this.genGeometry()
//     const particleMaterial = new THREE.ShaderMaterial({
//       fragmentShader: particleFragment,
//       vertexShader: particleVertex,
//       uniforms: {
//         uSize: { value: this.params.size },
//         uPosTexture: { value: null },
//         uTexture: { value: new THREE.TextureLoader().load('/particle.png') },
//       },
//       transparent: true,
//       depthWrite: false,
//     })
//     this.params.__onChange('size', (v) => (particleMaterial.uniforms.uSize.value = v))

//     this.particleMesh = new THREE.Points(particleGeom, particleMaterial)

//     this.gpgpuMaterial = new THREE.ShaderMaterial({
//       fragmentShader: gpgpuFragment,
//       vertexShader: gpgpuVertex,
//       uniforms: {
//         uFbo: { value: null },
//         uMousePosition: { value: new THREE.Vector3(-100, -100, -100) },
//         uMouseSpeed: { value: 0 },
//         uInitTexture: { value: null },
//         uTime: { value: 0 },
//         uDeltaTime: { value: 0 },
//         uBoxCenter: { value: new THREE.Vector3() },
//         uLifeSpan: { value: new THREE.Vector2(this.params.lifeSpan.min, this.params.lifeSpan.max) },
//         uSpeed: { value: new THREE.Vector2(this.params.speed.min, this.params.speed.max) },
//         uNoiseSize: { value: this.params.noiseSize },
//         uNoiseSpeed: { value: this.params.noiseSpeed },
//       },
//     })
//     this.params.__onChange('lifeSpan', ({ min, max }) => this.gpgpuMaterial.uniforms.uLifeSpan.value.set(min, max))
//     this.params.__onChange('speed', ({ min, max }) => this.gpgpuMaterial.uniforms.uSpeed.value.set(min, max))
//     this.params.__onChange('noiseSize', (v) => (this.gpgpuMaterial.uniforms.uNoiseSize.value = v))
//     this.params.__onChange('noiseSpeed', (v) => (this.gpgpuMaterial.uniforms.uNoiseSpeed.value = v))

//     this.gpgpu = new GPGPU({ renderer: this.context.renderer, size: new THREE.Vector2(...this.texSize), shader: this.gpgpuMaterial })

//     this.rectMesh = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial({ map: new THREE.Texture() }))
//     this.output = new THREE.Object3D()
//     this.output.add(
//       // this.rectMesh, //---
//       this.particleMesh //---
//     )

//     this.toUnbind(watchEffect(() => this.onRectResize(domRect.value)))
//     window.addEventListener('mousemove', this.onMouseMove)
//   }

//   private genGeometry() {
//     const geometry = new THREE.BufferGeometry()

//     // positions
//     const positions = new THREE.BufferAttribute(new Float32Array(this.particleAmount * 3).fill(0), 3)
//     geometry.setAttribute('position', positions)

//     const pixelPos = new Float32Array(this.particleAmount * 2)
//     for (let i = 0; i < this.particleAmount; i++) {
//       pixelPos[i * 2] = (i % this.texSize[0]) / this.texSize[0]
//       pixelPos[i * 2 + 1] = Math.floor(i / this.texSize[0]) / this.texSize[1]
//     }
//     geometry.setAttribute('aPixelPosition', new THREE.BufferAttribute(pixelPos, 2, false))

//     return geometry
//   }

//   private onMouseMove = (e: MouseEvent) => {
//     const y = e.clientY + (this.context.$ASScroll()?.currentPos || 0)
//     const mousePosition = DOMPosTo3D([e.clientX, y], this.context.viewport(), this.windowSize)
//     this.gpgpuMaterial.uniforms.uMousePosition.value.fromArray(mousePosition)

//     const mouse: THREE.Vector3 = this.gpgpuMaterial.uniforms.uMousePosition.value
//     const center = this.genBox.getCenter(tempVector1)
//     const size = this.genBox.getSize(tempVector2)
//     const maxSize = Math.max(...size.toArray())
//     const shouldShow = mouse.distanceTo(center) < maxSize / 2 + 0.2
//     this.show = shouldShow
//     if (shouldShow) this.idleTime = 0
//   }

//   private onRectResize = (rect: DOMRect | undefined) => {
//     const params3d = DOMRectTo3D(rect, this.context.viewport(), this.windowSize)
//     params3d.scale[0] *= 0.9
//     params3d.scale[1] *= 0.5
//     params3d.scale[2] = 0.02
//     const size = tempVector1.set(...params3d.scale)
//     const center = tempVector2.set(...params3d.position)

//     // this.mesh.scale.set(this.context.viewport.width, this.context.viewport.height, 0)
//     this.rectMesh.scale.fromArray(params3d.scale)
//     this.rectMesh.position.fromArray(params3d.position)

//     this.genBox.setFromCenterAndSize(center, size)
//     this.startTexture.dispose()
//     this.startTexture = getPositionTextureFromBox(this.texSize, this.genBox, this.particleAmount, -1)

//     this.gpgpu.updateInitTexture(this.startTexture)
//     this.gpgpuMaterial.uniforms.uInitTexture.value = this.startTexture
//     this.gpgpuMaterial.uniforms.uBoxCenter.value.copy(center)
//   }

//   private onShowUpdate(v: boolean) {
//     this.particleMesh.visible = v
//   }

//   private gui() {
//     const parent = addFolder(this.context, { title: 'Glowing' })
//     this.folder = parent.addFolder({ title: 'Particles' })

//     this.folder.addInput(this.params, 'size', { min: 0, max: 40 })
//     this.folder.addInput(this.params, 'production', { step: 0.01 })
//     this.folder.addInput(this.params, 'noiseSize')
//     this.folder.addInput(this.params, 'noiseSpeed', { min: 0, max: 3 })
//     this.folder.addInput(this.params, 'lifeSpan', { min: 0, max: 3, step: 0.01 }).on('change', () => this.params.__trigger('lifeSpan'))
//     this.folder
//       .addInput(this.params, 'speed', { min: 0.002, max: 0.015, step: 0.0001, format: (v) => (v * 100).toFixed(2) })
//       .on('change', () => this.params.__trigger('speed'))
//   }

//   tick(time: number, delta: number) {
//     this.idleTime += delta
//     this.show = this.idleTime < maxIdleTime

//     const currMousePos = this.gpgpuMaterial.uniforms.uMousePosition.value
//     const speed = this.lastMousePosition.sub(currMousePos).length() * delta
//     this.lastMousePosition.copy(currMousePos)
//     this.gpgpuMaterial.uniforms.uMouseSpeed.value = cremap(speed, [0, 0.02], [0, this.params.production])

//     this.gpgpuMaterial.uniforms.uTime.value = time
//     this.gpgpuMaterial.uniforms.uDeltaTime.value = delta

//     if (!this.show) return
//     this.gpgpu.render()
//     ;(this.rectMesh.material as THREE.MeshBasicMaterial).map = this.gpgpu.getBuffer().texture
//     ;(this.particleMesh.material as THREE.ShaderMaterial).uniforms.uPosTexture.value = this.gpgpu.getBuffer().texture
//   }

//   destroy() {
//     super.destroy()
//     this.gpgpu.dispose()
//     this.rectMesh.geometry.dispose()
//     ;(this.rectMesh.material as THREE.MeshBasicMaterial).dispose()
//     this.particleMesh.geometry.dispose()
//     ;(this.particleMesh.material as THREE.ShaderMaterial).dispose()
//     this.gpgpuMaterial.dispose()
//     this.startTexture.dispose()
//     window.removeEventListener('mousemove', this.onMouseMove)
//   }
// }
