import * as ts from "typescript";
import { NoPropertysWalker } from "../src/noPropertyWithoutDecoratorRule";
export function compile(sourceFile: ts.SourceFile) {
  compileNode(sourceFile);
  function compileNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.PropertyDeclaration) {
      console.log(node);
      new NoPropertysWalker(sourceFile,
        { ruleArguments: [], disabledIntervals: [], ruleName: "", ruleSeverity: "off" })
        .visitPropertyDeclaration(node as ts.PropertyDeclaration);
    }

    ts.forEachChild(node, compileNode);
  }
}