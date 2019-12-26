import * as Lint from 'tslint';
import * as ts from 'typescript';
import { Project } from 'ts-morph';
const decorators: any = {};
decorators[ts.SyntaxKind.StringKeyword] = {
    name: 'IsString',
    replacement: '@IsString()',
    arrayReplacement: '@IsString({ each: true })',
};
decorators[ts.SyntaxKind.NumberKeyword] = {
    name: 'IsNumber', replacement: '@IsNumber()',
    arrayReplacement: '@IsNumber({},{ each: true })',
};
decorators[ts.SyntaxKind.BooleanKeyword] = {
    name: 'IsBoolean', replacement: '@IsBoolean()',
    arrayReplacement: '@IsBoolean({ each: true })',
};
decorators.Date = {
    name: 'IsDate', replacement: '@IsDate()',
    arrayReplacement: '@IsDate({ each: true })',
};
decorators.enum = {
    name: 'IsEnum', replacement: '@IsEnum()',
    arrayReplacement: '@IsEnum({ each: true })',
};

decorators.object = {
    name: 'ValidateNested',
    replacement: '@ValidateNested()',
    arrayReplacement: '@ValidateNested({ each: true })',
};

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = 'Property declaration without type decorator!';

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoPropertysWalker(sourceFile, this.getOptions()));
    }
}

// tslint:disable-next-line: max-classes-per-file
export class NoPropertysWalker extends Lint.RuleWalker {
    public visitPropertyDeclaration(node: ts.PropertyDeclaration) {
        const type = node.type;
        if (!type) {
            return;
        }
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
            if (this.isEnum(node.getSourceFile().fileName, node.parent.name.text, node.name.getText())) {
                decorator = { ...decorators.enum };
                decorator.replacement = decorator.replacement.replace('()', `(${typeReferance.text})`);
                return this.checkAndAddFailure(node, decorator);
            } else {
                return this.checkAndAddFailure(node, decorators.object);
            }
        }
        const arrayType = (node.type as any).elementType;
        if (arrayType) {
            decorator = decorators[arrayType.kind];
            if (decorator) {
                return this.checkAndAddFailure(node, decorator, true);
            }
            // tslint:disable-next-line: no-shadowed-variable
            const typeReferance = (arrayType as any).typeName;
            if (typeReferance) {
                decorator = decorators[typeReferance.text];
                if (decorator) {
                    return this.checkAndAddFailure(node, decorator, true);
                }
                if (this.isEnumArray(node.getSourceFile().fileName, node.parent.name.text, (node as any).name.getText())) {
                    decorator = { ...decorators.enum };
                    decorator.arrayReplacement = decorator.arrayReplacement.replace('({', `(${typeReferance.text},{`);
                    return this.checkAndAddFailure(node, decorator, true);
                } else {
                    return this.checkAndAddFailure(node, decorators.object, true);
                }
            }
        }
        super.visitPropertyDeclaration(node);
    }

    private checkAndAddFailure(node: ts.PropertyDeclaration, decorator, isArray = false) {
        const text = node.getText();
        const replacement = !isArray ? decorator.replacement : decorator.arrayReplacement;
        const nodeDecorators = node.decorators;
        const needAddIsOptional = node.questionToken
            && (!nodeDecorators || !nodeDecorators.find(d => (d.expression as any).expression.getText() === 'IsOptional'));
        const acceptedDecorator = !nodeDecorators ? undefined :
            nodeDecorators.find(d => (d.expression as any).expression.getText() === decorator.name);
        if (acceptedDecorator) {
            if (needAddIsOptional) {
                const msg = 'Property is marked as optional without IsOptional decorator!';
                const fix = new Lint.Replacement(node.getStart(), node.getWidth(), ' ' + '@IsOptional()' + ' ' + text);
                this.addFailureAt(node.getStart(), node.getWidth(), msg, fix);
            }
        } else {
            let replacementText = replacement + ' ' + text;
            if (needAddIsOptional) {
                replacementText = '@IsOptional()'  + ' ' + replacementText;
            }
            const fix = new Lint.Replacement(node.getStart(), node.getWidth(), replacementText);
            this.addFailureAt(node.getStart(), node.getWidth(), Rule.FAILURE_STRING, fix);
        }
        super.visitPropertyDeclaration(node);
    }

    private isEnum(fileName: string, className: string, propertyName: string) {
        const project = new Project({ compilerOptions: { outDir: '' } });
        const sf = project.addExistingSourceFile(fileName);
        return sf.getClass(className).getProperty(propertyName).getType().isEnum();
    }

    private isEnumArray(fileName: string, className: string, propertyName: string) {
        const project = new Project({ compilerOptions: { outDir: '' } });
        const sf = project.addExistingSourceFile(fileName);
        return sf.getClass(className).getProperty(propertyName).getType().getArrayType().isEnum();
    }
}
