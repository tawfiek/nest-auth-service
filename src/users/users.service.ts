import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/@types/user.interface';
import * as bcrypt from 'bcrypt';
import { Db } from 'mongodb';
import { AddUserDTO } from 'src/DTOs/users';
import * as  jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
    COLLECTION = 'users';

    constructor (
        @Inject('DATABASE_CONNECTION')
        private db: Db
    ) { }

    public async create(user: AddUserDTO): Promise<User> {
        try {
            const userCopy = { ...user };
            userCopy.password = this.hashPassword(userCopy.password);

            // TODO: add check to ensure that user is not already in the database.
            const result = await this.db.collection(this.COLLECTION).insertOne(userCopy);

            if (result.acknowledged) {
                var userAdded: any =
                    await this.db.collection(this.COLLECTION).findOne({ _id: result.insertedId });
            }

            const userAddedWithoutPassword: User = {
                username: userAdded.username,
                id: userAdded._id,
                firstName: userAdded.firstName,
                lastName: userAdded.lastName,
                email: userAdded.email,
            };

            return userAddedWithoutPassword;
        } catch (e) {
            throw e;
        }
    }

    public async findByUsername (username: string): Promise<User> {
        try {
            const user = await this.db.collection(this.COLLECTION).findOne({ username });

            if (user && user.isActive) {
                const userWithoutPassword: User = {
                    username: user.username,
                    id: user._id.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isActive: !! user.isActive,
                    password: user.password
                };

                return userWithoutPassword;
            }

            return null;
        } catch (e) {
            throw e;
        }
    }


    public verifyPassword(password: string, hashedPassword: string): boolean {
        return bcrypt.compareSync(password, hashedPassword);
    }

    public generateToken(user: User): string {
        const TOKEN_SECRET = process.env.TOKEN_SECRET;

        if (!TOKEN_SECRET) {
            throw new Error('TOKEN_SECRET is not defined');
        }

        const token =  jwt.sign(user, TOKEN_SECRET as string);

        return token;
    }

    private hashPassword(password: string): string {
        const BCRYPT_ROUNDS = +process.env.BCRYPT_ROUNDS;

        if (isNaN(BCRYPT_ROUNDS)) {
            throw new Error('BCRYPT_ROUNDS is not a number');
        }

        const salt = bcrypt.genSaltSync(BCRYPT_ROUNDS);

        return bcrypt.hashSync(password, salt);
    }
}
