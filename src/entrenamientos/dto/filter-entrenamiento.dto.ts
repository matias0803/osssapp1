import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterEntrenamientoDto {
  @IsOptional()
  @IsString()
  fecha?: string;

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
  objetivo?: string;
}
