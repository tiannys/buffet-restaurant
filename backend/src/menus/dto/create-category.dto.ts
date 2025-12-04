import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsNotEmpty()
    branch_id: string;

    @IsInt()
    @IsOptional()
    @Min(0)
    sort_order?: number;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
