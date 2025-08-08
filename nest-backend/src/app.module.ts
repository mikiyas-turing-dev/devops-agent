import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AnalysisModule } from './analysis/analysis.module';
import { DockerizationModule } from './dockerization/dockerization.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    AnalysisModule,
    DockerizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
