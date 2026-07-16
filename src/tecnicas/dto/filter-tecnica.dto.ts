import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterTecnicaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  gi?: boolean;

  @IsOptional()
  @IsString()
  tag?: string;
}
