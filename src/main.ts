import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors();

    // Enable validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    // Swagger setup
    const config = new DocumentBuilder()
        .setTitle('Task Organizer API')
        .setDescription(
            'The Task Organizer API description.\n\n' +
            '🔐 **Authentication:**\n' +
            '1. Log in to your app using Firebase Auth.\n' +
            '2. Get your Firebase ID token (e.g., with `firebase.auth().currentUser.getIdToken()`).\n' +
            '3. Click the **Authorize** button in the top right.\n' +
            '4. Paste your ID token (no need to type "Bearer ").\n' +
            '5. All protected endpoints will use this token as a Bearer token.'
        )
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Paste your Firebase ID token here. You do not need to type "Bearer ".',
            },
            'firebase-auth',
        )
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 