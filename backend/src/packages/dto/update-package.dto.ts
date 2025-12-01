import { IsString, IsOptional, IsNumber, IsUUID, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePackageDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    adult_price?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    child_price?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    duration_minutes?: number;

    @IsUUID()
    @IsOptional()
    parent_package_id?: string;

    @IsUUID()
    @IsOptional()
    branch_id?: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    sort_order?: number;
}
