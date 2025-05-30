import { Controller, UseGuards, Req } from "@nestjs/common";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { contract } from "../../api-contract/src/index";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import { CreateTaskDto } from "./dto/create-task.dto";

@ApiTags("tasks")
@ApiBearerAuth("firebase-auth")
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: "Complete or un-complete a task occurrence" })
  @ApiResponse({ status: 200, description: "The occurrence has been updated." })
  @ApiResponse({ status: 404, description: "Occurrence not found." })
  @ApiParam({
    name: "occurrenceId",
    type: String,
    description: "Occurrence ID",
  })
  @ApiBody({ schema: { example: { completed: true } } })
  @TsRestHandler(contract.tasks.completeTaskOccurrence)
  async completeTaskOccurrence(@Req() req: any) {
    return tsRestHandler(
      contract.tasks.completeTaskOccurrence,
      async ({ params, body }) => {
        const userId = req.user.id;
        try {
          const updated = await this.tasksService.completeTaskOccurrence(
            userId,
            params.occurrenceId,
            body.completed
          );
          return { status: 200, body: updated };
        } catch (e) {
          if (
            typeof e === "object" &&
            e !== null &&
            "status" in e &&
            (e as any).status === 404
          ) {
            return { status: 404, body: undefined };
          }
          throw e;
        }
      }
    );
  }

  @ApiOperation({ summary: "Create a new task in a task list" })
  @ApiResponse({
    status: 201,
    description: "The task has been successfully created.",
  })
  @ApiBody({ type: CreateTaskDto })
  @TsRestHandler(contract.tasks.create)
  async create(@Req() req: any) {
    return tsRestHandler(contract.tasks.create, async ({ body }) => {
      const userId = req.user.id;
      const fixedBody: CreateTaskDto = {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        title: body.title!,
        ordinalWeekdays: body.recurrenceRule?.ordinalWeekdays?.map(
          (ow: any) => ({
            weekday: ow.weekday,
            ordinal: ow.ordinal,
          })
        ),
      };
      // taskListId is now in the body
      const task = await this.tasksService.create(
        userId,
        body.taskListId,
        fixedBody
      );
      return { status: 201, body: task };
    });
  }

  // findAll removed: listing tasks in a tasklist is now under tasklists router

  @ApiOperation({ summary: "Get a task by id" })
  @ApiResponse({ status: 200, description: "Return the task." })
  @ApiResponse({ status: 404, description: "Task not found." })
  @ApiParam({ name: "taskId", type: String, description: "Task ID" })
  @TsRestHandler(contract.tasks.findOne)
  async findOne(@Req() req: any) {
    return tsRestHandler(contract.tasks.findOne, async ({ params }) => {
      const userId = req.user.id;
      try {
        const task = await this.tasksService.findOne(userId, params.taskId);
        return { status: 200, body: task };
      } catch (e) {
        if (
          typeof e === "object" &&
          e !== null &&
          "status" in e &&
          (e as any).status === 404
        ) {
          return { status: 404, body: undefined };
        }
        throw e;
      }
    });
  }

  @ApiOperation({ summary: "Update a task" })
  @ApiResponse({
    status: 200,
    description: "The task has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Task not found." })
  @ApiParam({ name: "taskId", type: String, description: "Task ID" })
  @ApiBody({ type: CreateTaskDto })
  @TsRestHandler(contract.tasks.update)
  async update(@Req() req: any) {
    return tsRestHandler(contract.tasks.update, async ({ params, body }) => {
      const userId = req.user.id;
      const fixedBody: CreateTaskDto = {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        title: body.title!,
        ordinalWeekdays: body.recurrenceRule?.ordinalWeekdays?.map(
          (ow: any) => ({
            weekday: ow.weekday,
            ordinal: ow.ordinal,
          })
        ),
      };
      try {
        const updated = await this.tasksService.update(
          userId,
          params.taskId,
          fixedBody
        );
        return { status: 200, body: updated };
      } catch (e) {
        if (
          typeof e === "object" &&
          e !== null &&
          "status" in e &&
          (e as any).status === 404
        ) {
          return { status: 404, body: undefined };
        }
        throw e;
      }
    });
  }

  @ApiOperation({ summary: "Delete a task" })
  @ApiResponse({
    status: 200,
    description: "The task has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Task not found." })
  @ApiParam({ name: "taskId", type: String, description: "Task ID" })
  @TsRestHandler(contract.tasks.remove)
  async remove(@Req() req: any) {
    return tsRestHandler(contract.tasks.remove, async ({ params }) => {
      const userId = req.user.id;
      try {
        await this.tasksService.remove(userId, params.taskId);
        return { status: 200, body: undefined };
      } catch (e) {
        if (
          typeof e === "object" &&
          e !== null &&
          "status" in e &&
          (e as any).status === 404
        ) {
          return { status: 404, body: undefined };
        }
        throw e;
      }
    });
  }
}
