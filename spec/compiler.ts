import * as ts from "typescript";
import { NoPropertysWalker } from "../src/noPropertyWithoutDecoratorRule";
export function compile(sourceFile: ts.SourceFile) {
  compileNode(sourceFile);
  function compileNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.PropertyDeclaration) {
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