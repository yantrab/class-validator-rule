import * as ts from "typescript";
import { NoPropertysWalker } from "../src/noPropertyWithoutDecoratorRule";
import Project, { ImportDeclaration } from "ts-morph";
export function compile(sourceFile: ts.SourceFile) {
  compileNode(sourceFile);
  function compileNode(node: ts.Node) {

    
    if (node.kind === ts.SyntaxKind.PropertyDeclaration) {
      const program = ts.createProgram([node.getSourceFile().fileName],{
        noEmitOnError: true,
        noImplicitAny: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS
      })
      const fileLines:string[] = node.getSourceFile().text.split('\n');
      const importDeclarationIndex = fileLines.findIndex(row => row.startsWith('import') && row.includes('class-validator'))
      const importDeclaration =fileLines[importDeclarationIndex];
      console.log(node);
    }
    if (node.kind === ts.SyntaxKind.StringLiteral) {
      console.log(node);

    }
    if (node.kind === ts.SyntaxKind.TypeLiteral) {
      console.log(node);

    }
    if (node.kind === ts.SyntaxKind.TypeParameter) {
      console.log(node);

    }

    ts.forEachChild(node, compileNode);
  }
}