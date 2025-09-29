import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import * as session from 'express-session';


//TODO: A faire - Global - Améliore le typage
//TODO: A faire - Auth - Améliore la gestions des erreurs 
//TODO: A faire - Global - Ajouter les erreurs code 
//TODO: A faire - Global - Ajout Readme


//TODO: Amélioration  - S'occuper du rate limiter et vérifier le probléme avec le rate limiter avec le skip passer l'objet dans le decorateur
//TODO: Amélioration  - Doc + swagger
//TODO: Amélioration  - Test unitaire intégration + e2e à mettre en place
//TODO: Amélioration  - Prévoir une stratégie pour nettoyer les tokens



//TODO: Idée AVoir une  boite mail qui trier pour moi selon certains critéres les offres de pe via  api 

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true ,transform: true,}),
  );

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(
    session({
      secret: process.env.JWT_DEFAULT_SECRET ?? "",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 600000, 
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );
  

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
