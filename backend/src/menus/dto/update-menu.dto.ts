import { IsString, IsOptional, IsUUID, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateMenuDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsOptional()
    category_id?: string;

    @IsUUID()
    @IsOptional()
    package_id?: string;

    @IsString()
    @IsOptional()
    image_url?: string;

    @IsUUID()
    @IsOptional()
    branch_id?: string;

    @IsBoolean()
    @IsOptional()
    is_available?: boolean;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;

    @IsInt()
    @IsOptional()
    @Min(0)
    sort_order?: number;

    @IsInt()
    @IsOptional()
    @Min(0)
    stock_quantity?: number | null;

    @IsInt()
    @IsOptional()
    @Min(0)
    low_stock_threshold?: number | null;
}
