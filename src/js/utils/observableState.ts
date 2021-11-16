type Callback<T, K extends keyof T> = (prop: T[K], prevProp: T[K] | null) => void

type OnChange<T> = <K extends keyof T>(propName: K, cb: Callback<T, K>, triggerOnBind?: boolean) => () => void

type Trigger<T> = <K extends keyof T>(propName: K) => void

export type ObservableState<T> = {
  __onChange: OnChange<T>
  __trigger: Trigger<T>
} & T

const observableState = <T extends {}>(defaultState: T): ObservableState<T> => {
  // Proxy state for setter handling
  const cbMap = new Map<string | number | symbol, Callback<T, any>[]>()

  const handler: ProxyHandler<ObservableState<T>> = {
    set(obj, propName: string, value: any) {
      const prevValue = (obj as Record<string, any>)[propName]
      ;(obj as Record<string, any>)[propName] = value
      for (const cb of cbMap.get(propName) || []) cb(value, prevValue)
      return true
    },
  }

  const extendedState = {
    // Detect shallow update of the object used as input
    // Doesn't work for deep changes: array or object propery
    __onChange: <K extends keyof T>(propName: K, cb: Callback<T, K>, triggerOnBind: boolean = false) => {
      if (!cbMap.has(propName)) cbMap.set(propName, [])
      cbMap.get(propName)?.push(cb)
      if (triggerOnBind && propName in proxy) cb(proxy[propName], null)

      return () => {
        const arr = cbMap.get(propName)
        if (arr == undefined) return
        const index = arr.indexOf(cb)
        arr.splice(index, 1)
        if (arr.length === 0) cbMap.delete(propName)
      }
    },
    // Method to use to manually trigger event for a given property
    __trigger: <K extends keyof T>(propName: K) => {
      for (const cb of cbMap.get(propName) || []) cb(proxy[propName], proxy[propName])
    },
    ...defaultState,
  }

  const proxy = new Proxy(extendedState, handler)

  return proxy
}

export default observableState
