import { Controller, UseGuards, Req } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { contract } from '../../api-contract/src/index';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';

@ApiTags('tasks')
@ApiBearerAuth('firebase-auth')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @ApiOperation({ summary: 'Create a new task in a task list' })
    @ApiResponse({ status: 201, description: 'The task has been successfully created.' })
    @ApiParam({ name: 'taskListId', type: String, description: 'Task list ID' })
    @ApiBody({ type: CreateTaskDto })
    @TsRestHandler(contract.tasks.create)
    async create(@Req() req: any) {
        return tsRestHandler(contract.tasks.create, async ({ params, body }) => {
            const userId = req.user.id;
            const fixedBody: CreateTaskDto = {
                ...body,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                title: body.title,
                ordinalWeekdays: body.ordinalWeekdays?.map((ow: any) => ({
                    weekday: ow.weekday,
                    ordinal: ow.ordinal,
                })),
            };
            const task = await this.tasksService.create(userId, params.taskListId, fixedBody);
            return { status: 201, body: task };
        });
    }

    @ApiOperation({ summary: 'Get all tasks in a task list' })
    @ApiResponse({ status: 200, description: 'Return all tasks.' })
    @ApiParam({ name: 'taskListId', type: String, description: 'Task list ID' })
    @TsRestHandler(contract.tasks.findAll)
    async findAll(@Req() req: any) {
        return tsRestHandler(contract.tasks.findAll, async ({ params }) => {
            const userId = req.user.id;
            const tasks = await this.tasksService.findAll(userId, params.taskListId);
            return { status: 200, body: tasks };
        });
    }

    @ApiOperation({ summary: 'Get a task by id' })
    @ApiResponse({ status: 200, description: 'Return the task.' })
    @ApiResponse({ status: 404, description: 'Task not found.' })
    @ApiParam({ name: 'id', type: String, description: 'Task ID' })
    @TsRestHandler(contract.tasks.findOne)
    async findOne(@Req() req: any) {
        return tsRestHandler(contract.tasks.findOne, async ({ params }) => {
            const userId = req.user.id;
            try {
                const task = await this.tasksService.findOne(userId, params.id);
                return { status: 200, body: task };
            } catch (e) {
                if (typeof e === 'object' && e !== null && 'status' in e && (e as any).status === 404) {
                    return { status: 404, body: undefined };
                }
                throw e;
            }
        });
    }

    @ApiOperation({ summary: 'Update a task' })
    @ApiResponse({ status: 200, description: 'The task has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Task not found.' })
    @ApiParam({ name: 'id', type: String, description: 'Task ID' })
    @ApiBody({ type: CreateTaskDto })
    @TsRestHandler(contract.tasks.update)
    async update(@Req() req: any) {
        return tsRestHandler(contract.tasks.update, async ({ params, body }) => {
            const userId = req.user.id;
            const fixedBody: CreateTaskDto = {
                ...body,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                title: body.title,
                ordinalWeekdays: body.ordinalWeekdays?.map((ow: any) => ({
                    weekday: ow.weekday,
                    ordinal: ow.ordinal,
                })),
            };
            try {
                const updated = await this.tasksService.update(userId, params.id, fixedBody);
                return { status: 200, body: updated };
            } catch (e) {
                if (typeof e === 'object' && e !== null && 'status' in e && (e as any).status === 404) {
                    return { status: 404, body: undefined };
                }
                throw e;
            }
        });
    }

    @ApiOperation({ summary: 'Delete a task' })
    @ApiResponse({ status: 200, description: 'The task has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Task not found.' })
    @ApiParam({ name: 'id', type: String, description: 'Task ID' })
    @TsRestHandler(contract.tasks.remove)
    async remove(@Req() req: any) {
        return tsRestHandler(contract.tasks.remove, async ({ params }) => {
            const userId = req.user.id;
            try {
                await this.tasksService.remove(userId, params.id);
                return { status: 200, body: undefined };
            } catch (e) {
                if (typeof e === 'object' && e !== null && 'status' in e && (e as any).status === 404) {
                    return { status: 404, body: undefined };
                }
                throw e;
            }
        });
    }
} 