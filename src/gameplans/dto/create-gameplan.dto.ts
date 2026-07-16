import { IsString, IsNotEmpty, IsArray, IsNumber } from 'class-validator';

export class CreateGamePlanDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsArray()
  @IsString({ each: true })
  tecnicasIds!: string[];
}
