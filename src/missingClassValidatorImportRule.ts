import * as Lint from 'tslint';
import * as ts from 'typescript';
import { Project } from 'ts-morph';
const classValidatorDecorators = ['IsString', 'IsNumber', 'IsBoolean', 'IsDate', 'IsEnum', 'ValidateNested', 'IsOptional'];

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Missing class validator imports!';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        // if (!sourceFile.getSourceFile.name.endsWith(".model.ts")) { return; }
        return this.applyWithWalker(new NoPropertysWalker(sourceFile, this.getOptions()));
    }
}

// tslint:disable-next-line: max-classes-per-file
export class NoPropertysWalker extends Lint.RuleWalker {
    public visitPropertyDeclaration(node: ts.PropertyDeclaration) {

        const decorators = node.decorators;
        if (!decorators) { return; }
        const decorator =
            classValidatorDecorators
                .find(d => !!decorators.find(dd => (dd.expression as any).expression.getText() === d));
        if (!decorator) { return; }

        let root: ts.Node = node.parent;
        while (root.parent) { root = root.parent; }
        let fix;
        const importDeclerationNode =
            root
                .getChildren()[0]
                .getChildren()
// tslint:disable-next-line: no-shadowed-variable
                .find(node => node.kind === ts.SyntaxKind.ImportDeclaration && node.getText().includes('class-validator'));
        if (!importDeclerationNode) {
            fix = new Lint.Replacement(0, 0,  `import { ${decorator} } from 'class-validator'` + '\n');
        } else {
            const importDeclerationText = importDeclerationNode.getText();
            if (importDeclerationText.includes(decorator)) { return; }
            fix = new Lint.Replacement(importDeclerationNode.getStart(),
             importDeclerationNode.getWidth(),
             importDeclerationText.replace('import {', 'import { ' + decorator));
        }

        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING, fix));
        super.visitPropertyDeclaration(node);
    }
}
