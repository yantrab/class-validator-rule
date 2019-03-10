import * as ts from "typescript";
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
      let root:ts.Node = node.parent;
      while (root.parent) root = root.parent
      const importDeclerationNode = 
      root
      .getChildren()[0]
      .getChildren()
      .find(node => node.kind ===  ts.SyntaxKind.ImportDeclaration && node.getText().includes('class-validator'));
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