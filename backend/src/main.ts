import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
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
