import AbstractObject from '../abstract/AbstractObject'
import * as THREE from 'three'

export default class Particules extends AbstractObject {
  constructor(context, { scene }) {
    super(context)
    this.clock = this.context.clock
    this.renderer = this.context.renderer
    this.amount = 32 * 32

    this.output = new THREE.Group()
    this.output.add(scene)

    // Créer des particules à partir d'un géom préexistante
    this.material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })

    // Remplacer la géométrie par une custom
    // this.geometry = new THREE.IcosahedronBufferGeometry(2, 3)
    this.geometry = new THREE.BufferGeometry()
    const array = new Float32Array(this.amount * 3)
    
    for (let index = 0; index < this.amount; index++) {
      array[index * 3 + 0] = Math.random() - 0.5
      array[index * 3 + 1] = Math.random() - 0.5
      array[index * 3 + 2] = Math.random() - 0.5
    }
    this.positions = new THREE.BufferAttribute(array, 3)
    this.geometry.setAttribute('position', this.positions)


    // Setup le gpgpu -> Rendre une texture à l'écran

    // Utiliser cette texture pour placer les particules

    // Jouer avec le shader du GPGPU pour faire des trucs sympas qui bouge
    this.points = new THREE.Points(this.geometry, this.material)
    this.output.add(this.points)
  }

  tick(time, deltaTime) {}
}
