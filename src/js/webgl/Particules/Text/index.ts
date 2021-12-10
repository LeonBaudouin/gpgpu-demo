import AbstractObject from '../../abstract/AbstractObject'
import { MainSceneContext } from '../../Scenes/MainScene'
import * as THREE from 'three'
import textFragment from './index.frag'
import textVertex from './index.vert'
import { FolderApi } from 'tweakpane'
import remap from '../../../utils/math/remap'
import { ObservableState } from '../../../utils/observableState'
import Particules from '..'

export default class Text extends AbstractObject<MainSceneContext> {
  private textShader: THREE.ShaderMaterial

  constructor(
    context: MainSceneContext,
    state: Particules['params'],
    geometry: THREE.BufferGeometry,
    parentGUI: FolderApi
  ) {
    super(context)
    this.setupText(state, geometry)
  }

  private setupText(
    state: Particules['params'],
    geometry: THREE.BufferGeometry
  ) {
    this.textShader = new THREE.RawShaderMaterial({
      fragmentShader: textFragment,
      vertexShader: textVertex,
      uniforms: {
        uMatcap: {
          value: new THREE.TextureLoader().load(
            require('../../../../textures/matcap.png').default
          ),
        },
        uTime: { value: 0 },
        uProgress: { value: state.edges.min },
        uBurnDirection: {
          value: new THREE.Quaternion().setFromEuler(state.rotation),
        },
      },
      // transparent: true,
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geometry, this.textShader)
    this.output = mesh
    state.__onChange('rotation', (v) =>
      this.textShader.uniforms.uBurnDirection.value.setFromEuler(v)
    )
    state.__onChange(
      'progress',
      (v) =>
        (this.textShader.uniforms.uProgress.value = remap(
          v,
          [0, 1],
          [state.edges.min, state.edges.max]
        ))
    )
  }

  public tick(time: number, deltaTime: number) {
    this.textShader.uniforms.uTime.value = time
    // this.textShader.uniforms.uProgress.value = 0.5
  }
}
