# class-validator-rule
## Strongly types validation
It is possible to do strongly type validation with class-validator.

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
should be
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


#Get started
install rule with dev flag:
```
npm i tslint-class-validator-role -D
```
