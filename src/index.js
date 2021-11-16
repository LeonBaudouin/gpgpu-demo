import '@style/index.scss'
import Stats from 'stats.js'
import WebGL from './js/webgl'

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

const webgl = new WebGL(document.querySelector('#three-canvas'))

raf()

function raf() {
  stats.begin()
  webgl.tick()
  stats.end()
  requestAnimationFrame(raf)
}
