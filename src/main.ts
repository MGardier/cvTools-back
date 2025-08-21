import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';



//TODO: A faire - Global - Améliore le typage
//TODO: A faire - Auth - Améliore la gestions des erreurs 
//TODO: A faire - Global - Ajouter les erreurs code 
//TODO: A faire - Global - Ajout Readme
//TODO: A faire  - Auth -  Implémenter toute la logique admin et son rôle


//TODO :A faire - Intercepteur  -  Garder le status code  existant  + log intercepteur response et request



//TODO: Amélioration  - S'occuper du rate limiter et vérifier le probléme avec le rate limiter
//TODO: Amélioration  - Doc + swagger
//TODO: Amélioration  - Test unitaire intégration + e2e à mettre en place
//TODO: Amélioration  - Prévoir une stratégie pour nettoyer les tokens



//TODO: Idée AVoir une  boite mail qui trier pour moi selon certains critéres les offres de pe , helloworks, indee via leur api 

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
