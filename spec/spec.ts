import { expect } from 'chai';
import * as ts from 'typescript'
import { compile } from './compiler'
import { readFileSync } from 'fs';
import { resolve } from 'path'
describe('suppress', function () {

  it('premitives test', function () {
    const fileName = resolve('./spec/models/primitiveTypes.model.ts');
    let sourceFile = ts.createSourceFile(
      fileName,
      readFileSync(fileName).toString(),
      ts.ScriptTarget.ES2015,
      /*setParentNodes */ true
    );

    compile(sourceFile);
  });
});