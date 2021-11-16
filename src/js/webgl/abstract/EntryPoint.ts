import { WebGLAppContext } from '..'
import AbstractObject from './AbstractObject'
import * as THREE from 'three'

class EntryPoint<T extends WebGLAppContext = WebGLAppContext> extends AbstractObject<T> {
  public output: THREE.Object3D

  private children: AbstractObject[] = []

  constructor(context: T) {
    super(context)

    this.output = new THREE.Group()
  }

  public addWithContext<O extends AbstractObject<T>>(constructor: (context: T) => O) {
    const newObject = constructor(this.context)
    this.add(newObject)
    return newObject
  }

  public add(object: AbstractObject<T>) {
    this.children.push(object)
    this.output.add(object.output)
  }

  public remove(object: AbstractObject<T>) {
    object.destroy()
    const index = this.children.indexOf(object)
    this.children.splice(index, 1)
    this.output.remove(object.output)
  }

  public tick(...params: Parameters<AbstractObject['tick']>) {
    for (const child of this.children) child.tick(...params)
  }
}

export default EntryPoint
