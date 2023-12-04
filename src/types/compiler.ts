import { BindingMetadata } from 'sfc/types'

export type CompilerOptions = {
  warn?: Function // allow customizing warning in different environments; e.g. node
  modules?: Array<ModuleOptions> // platform specific modules; e.g. style; class
  /** 定义平台特定的指令 */
  directives?: { [key: string]: Function } 
  /** 列出应被视为静态的 AST 属性，用于优化 */
  staticKeys?: string // a list of AST properties to be considered static; for optimization
  /** 检查一个标签是否为单标签 */
  isUnaryTag?: (tag: string) => boolean | undefined 
  /** 检查一个标签是否可以不闭合 */
  canBeLeftOpenTag?: (tag: string) => boolean | undefined 
  /** 检查一个标签是否为平台原生标签 */
  isReservedTag?: (tag: string) => boolean | undefined 
  /** 是否保留元素之间的空白（已弃用） */
  preserveWhitespace?: boolean // preserve whitespace between elements? (Deprecated)
  /** 空白处理策略 */
  whitespace?: 'preserve' | 'condense' 
  /** 是否优化静态内容 */
  optimize?: boolean 

  // web specific
  mustUseProp?: (tag: string, type: string | null, name: string) => boolean // check if an attribute should be bound as a property
  isPreTag?: (attr: string) => boolean | null // check if a tag needs to preserve whitespace
  getTagNamespace?: (tag: string) => string | undefined // check the namespace for a tag
  /** false针对非web构建 */
  expectHTML?: boolean 
  isFromDOM?: boolean
  shouldDecodeTags?: boolean
  shouldDecodeNewlines?: boolean
  shouldDecodeNewlinesForHref?: boolean
  outputSourceRange?: boolean
  shouldKeepComment?: boolean

  // region 运行时用户可配置选项
  /** 定义模板分隔符 */
  delimiters?: [string, string] // template delimiters
  /** 是否保留模板中的注释 */
  comments?: boolean 
  // endregion

  /** 针对 SSR 优化编译器的选项，用于SSR优化的作用域ID。 */
  scopeId?: string

  // SFC analyzed script bindings from `compileScript()`
  bindings?: BindingMetadata
}

export type WarningMessage = {
  msg: string
  start?: number
  end?: number
}

export type CompiledResult = {
  ast: ASTElement | null
  render: string
  staticRenderFns: Array<string>
  stringRenderFns?: Array<string>
  errors?: Array<string | WarningMessage>
  tips?: Array<string | WarningMessage>
}

export type ModuleOptions = {
  // transform an AST node before any attributes are processed
  // returning an ASTElement from pre/transforms replaces the element
  preTransformNode?: (el: ASTElement) => ASTElement | null | void
  // transform an AST node after built-ins like v-if, v-for are processed
  transformNode?: (el: ASTElement) => ASTElement | null | void
  // transform an AST node after its children have been processed
  // cannot return replacement in postTransform because tree is already finalized
  postTransformNode?: (el: ASTElement) => void
  genData?: (el: ASTElement) => string // generate extra data string for an element
  transformCode?: (el: ASTElement, code: string) => string // further transform generated code for an element
  staticKeys?: Array<string> // AST properties to be considered static
}

export type ASTModifiers = { [key: string]: boolean }
export type ASTIfCondition = { exp: string | null; block: ASTElement }
export type ASTIfConditions = Array<ASTIfCondition>

export type ASTAttr = {
  name: string
  value: any
  dynamic?: boolean
  start?: number
  end?: number
}

export type ASTElementHandler = {
  value: string
  params?: Array<any>
  modifiers: ASTModifiers | null
  dynamic?: boolean
  start?: number
  end?: number
}

export type ASTElementHandlers = {
  [key: string]: ASTElementHandler | Array<ASTElementHandler>
}

export type ASTDirective = {
  name: string
  rawName: string
  value: string
  arg: string | null
  isDynamicArg: boolean
  modifiers: ASTModifiers | null
  start?: number
  end?: number
}

export type ASTNode = ASTElement | ASTText | ASTExpression

export type ASTElement = {
  type: 1
  tag: string
  attrsList: Array<ASTAttr>
  attrsMap: { [key: string]: any }
  rawAttrsMap: { [key: string]: ASTAttr }
  parent: ASTElement | void
  children: Array<ASTNode>

  start?: number
  end?: number

  processed?: true

  static?: boolean
  staticRoot?: boolean
  staticInFor?: boolean
  staticProcessed?: boolean
  hasBindings?: boolean

  text?: string
  attrs?: Array<ASTAttr>
  dynamicAttrs?: Array<ASTAttr>
  props?: Array<ASTAttr>
  plain?: boolean
  pre?: true
  ns?: string

  component?: string
  inlineTemplate?: true
  transitionMode?: string | null
  slotName?: string | null
  slotTarget?: string | null
  slotTargetDynamic?: boolean
  slotScope?: string | null
  scopedSlots?: { [name: string]: ASTElement }

  ref?: string
  refInFor?: boolean

  if?: string
  ifProcessed?: boolean
  elseif?: string
  else?: true
  ifConditions?: ASTIfConditions

  for?: string
  forProcessed?: boolean
  key?: string
  alias?: string
  iterator1?: string
  iterator2?: string

  staticClass?: string
  classBinding?: string
  staticStyle?: string
  styleBinding?: string
  events?: ASTElementHandlers
  nativeEvents?: ASTElementHandlers

  transition?: string | true
  transitionOnAppear?: boolean

  model?: {
    value: string
    callback: string
    expression: string
  }

  directives?: Array<ASTDirective>

  forbidden?: true
  once?: true
  onceProcessed?: boolean
  wrapData?: (code: string) => string
  wrapListeners?: (code: string) => string

  // 2.4 ssr optimization
  ssrOptimizability?: number
}

export type ASTExpression = {
  type: 2
  expression: string
  text: string
  tokens: Array<string | Object>
  static?: boolean
  // 2.4 ssr optimization
  ssrOptimizability?: number
  start?: number
  end?: number
}

export type ASTText = {
  type: 3
  text: string
  static?: boolean
  isComment?: boolean
  // 2.4 ssr optimization
  ssrOptimizability?: number
  start?: number
  end?: number
}
