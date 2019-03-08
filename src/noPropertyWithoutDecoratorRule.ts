import * as Lint from "tslint";
import * as ts from "typescript";
import { Project } from 'ts-morph'
const decorators: any = {};
decorators[ts.SyntaxKind.StringKeyword] = {
    name: "IsString",
    replacement: "@IsString()",
    arrayReplacement: "@IsString({ each: true })",
};
decorators[ts.SyntaxKind.NumberKeyword] = {
    name: "IsNumber", replacement: "@IsNumber()",
    arrayReplacement: "@IsNumber({},{ each: true })",
};
decorators[ts.SyntaxKind.BooleanKeyword] = {
    name: "IsBoolean", replacement: "@IsBoolean()",
    arrayReplacement: "@IsBoolean({ each: true })",
};
decorators.Date = {
    name: "IsDate", replacement: "@IsDate()",
    arrayReplacement: "@IsDate({ each: true })",
};
decorators.enum = {
    name: "IsEnum", replacement: "@IsEnum()",
    arrayReplacement: "@IsEnum({ each: true })",
};

decorators.object = {
    name: "ValidateNested",
    replacement: "@ValidateNested()",
    arrayReplacement: "@ValidateNested({ each: true })",
};

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "Property declaration without type decorator!";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        if (!sourceFile.fileName.endsWith(".model.ts")) { return; }
        return this.applyWithWalker(new NoPropertysWalker(sourceFile, this.getOptions()));
    }
}

// tslint:disable-next-line: max-classes-per-file
export class NoPropertysWalker extends Lint.RuleWalker {
    public visitPropertyDeclaration(node: ts.PropertyDeclaration) {
        const type = node.type;
        let decorator = decorators[type.kind];
        if (decorator) {
            return this.checkAndAddFailure(node, decorator);
        }
        const typeReferance = (node.type as any).typeName;
        if (typeReferance) {
            decorator = decorators[typeReferance.text];
            if (decorator) {
                return this.checkAndAddFailure(node, decorator);
            }
            if (this.isEnum(node)) {
                decorator = { ...decorators.enum }
                decorator.replacement = decorator.replacement.replace('()', `(${typeReferance.text})`)
                return this.checkAndAddFailure(node, decorator);
            }
            else {
                return this.checkAndAddFailure(node, decorators.object);
            }
        }
        const arrayType = (node.type as any).elementType;
        if (arrayType) {
            decorator = decorators[arrayType.kind];
            if (decorator) {
                return this.checkAndAddFailure(node, decorator, true);
            }
            const typeReferance = (arrayType as any).typeName;
            if (typeReferance) {
                decorator = decorators[typeReferance.text];
                if (decorator) {
                    return this.checkAndAddFailure(node, decorator, true);
                }
                if (this.isEnum(node)) {
                    decorator = { ...decorators.enum }
                    decorator.arrayReplacement = decorator.arrayReplacement.replace('({', `(${typeReferance.text},{`)
                    return this.checkAndAddFailure(node, decorator, true);
                }
                else {
                    return this.checkAndAddFailure(node, decorators.object, true);
                }
            }
        }
        super.visitPropertyDeclaration(node);
    }

    private checkAndAddFailure(node: ts.PropertyDeclaration, decorator, isArray = false) {
        const rows = node.getFullText().split('\n')
        const lastRow = rows[rows.length - 1]
        const spaces = lastRow.search(/\S|$/)
        const text = ' '.repeat(spaces) + node.getText()
        const replacement = !isArray ? decorator.replacement : decorator.arrayReplacement
        const decorators = node.decorators;//[0].expression.expression.getText()
        
        if (node.questionToken) {
            const hasOptionalDecorator = decorators && decorators.find(d => (d.expression as any).expression.getText() == 'IsOptional')
            if (!hasOptionalDecorator) {
                const fix = new Lint.Replacement(node.getStart(), node.getWidth(), '@IsOptional()' + '\n' + text)
                this.addFailure(this.createFailure(node.getStart(), node.getWidth(), 'Property is marked as optional without IsOptional decorator!', fix))
            }
        }

        const acceptedDecorator = !decorators ? undefined : decorators.find(d => (d.expression as any).expression.getText() == decorator.name)
        if (acceptedDecorator) { return }
        //let fileText = node.getSourceFile().text;
        //fileText = fileText.replace(node.getText(), ' '.repeat(spaces) + replacement + '\n' + node.getText())
        //let fileLines: string[] = fileText.split('\n');
        //const importDeclarationIndex = fileLines.findIndex(row => row.startsWith('import') && row.includes('class-validator'))
        //const existNecessaryImport = importDeclarationIndex !== -1 && fileLines[importDeclarationIndex].includes(decorator.name)

        let fix;
        // if (!existNecessaryImport) {
        //     if (importDeclarationIndex === -1) {
        //         fileLines = [`import { ${decorator.name} } from 'class-validator'`, ...fileLines];
        //     }
        //     else {
        //         fileLines[importDeclarationIndex] =
        //             fileLines[importDeclarationIndex].replace('import {', 'import { ' + decorator.name + ', ')
        //     }
        //     fix =
        //         new Lint.Replacement(node.getSourceFile().getStart(),
        //             node.getSourceFile().getWidth(), fileLines.join('\n'))
        // }
        // else {
        fix = new Lint.Replacement(node.getStart(), node.getWidth(), replacement + '\n' + text)
        //}

        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING, fix))
        super.visitPropertyDeclaration(node)
    }

    private isEnum(node: ts.PropertyDeclaration) {
        const project = new Project({ compilerOptions: { outDir: '' } });
        const sf = project.addExistingSourceFile(node.getSourceFile().fileName);
        return sf.getClass(node.parent.name.text).getProperty(node.name.getText()).getType().isEnum();
    }
}
