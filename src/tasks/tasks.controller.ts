import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tasks')
@ApiBearerAuth('firebase-auth')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post('tasklists/:taskListId/tasks')
    @ApiOperation({ summary: 'Create a new task in a task list' })
    @ApiResponse({ status: 201, description: 'The task has been successfully created.' })
    create(
        @Request() req,
        @Param('taskListId') taskListId: string,
        @Body() createTaskDto: CreateTaskDto,
    ) {
        return this.tasksService.create(req.user.id, taskListId, createTaskDto);
    }

    @Get('tasklists/:taskListId/tasks')
    @ApiOperation({ summary: 'Get all tasks in a task list' })
    @ApiResponse({ status: 200, description: 'Return all tasks.' })
    findAll(@Request() req, @Param('taskListId') taskListId: string) {
        return this.tasksService.findAll(req.user.id, taskListId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a task by id' })
    @ApiResponse({ status: 200, description: 'Return the task.' })
    @ApiResponse({ status: 404, description: 'Task not found.' })
    findOne(@Request() req, @Param('id') id: string) {
        return this.tasksService.findOne(req.user.id, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a task' })
    @ApiResponse({ status: 200, description: 'The task has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Task not found.' })
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateTaskDto: CreateTaskDto,
    ) {
        return this.tasksService.update(req.user.id, id, updateTaskDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a task' })
    @ApiResponse({ status: 200, description: 'The task has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Task not found.' })
    remove(@Request() req, @Param('id') id: string) {
        return this.tasksService.remove(req.user.id, id);
    }
} 