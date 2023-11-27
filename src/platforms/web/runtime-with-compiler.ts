import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import {
  shouldDecodeNewlines,
  shouldDecodeNewlinesForHref
} from './util/compat'
import type { Component } from 'types/component'
import type { GlobalAPI } from 'types/global-api'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 根据传入的el参数获取DOM元素
  el = el && query(el)

  // 判断获取到el对应的DOM元素如果是body或html元素时，抛出警告
  // Vue会将模板中的内容替换el对应的DOM元素，如果是body或html元素时，替换之后将会破坏整个DOM文档
  if (el === document.body || el === document.documentElement) {
    __DEV__ &&
      warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 处理用户没有手写render函数的情况
  if (!options.render) {
    let template = options.template
    // 存在template
    if (template) {
      if (typeof template === 'string') {
        // template是字符串并且以#开头，则认为template是id选择符，
        // 调用idToTemplate函数获取到选择符对应的DOM元素的innerHTML作为模板
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (__DEV__ && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      }
      // 判断它是不是一个DOM元素，如果是，则直接使用该DOM元素的innerHTML作为模板
      else if (template.nodeType) {
        template = template.innerHTML
      }
      // 既不是字符串，也不是DOM元素，抛出警告
      else {
        if (__DEV__) {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    }
    // 没有传入template选项，根据传入的el参数调用getOuterHTML函数获取外部模板
    else if (el) {
      // @ts-expect-error
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (__DEV__ && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: __DEV__,
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments
        },
        this
      )
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (__DEV__ && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML(el: Element): string {
  // 元素存在outerHTML
  if (el.outerHTML) {
    // 返回outerHTML
    return el.outerHTML
  } else {
    // 克隆元素并包裹在div中返回
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue as GlobalAPI
