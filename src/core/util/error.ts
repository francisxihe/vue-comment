import config from '../config'
import { warn } from './debug'
import { inBrowser } from './env'
import { isPromise } from 'shared/util'
import { pushTarget, popTarget } from '../observer/dep'

/** 用于统一处理 Vue 实例（组件）中发生的错误，并且支持错误传播和全局错误处理。 */
export function handleError(err: Error, vm: any, info: string) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  // 暂停依赖追踪
  // 在处理错误处理程序时停用 deps 跟踪以避免可能的无限渲染。
  pushTarget()
  try {
    if (vm) {
      let cur = vm
      // 存在父组件时，并且父组件定义了errorCaptured钩子，执行错误钩子
      while ((cur = cur.$parent)) {
        const hooks = cur.$options.errorCaptured
        if (hooks) {
          for (let i = 0; i < hooks.length; i++) {
            try {
              // capture返回false，阻止继续向上冒泡
              const capture = hooks[i].call(cur, err, vm, info) === false
              if (capture) return
            } catch (e: any) {
              globalHandleError(e, cur, 'errorCaptured hook')
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info)
  } finally {
    // 恢复依赖追踪
    popTarget()
  }
}

/** 执行某个处理器（handler）函数时提供统一的错误处理机制。 */
export function invokeWithErrorHandling(
  handler: Function,
  context: any,
  args: null | any[],
  vm: any,
  info: string
) {
  let res
  try {
    res = args ? handler.apply(context, args) : handler.call(context)
    if (res && !res._isVue && isPromise(res) && !(res as any)._handled) {
      res.catch(e => handleError(e, vm, info + ` (Promise/async)`))
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      ;(res as any)._handled = true
    }
  } catch (e: any) {
    handleError(e, vm, info)
  }
  return res
}

/** 在 Vue 应用程序中处理未被捕获的错误。 */
function globalHandleError(err, vm, info) {
  // config.errorHandler 是否被定义，被定义则去执行config.errorHandler
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e: any) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler')
      }
    }
  }
  logError(err, vm, info)
}

/** 控制台打印错误 */
function logError(err, vm, info) {
  if (__DEV__) {
    warn(`Error in ${info}: "${err.toString()}"`, vm)
  }
  /* istanbul ignore else */
  if (inBrowser && typeof console !== 'undefined') {
    console.error(err)
  } else {
    throw err
  }
}
