function lerp(x: number, y: number, t: number) {
  return (1 - t) * x + t * y
}

export default lerp
