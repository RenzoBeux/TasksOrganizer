import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveMemberDto {
    @ApiProperty({ description: 'The ID of the user to remove' })
    @IsString()
    userId: string;
} 