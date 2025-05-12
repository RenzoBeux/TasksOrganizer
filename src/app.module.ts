import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TaskListsModule } from './task-lists/task-lists.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        PrismaModule,
        TaskListsModule,
        TasksModule,
        UsersModule,
        AuthModule,
    ],
})
export class AppModule { } 