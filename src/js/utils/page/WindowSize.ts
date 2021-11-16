import observableState, { ObservableState } from '../observableState'

export default class WindowSize {
  public state: ObservableState<{ width: number; height: number }>

  constructor() {
    window.addEventListener('resize', this.handleChange)
    this.state = observableState({ width: window.innerWidth, height: window.innerHeight })
  }

  private handleChange = () => {
    this.state.width = window.innerWidth
    this.state.height = window.innerHeight
  }

  destroy() {
    window.removeEventListener('resize', this.handleChange)
  }
}
