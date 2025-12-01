import { IsString, IsOptional, IsUUID, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateCategoryDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsOptional()
    branch_id?: string;

    @IsInt()
    @IsOptional()
    @Min(0)
    sort_order?: number;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
