/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */
import { TriggerOpTypes } from '../../v3'
import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * 拦截数组的变异方法（如 push、pop 等），以便当数组被修改时，Vue 可以检测到这些变化并相应地更新视图
 */
methodsToPatch.forEach(function (method) {
  // 缓存原始的数组方法，以便在拦截方法中调用
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator(...args) {
    // 调用原始数组方法并获取结果
    const result = original.apply(this, args)
    // :获取数组的观察者对象
    const ob = this.__ob__
    let inserted
    // push、unshift、splice存在新元素加入的情况
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 对新元素进行观察
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 通知所有依赖（订阅者）数组已经发生变化
    if (__DEV__) {
      ob.dep.notify({
        type: TriggerOpTypes.ARRAY_MUTATION,
        target: this,
        key: method
      })
    } else {
      ob.dep.notify()
    }
    return result
  })
})
