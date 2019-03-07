import * as Lint from "tslint";
import * as ts from "typescript";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "property declaration without type decorator";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        if (!sourceFile.fileName.endsWith(".model.ts")) { return; }
        return this.applyWithWalker(new NoPropertysWalker(sourceFile, this.getOptions()));
    }
}

// The walker takes care of all the work.
// tslint:disable-next-line: max-classes-per-file
export class NoPropertysWalker extends Lint.RuleWalker {
    public visitPropertyDeclaration(node: ts.PropertyDeclaration) {
        if (!node.decorators) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
            return super.visitPropertyDeclaration(node);
        }
        const type = node.type;
        super.visitPropertyDeclaration(node);
    }
}
