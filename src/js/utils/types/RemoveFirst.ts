type RemoveFirst<T extends unknown[]> = T extends []
  ? []
  : T extends [any, ...infer R]
  ? [...R]
  : []

export default RemoveFirst
