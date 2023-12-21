import config from '../config'
import VNode, { createEmptyVNode } from './vnode'
import { createComponent } from './create-component'
import { traverse } from '../observer/traverse'

import {
  warn,
  isDef,
  isUndef,
  isArray,
  isTrue,
  isObject,
  isPrimitive,
  resolveAsset,
  isFunction
} from '../util/index'

import { normalizeChildren, simpleNormalizeChildren } from './helpers/index'
import type { Component } from 'types/component'
import type { VNodeData } from 'types/vnode'

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

/**
 * 创建虚拟节点（VNode）的包装函数，提供更灵活的调用方式
 * @param {Component} context - 表示组件的上下文，通常是当前 Vue 组件的实例
 * @param {any} tag - 表示要创建的标签名，可以是字符串（如 'div'）、组件对象或函数。
 * @param {any} data - 包含了该节点的属性、指令、事件监听器等数据.
 * @param {any} children - 子虚拟节点（VNodes）数组。
 * @param {any} normalizationType - 规范化类型，用于确定如何规范化子节点。
 * @param {boolean} alwaysNormalize - 用于判断是否总是进行规范化处理。
 */
export function createElement(
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  // 判断 data 类型
  // 因为data值是对象，如果是数组、number等其他类型，说明调用时没有传递 data 参数，只传递了 children
  if (isArray(data) || isPrimitive(data)) {
    // 将 children 和 normalizationType 参数向前移动一位。
    normalizationType = children
    children = data
    data = undefined
  }
  // 如果 alwaysNormalize 为真
  if (isTrue(alwaysNormalize)) {
    // 将 normalizationType 设置为常量 ALWAYS_NORMALIZE
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}

/**
 * 创建虚拟节点（VNode）的核心函数
 * @param {Component} context - 表示组件的上下文，通常是当前 Vue 组件的实例
 * @param {any} tag - 表示要创建的标签名，可以是字符串（如 'div'）、组件对象或函数。
 * @param {any} data - 包含了该节点的属性、指令、事件监听器等数据.
 * @param {any} children - 子虚拟节点（VNodes）数组。
 * @param {any} normalizationType - 规范化类型，用于确定如何规范化子节点。
 */
export function _createElement(
  context: Component,
  tag?: string | Component | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  // data 如果是已经被 Vue 的响应式系统观察，直接返回空节点
  if (isDef(data) && isDef((data as any).__ob__)) {
    __DEV__ &&
      warn(
        `Avoid using observed data object as vnode data: ${JSON.stringify(
          data
        )}\n` + 'Always create fresh vnode data objects in each render!',
        context
      )
    return createEmptyVNode()
  }
  // v-bind 中的对象语法
  // 如果 data 对象定义了 is 属性，则使用 is 的值作为标签名
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  // 如果没有提供标签名（tag），则返回一个空的虚拟节点。
  if (!tag) {
    return createEmptyVNode()
  }
  // key值非原始类型，警告
  if (__DEV__ && isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
    warn(
      'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
      context
    )
  }
  // 支持单函数子项作为默认作用域插槽
  // 如果 children 是一个数组并且第一个值为函数的，该函数作为默认的作用域插槽
  if (isArray(children) && isFunction(children[0])) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  // 对children进行规范化处理
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  // 如果 tag 是字符串
  if (typeof tag === 'string') {
    let Ctor
    // 定义命名空间（ns），先取上下文的 context.$vnode.ns，如果不存在使用 config.getTagNamespace(tag) 方法来获取标签的命名空间。
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    // 如果是平台保留tag（HTML or SVG）
    if (config.isReservedTag(tag)) {
      // 如果  data 对象定义了 nativeOn 属性且该元素不是组件，则发出警告
      if (
        __DEV__ &&
        isDef(data) &&
        isDef(data.nativeOn) &&
        data.tag !== 'component'
      ) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      // 使用 new VNode 创建一个新的虚拟节点
      vnode = new VNode(
        config.parsePlatformTagName(tag),
        data,
        children,
        undefined,
        undefined,
        context
      )
    } 
    else if (
      (!data || !data.pre) &&
      isDef((Ctor = resolveAsset(context.$options, 'components', tag)))
    ) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(tag, data, children, undefined, undefined, context)
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag as any, data, context, children)
  }

  if (isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}

/** 处理命名空间 */
function applyNS(vnode, ns, force?: boolean) {
  vnode.ns = ns
  // 如果是foreignObject标签
  if (vnode.tag === 'foreignObject') {
    // 清除当前的命名空间，即使用默认命名空间，并强制使用它
    ns = undefined
    force = true
  }
  // 如果虚拟节点有子节点
  if (isDef(vnode.children)) {
    // 遍历每个子节点
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      // 如果child.tag是有标签的节点 并且没有命名空间或者 force 为真且节点不是 svg
      // foreignObject可以包裹html标签，这种情况下，内部标签应该作为普通标签而非svg命名空间内的标签处理
      if (
        isDef(child.tag) &&
        (isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))
      ) {
        // 递归地调用 applyNS 来应用命名空间
        applyNS(child, ns, force)
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
/** 
 * 注册递归绑定 
 * 在 Vue.js 中，响应式系统通常只追踪对象的第一层属性，
 * 这样如果 style 和 class 如果是对象的的话，内部属性发生变化也不会触发视图的更新
 * 需要通过registerDeepBindings解决这个问题
 */
function registerDeepBindings(data) {
  // 如果data.style是个对象
  if (isObject(data.style)) {
    // 递归地访问data.style的所有属性
    // 如果 style 对象的内部属性发生变化，Vue 会检测到这些变化并重新渲染组件
    traverse(data.style)
  }
  // 同上
  if (isObject(data.class)) {
    traverse(data.class)
  }
}
