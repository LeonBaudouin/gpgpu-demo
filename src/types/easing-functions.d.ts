declare module 'easing-functions' {
  type Easing = {
    In: (p: number) => number
    Out: (p: number) => number
    InOut: (p: number) => number
  }

  type LinearEasing = {
    None: (p: number) => number
  }

  const content: {
    Linear: LinearEasing
    Quadratic: Easing
    Cubic: Easing
    Quartic: Easing
    Quintic: Easing
    Sinusoidal: Easing
    Exponential: Easing
    Circular: Easing
    Elastic: Easing
    Back: Easing
    Bounce: Easing
  }

  export default content
}
