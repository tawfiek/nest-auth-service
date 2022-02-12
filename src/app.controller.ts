import { Controller, Get } from '@nestjs/common';
import { OperationStatus } from './@types/opertation-status.interface';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ping')
  getHello(): OperationStatus {
    return {
      success: true,
      message: 'pong',
    };
  }
}
