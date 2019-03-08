import {IsString, IsEnum, IsNumber, IsBoolean, IsDate, ValidateNested, IsOptional} from 'class-validator'
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
    @ValidateNested({ each: true })
    enumArray: Color[];

    @ValidateNested()
    object: SomeObject;
    @ValidateNested({ each: true })
    objectArray: SomeObject[];
}
