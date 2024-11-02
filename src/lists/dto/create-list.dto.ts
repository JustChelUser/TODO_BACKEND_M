import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Length } from "class-validator";

export class createListDto {

    @ApiProperty({ example: 'Задачи на сегодня', description: 'Название списка задач' })
    @IsString({ message: 'Должно быть строкой' })
    @Length(1, 100, { message: 'Не меньше 1 и не больше 100 символов' })
    readonly name: string;

    @ApiProperty({ example: '1', description: 'Позиция списка среди других списков задач' })
    @IsOptional() @IsNumber({}, { message: 'Должно быть числом' })
    position?: number;

    @ApiProperty({ example: '1', description: 'Номер проекта в котором будет находиться список' })
    @IsNumber({}, { message: 'Должно быть числом' })
    readonly projectId: number;
}