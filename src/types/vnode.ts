import VNode from 'core/vdom/vnode'
import { Ref } from 'v3'
import { Component } from './component'
import { ASTModifiers } from './compiler'

/**
 * @internal
 */
export type VNodeChildren =
  | Array<null | VNode | string | number | VNodeChildren>
  | string

/**
 * @internal
 */
export type VNodeComponentOptions = {
  Ctor: typeof Component
  propsData?: Object
  listeners?: Record<string, Function | Function[]>
  children?: Array<VNode>
  tag?: string
}

/**
 * @internal
 */
export type MountedComponentVNode = VNode & {
  context: Component
  componentOptions: VNodeComponentOptions
  componentInstance: Component
  parent: VNode
  data: VNodeData
}

/**
 * @internal
 */
// interface for vnodes in update modules
export type VNodeWithData = VNode & {
  tag: string
  data: VNodeData
  children: Array<VNode>
  text: void
  elm: any
  ns: string | void
  context: Component
  key: string | number | undefined
  parent?: VNodeWithData
  componentOptions?: VNodeComponentOptions
  componentInstance?: Component
  isRootInsert: boolean
}

// // interface for vnodes in update modules
// export type VNodeWithData = {
//   tag: string;
//   data: VNodeData;
//   children: Array<VNode>;
//   text: void;
//   elm: any;
//   ns: string | void;
//   context: Component;
//   key: string | number | undefined;
//   parent?: VNodeWithData;
//   componentOptions?: VNodeComponentOptions;
//   componentInstance?: Component;
//   isRootInsert: boolean;
// };

/**
 * @internal
 */
export interface VNodeData {
  /**  用于标识 VNode 的唯一性，主要在虚拟 DOM 的更新过程中使用 */
  key?: string | number
  /**  定义这个 VNode 对应的插槽名 */
  slot?: string
  /**  用于注册引用信息，可以是字符串、一个 Ref 对象或一个回调函数 */
  ref?: string | Ref | ((el: any) => void)
  /**  用于动态组件，指定要使用的组件类型 */
  is?: string
  /**  标记静态节点预处理 */
  pre?: boolean
  /**  虚拟节点的标签名 */
  tag?: string
  /**  静态 class 字符串 */
  staticClass?: string
  /**  动态 class，可以是字符串、数组或对象 */
  class?: any
  /**  静态样式对象 */
  staticStyle?: { [key: string]: any }
  /**  动态样式，可以是字符串、数组或对象 */
  style?: string | Array<Object> | Object
  /**  规范化后的样式对象 */
  normalizedStyle?: Object
  /**  传递给组件的 props 对象 */
  props?: { [key: string]: any }
  /**  普通 HTML 属性 */
  attrs?: { [key: string]: string }
  /**  直接绑定到 DOM 元素上的属性 */
  domProps?: { [key: string]: any }
  /**  包含组件生命周期钩子的对象 */
  hook?: { [key: string]: Function }
  /**  组件事件监听器 */
  on?: { [key: string]: Function | Array<Function> }
  /**  原生事件监听器 */
  nativeOn?: { [key: string]: Function | Array<Function> }
  /**  过渡效果相关的数据 */
  transition?: Object
  /**  用于 v-show 指令的标记 */
  show?: boolean // marker for v-show
  /**  内联模板相关的选项 */
  inlineTemplate?: {
    render: Function
    staticRenderFns: Array<Function>
  }
  /**  Vue 指令数组 */
  directives?: Array<VNodeDirective>
  /**  用于 <keep-alive> 包裹的组件 */
  keepAlive?: boolean
  /**  作用域插槽 */
  scopedSlots?: { [key: string]: Function }
  /**  用于自定义组件的 v-model */
  model?: {
    value: any
    callback: Function
  }
  /** 自定义属性。 */
  [key: string]: any
}

/**
 * @internal
 */
export type VNodeDirective = {
  name: string
  rawName: string
  value?: any
  oldValue?: any
  arg?: string
  oldArg?: string
  modifiers?: ASTModifiers
  def?: Object
}

/**
 * @internal
 */
export type ScopedSlotsData = Array<
  { key: string; fn: Function } | ScopedSlotsData
>
