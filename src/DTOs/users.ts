import { IsAlphanumeric, IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class AddUserDTO {
    @IsAlphanumeric()
    @MaxLength(50)
    username: string;

    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @IsEmail()
    email: string;

    @IsAlphanumeric()
    @MinLength(5)
    @MaxLength(255)
    password: string;
 }

export class LoginDTO {
    @IsAlphanumeric()
    @MaxLength(50)
    username: string;

    @IsAlphanumeric()
    @MinLength(5)
    @MaxLength(255)
    password: string;
}