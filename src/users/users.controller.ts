import { BadRequestException, Body, Controller, Get, Next, Param, Post, UnauthorizedException} from '@nestjs/common';
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

            const token = this.getJWTForValidUser(user, loginDTO.password);

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

    @Get('/activate/:uuid')
    async activate(@Param() params: {uuid: string}): Promise<String> {
        try {
            const { uuid } = params;


            const user = await this.userService.findByActivationUUID(uuid);

            if (!user) {
                throw new BadRequestException('Invalid Activation Link!');
            }

            const isDone = await this.userService.activateUser(user);

            // TODO: Make this endpoint renders an HTML page instated of just returning a string
            return isDone ? 'User activated !' : 'Link has been expired !';
        } catch (e) {
            throw e;
        }
    }

    private getJWTForValidUser (user: User, password: string): string {
        if (!user) {
            throw new UnauthorizedException('Invalid Username or Password !');
        }

        const verifyPassword = this.userService.verifyPassword(password, user.password);

        if (!verifyPassword) {
            throw new UnauthorizedException('Invalid Username or Password !');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User is not Active !');
        }

        return this.userService.generateToken(user);
    }
}
