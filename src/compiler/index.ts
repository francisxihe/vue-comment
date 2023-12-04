import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'
import { CompilerOptions, CompiledResult } from 'types/compiler'

// `createCompilerCreator` 允许创建使用不同的解析器/优化器/codegen，例如 SSR 优化编译器
// 这里我们只是使用默认部分导出默认编译器
export const createCompiler = createCompilerCreator(function baseCompile(
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 将HTML转换为AST
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    // 对ast进行优化
    optimize(ast, options)
  }
  // 根据优化后的AST生成最终的代码
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
