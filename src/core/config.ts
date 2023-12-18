import { no, noop, identity } from 'shared/util'

import { LIFECYCLE_HOOKS } from 'shared/constants'
import type { Component } from 'types/component'

/**
 * @internal
 */
export interface Config {
  // user
  /** 自定义选项合并策略的对象 */ 
  optionMergeStrategies: { [key: string]: Function }
  /** 设置为 `true` 时，Vue 将不会显示所有的警告信息  */
  silent: boolean
  /** 设置为 `false` 可以阻止 Vue 在启动时生成生产提示  */
  productionTip: boolean
  /** 启用性能追踪  */
  performance: boolean
  /** 允许 Vue.js devtools 检查应用  */
  devtools: boolean
  /** 自定义处理捕获到的错误的函数  */
  errorHandler?: (err: Error, vm: Component | null, info: string) => void
  /** 自定义处理 Vue 警告的函数  */
  warnHandler?: (msg: string, vm: Component | null, trace: string) => void
  /** 可以使 Vue 忽略在 Vue 外部定义的自定义元素  */
  ignoredElements: Array<string | RegExp>
  /** 自定义键盘事件的别名  */
  keyCodes: { [key: string]: number | Array<number> }

  // platform
  /** 检查给定的标签是否是保留的标签 */ 
  isReservedTag: (x: string) => boolean | undefined
  /** 检查给定的属性是否是保留的属性 */ 
  isReservedAttr: (x: string) => true | undefined
  /** 处理特定平台的标签名 */ 
  parsePlatformTagName: (x: string) => string
  /** 检查是否是未知的元素 */ 
  isUnknownElement: (x: string) => boolean
  /** 获取元素的命名空间 */ 
  getTagNamespace: (x: string) => string | undefined
  /** 检查是否必须使用属性而不是属性绑定 */ 
  mustUseProp: (tag: string, type?: string | null, name?: string) => boolean

  // private
  /** 设置组件的更新策略，当为 `true` 时，组件的更新是异步的。 */
  async: boolean

  // legacy
  /** 定义 Vue 实例生命周期钩子的数组。 */
  _lifecycleHooks: Array<string>
}

export default {
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: __DEV__,

  /**
   * Whether to enable devtools
   */
  devtools: __DEV__,

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   * watcher 错误处理方法
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
} as unknown as Config
