import type VNode from 'core/vdom/vnode'
import type { Component } from 'types/component'

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 * 将原始子 VNode 解析为槽对象的功能函数
 * @param children 父组件传递给子组件的所有子节点
 * @param context 当前组件的上下文
 * @returns 
 */
export function resolveSlots(
  children: Array<VNode> | null | undefined,
  context: Component | null
): { [key: string]: Array<VNode> } {
  // children 如果为空或没有元素说明没有子节点，意味着没有插槽内容直接返回一个空对象
  if (!children || !children.length) {
    return {}
  }
  const slots: Record<string, any> = {}
  // 遍历子节点
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    const data = child.data
    // 一旦解析为插槽移除slot属性
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }
    // 检查子节点是否具有与当前上下文相匹配的 context 或 fnContext，确保只处理属于当前上下文的节点
    if (
      (child.context === context || child.fnContext === context) &&
      data &&
      data.slot != null
    ) {
      const name = data.slot
      const slot = slots[name] || (slots[name] = [])
      if (child.tag === 'template') {
        // 如果待插入节点是 <template> 标签，它的子节点会被加入到对应的插槽数组中
        slot.push.apply(slot, child.children || [])
      } else {
        // 直接加入待插入节点本身
        slot.push(child)
      }
    } else {
      ;(slots.default || (slots.default = [])).push(child)
    }
  }
  // 遍历slots属性
  for (const name in slots) {
    // 如果一个插槽只包含空白节点（如纯文本空白节点），则该插槽会被删除。
    if (slots[name].every(isWhitespace)) {
      delete slots[name]
    }
  }
  return slots
}

function isWhitespace(node: VNode): boolean {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}
