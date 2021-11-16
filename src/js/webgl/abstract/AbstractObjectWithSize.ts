import { WebGLAppContext } from '..'
import WindowSize from '../../utils/page/WindowSize'
import AbstractObject from './AbstractObject'

export default abstract class AbstractObjectWithSize<
  T extends WebGLAppContext = WebGLAppContext
> extends AbstractObject<T> {
  protected windowSize = new WindowSize()

  constructor(context: T) {
    super(context)
    this.handleResize = this.handleResize.bind(this)
    this.toUnbind(this.windowSize.state.__onChange('height', this.handleResize))
  }

  private handleResize() {
    const { width, height } = this.windowSize.state
    this.onResize(width, height)
  }

  protected onResize(width: number, height: number) {}
}
