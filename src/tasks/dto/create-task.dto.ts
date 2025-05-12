import { IsString, IsOptional, IsBoolean, IsDate, IsArray, IsNumber, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Frequency } from '@prisma/client';

class OrdinalWeekdayDto {
    @ApiProperty({ description: 'Day of week (0-6, where 0 is Sunday)' })
    @IsNumber()
    weekday: number;

    @ApiProperty({ description: 'Ordinal number (1-5)' })
    @IsNumber()
    ordinal: number;
}

export class CreateTaskDto {
    @ApiProperty({ description: 'The title of the task' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Optional description of the task', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Whether the task is recurring', required: false })
    @IsBoolean()
    @IsOptional()
    isRecurring?: boolean;

    @ApiProperty({ description: 'Due date for non-recurring tasks', required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    dueDate?: Date;

    @ApiProperty({ description: 'Recurrence frequency', required: false, enum: Frequency })
    @IsEnum(Frequency)
    @IsOptional()
    frequency?: Frequency;

    @ApiProperty({ description: 'Recurrence interval', required: false })
    @IsNumber()
    @IsOptional()
    interval?: number;

    @ApiProperty({ description: 'Days of week for weekly recurrence', required: false })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    daysOfWeek?: number[];

    @ApiProperty({ description: 'Days of month for monthly recurrence', required: false })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    daysOfMonth?: number[];

    @ApiProperty({ description: 'Months of year for yearly recurrence', required: false })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    monthsOfYear?: number[];

    @ApiProperty({ description: 'Ordinal weekdays for monthly/yearly recurrence', required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrdinalWeekdayDto)
    @IsOptional()
    ordinalWeekdays?: OrdinalWeekdayDto[];
} 