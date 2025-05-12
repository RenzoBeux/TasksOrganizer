import { PrismaClient, Frequency } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create a test user
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            displayName: 'Test User',
        },
    });

    // Create a task list
    const taskList = await prisma.taskList.create({
        data: {
            name: 'My First Task List',
            description: 'A list of tasks to get started',
            memberships: {
                create: {
                    userId: user.id,
                    role: 'OWNER',
                },
            },
        },
    });

    // Create a recurring task
    const recurringTask = await prisma.task.create({
        data: {
            title: 'Daily Standup',
            description: 'Team daily standup meeting',
            isRecurring: true,
            taskListId: taskList.id,
            recurrenceRule: {
                create: {
                    frequency: Frequency.DAILY,
                    interval: 1,
                    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
                    daysOfMonth: [],
                    monthsOfYear: [],
                    ordinalWeekdays: JSON.stringify([]),
                },
            },
        },
    });

    // Create a one-time task
    const oneTimeTask = await prisma.task.create({
        data: {
            title: 'Project Deadline',
            description: 'Submit final project deliverables',
            dueDate: new Date('2024-12-31'),
            isRecurring: false,
            taskListId: taskList.id,
        },
    });

    console.log('Database has been seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 