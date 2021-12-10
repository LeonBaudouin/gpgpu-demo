import AbstractObject from '../abstract/AbstractObject'
import modelUrl from '../../../models/500.glb'
import * as THREE from 'three'

export default class Particules extends AbstractObject {
  constructor(context) {
    super(context)
    console.log(modelUrl)
    this.output = new THREE.Group()
  }

  tick(time, deltaTime) {}
}
