import { warn, invokeWithErrorHandling } from 'core/util/index'
import { cached, isUndef, isTrue, isArray } from 'shared/util'
import type { Component } from 'types/component'

const normalizeEvent = cached(
  (
    name: string
  ): {
    name: string
    once: boolean
    capture: boolean
    passive: boolean
    handler?: Function
    params?: Array<any>
  } => {
    const passive = name.charAt(0) === '&'
    name = passive ? name.slice(1) : name
    const once = name.charAt(0) === '~' // Prefixed last, checked first
    name = once ? name.slice(1) : name
    const capture = name.charAt(0) === '!'
    name = capture ? name.slice(1) : name
    return {
      name,
      once,
      capture,
      passive
    }
  }
)

export function createFnInvoker(
  fns: Function | Array<Function>,
  vm?: Component
): Function {
  // 内部定义的函数，当事件被触发时，它会被调用
  function invoker() {
    const fns = invoker.fns
    // 如果 fns 是一个数组
    if (isArray(fns)) {
      // 使用 fns.slice() 创建 fns 数组的副本，为了避免在迭代过程中修改原始数组。
      const cloned = fns.slice()
      // 遍历这个数组，并逐个调用数组中的函数
      for (let i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(
          cloned[i],
          null,
          arguments as any,
          vm,
          `v-on handler`
        )
      }
    }
    // 否则直接调用
    else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(
        fns,
        null,
        arguments as any,
        vm,
        `v-on handler`
      )
    }
  }
  invoker.fns = fns
  return invoker
}

export function updateListeners(
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Component
) {
  let name, cur, old, event
  // 遍历新的事件监听对象
  for (name in on) {
    // cur为当前事件名称的处理函数
    cur = on[name]
    // old为在旧的监听对象（oldOn）中对应的处理函数
    old = oldOn[name]
    // 将name标准化
    event = normalizeEvent(name)
    // 如果cur 即当前的处理函数未定义，会在开发模式下发出警告。
    if (isUndef(cur)) {
      __DEV__ &&
        warn(
          `Invalid handler for event "${event.name}": got ` + String(cur),
          vm
        )
    } 
    // 如果old未定义，说明这是一个新添加的事件监听器。
    else if (isUndef(old)) {
      // 如果需要包装处理函数
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm)
      }
      // 如果是一次性事件
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      add(event.name, cur, event.capture, event.passive, event.params)
    }
    // 如果cur和old不同，更新旧的处理函数为新的处理函数。 
    else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  // 历旧的事件监听对象
  for (name in oldOn) {
    // 如果在新的监听对象on中找不到对应的事件处理函数，说明该事件监听器已被移除，需要调用remove函数来移除它
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      remove(event.name, oldOn[name], event.capture)
    }
  }
}
