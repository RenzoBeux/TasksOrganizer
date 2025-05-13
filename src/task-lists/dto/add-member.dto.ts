import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AddMemberDto {
    @ApiProperty({ description: 'The ID of the user to add' })
    @IsString()
    userId: string;

    @ApiProperty({ description: 'Role for the user', enum: Role })
    @IsEnum(Role)
    role: Role;
} 