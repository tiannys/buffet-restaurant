import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePackageDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    @Type(() => Number)
    @Min(0)
    adult_price: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    @Type(() => Number)
    @Min(0)
    child_price: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    @Min(1)
    duration_minutes: number;

    @IsUUID()
    @IsOptional()
    parent_package_id?: string;

    @IsUUID()
    @IsNotEmpty()
    branch_id: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    sort_order?: number;
}
