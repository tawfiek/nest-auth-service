import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  OperationStatus,
  OperationStatusWithData,
} from 'src/@types/opertation-status.interface';
import { User } from 'src/@types/user.interface';
import { AddUserDTO, LoginDTO } from 'src/DTOs/users';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    @Inject('KAFKA_MODULE') private readonly kafkaClient: ClientKafka,
  ) {}

  @Post('/create')
  async create(
    @Body() addUserDTO: AddUserDTO,
  ): Promise<OperationStatusWithData<User>> {
    try {
      const addingResult = await this.userService.create(addUserDTO);

      this.kafkaClient.emit('users.create', addingResult);

      return {
        success: true,
        message: 'User created !',
        data: addingResult,
      };
    } catch (e) {
      throw e;
    }
  }

  @Post('/login')
  async login(
    @Body() loginDTO: LoginDTO,
  ): Promise<OperationStatusWithData<{ token: string }> | OperationStatus> {
    try {
      const user = await this.userService.findByUsername(loginDTO.username);

      const token = this.getJWTForValidUser(user, loginDTO.password);

      return {
        success: true,
        message: 'User logged in !',
        data: {
          token: token,
        },
      };
    } catch (e) {
      throw e;
    }
  }

  @Get('/activate/:uuid')
  async activate(@Param() params: { uuid: string }): Promise<string> {
    try {
      const { uuid } = params;

      const user = await this.userService.findByActivationUUID(uuid);

      if (!user) {
        throw new BadRequestException('Invalid Activation Link!');
      }

      const isDone = await this.userService.activateUser(user);

      if (isDone){
        this.kafkaClient.emit('users.activated', user);
        return 'User activated !';
      } else {
        return 'Invalid Link !'
      }
    } catch (e) {
      throw e;
    }
  }

  // Verify user password and then return a JWT for this user.
  private getJWTForValidUser(user: User, password: string): string {
    if (!user) {
      throw new UnauthorizedException('Invalid Username or Password !');
    }

    const verifyPassword = this.userService.verifyPassword(
      password,
      user.password,
    );

    if (!verifyPassword) {
      throw new UnauthorizedException('Invalid Username or Password !');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is not Active !');
    }

    return this.userService.generateToken(user);
  }
}
