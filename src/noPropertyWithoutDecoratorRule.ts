import * as Lint from "tslint";
import * as ts from "typescript";
const decorators: any = {};
decorators[ts.SyntaxKind.StringKeyword] = { name: "@IsString(", replacement: "@IsString()" };
decorators[ts.SyntaxKind.NumberKeyword] = { name: "@IsNumber(", replacement: "@IsNumber()" };
decorators.Date = { name: "@IsDate(", replacement: "@IsDate()" };

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
        const text = node.getFullText();
        let decorator = decorators[node.type.kind];
        if (decorator) {
            return this.checkAndAddFailure(node, decorator);
        }
        const nodeType = (node.type as any).typeName;
        if (nodeType) {
            decorator = decorators[nodeType.text];
            if (decorator) {
                return this.checkAndAddFailure(node, decorator);
            }
        }
        super.visitPropertyDeclaration(node);
    }

    private checkAndAddFailure(node: ts.PropertyDeclaration, decorator) {
        const text = node.getFullText();
        if (text.includes(decorator.name)) { return; }
        const fix =
            new Lint.Replacement(node.getStart(), node.getWidth(), decorator.replacement + "()/n" + node.getFullText());
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING, fix));
        super.visitPropertyDeclaration(node);
    }
}
