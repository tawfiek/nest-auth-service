import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: '.env'}),
    DatabaseModule
  ],
  controllers: [
    AppController,
    UsersController
  ],
  providers: [
    AppService,
    UsersService,
  ],
})
export class AppModule {}
