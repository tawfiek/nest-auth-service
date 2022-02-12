import { BadRequestException, Body, Controller, Get, Next, Post, UnauthorizedException} from '@nestjs/common';
import { OperationStatus, OperationStatusWithData } from 'src/@types/opertation-status.interface';
import { User } from 'src/@types/user.interface';
import { AddUserDTO, LoginDTO } from 'src/DTOs/users';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post('/create')
    async create(@Body() addUserDTO: AddUserDTO): Promise<OperationStatusWithData<User>> {
        try {
            const addingResult  = await this.userService.create(addUserDTO);

            return {
                success: true,
                message: 'User created !',
                data: addingResult,
            }
        } catch (e) {
            throw e;
        }
    }

    @Post('/login')
    async login (@Body() loginDTO: LoginDTO): Promise<OperationStatusWithData<{token: string}> | OperationStatus> {
        try {
            const user = await this.userService.findByUsername(loginDTO.username);

            if (!user) {
                throw new UnauthorizedException('Invalid Username or Password !');
            }

            const verifyPassword = this.userService.verifyPassword(loginDTO.password, user.password);

            if (!verifyPassword) {
                throw new UnauthorizedException('Invalid Username or Password !');
            }

            const token = this.userService.generateToken(user);

            return {
                success: true,
                message: 'User logged in !',
                data: {
                    token: token,
                }
            }

        } catch(e) {
            throw e;
        }
    }
}
