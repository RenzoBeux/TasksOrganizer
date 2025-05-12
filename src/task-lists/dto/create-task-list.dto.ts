import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskListDto {
    @ApiProperty({ description: 'The name of the task list' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Optional description of the task list', required: false })
    @IsString()
    @IsOptional()
    description?: string;
} 