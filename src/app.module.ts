import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
     ClientsModule.register([
      {
        name: 'KAFKA_MODULE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth_producer',
            brokers: ['localhost:29092'],
          },
          consumer: {
            groupId: 'dev_task_auth_consumer',
          },
        },
      },
    ]),
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
