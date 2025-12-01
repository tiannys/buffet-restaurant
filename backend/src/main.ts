import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get('PORT') || 3000;

    // Enable CORS - allow all origins for production
    app.enableCors({
        origin: true, // Allow all origins
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // API prefix
    app.setGlobalPrefix('api/v1');

    await app.listen(port);
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`📚 API available at http://localhost:${port}/api/v1`);
}

bootstrap();
