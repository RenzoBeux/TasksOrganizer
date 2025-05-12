import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaskListsService } from './task-lists.service';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('task-lists')
@ApiBearerAuth('firebase-auth')
@UseGuards(JwtAuthGuard)
@Controller('tasklists')
export class TaskListsController {
    constructor(private readonly taskListsService: TaskListsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new task list' })
    @ApiResponse({ status: 201, description: 'The task list has been successfully created.' })
    create(@Request() req, @Body() createTaskListDto: CreateTaskListDto) {
        return this.taskListsService.create(req.user.id, createTaskListDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all task lists for the current user' })
    @ApiResponse({ status: 200, description: 'Return all task lists.' })
    findAll(@Request() req) {
        return this.taskListsService.findAll(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a task list by id' })
    @ApiResponse({ status: 200, description: 'Return the task list.' })
    @ApiResponse({ status: 404, description: 'Task list not found.' })
    findOne(@Request() req, @Param('id') id: string) {
        return this.taskListsService.findOne(req.user.id, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a task list' })
    @ApiResponse({ status: 200, description: 'The task list has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Task list not found.' })
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateTaskListDto: CreateTaskListDto,
    ) {
        return this.taskListsService.update(req.user.id, id, updateTaskListDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a task list' })
    @ApiResponse({ status: 200, description: 'The task list has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Task list not found.' })
    remove(@Request() req, @Param('id') id: string) {
        return this.taskListsService.remove(req.user.id, id);
    }
} 