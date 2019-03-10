# class-validator-rule
## Strongly typed validation
It is possible to do strongly typed validation with [class-validator](https://github.com/typestack/class-validator).

### example
This class 
```typescript
enum Color { Red, Green, Blue }
class SomeObject {
    string?: string;
}
class Model {
    color: Color;
    string: string;
    number: number;
    boolean: boolean;
    date: Date;

    stringArray: string[];
    numberArray: number[];
    booleanArray: boolean[];
    dateArray: Date[];
    enumArray: Color[];

    object: SomeObject;
    objectArray: SomeObject[];
}
```
should decorate like:
```typescript
enum Color { Red, Green, Blue }
class SomeObject {
    @IsOptional()
    @IsString()
    string?: string;
}
class Model {
    @IsEnum(Color)
    color: Color;
    @IsString()
    string: string;
    @IsNumber()
    number: number;
    @IsBoolean()
    boolean: boolean;
    @IsDate()
    date: Date;

    @IsString({ each: true })
    stringArray: string[];
    @IsNumber({},{ each: true })
    numberArray: number[];
    @IsBoolean({ each: true })
    booleanArray: boolean[];
    @IsDate({ each: true })
    dateArray: Date[];
    @IsEnum(Color,{ each: true })
    enumArray: Color[];

    @ValidateNested()
    object: SomeObject;
    @ValidateNested({ each: true })
    objectArray: SomeObject[];
}
```
This rule reminds you to add the correct decorator and can fix your models.

## Get started
### install rule with dev flag:
```
npm i tslint-class-validator-role -D
```

### tslint
Add tslint configoration to you root model folder
```json
{
    "rulesDirectory": ["tslint-class-validator-rule"],
    "rules": {
        "no-property-without-decorator":true
    }
}
```
fix
```
tslint -p . --fix 
```

### Add middleware (nestjs)
```typescript
 app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true }));
 ```
#### TODO
##### - Add imports
##### - file/folder name option, to support '**/*model.ts'

