import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { AgentsModule } from './modules/agents/agents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    AgentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
