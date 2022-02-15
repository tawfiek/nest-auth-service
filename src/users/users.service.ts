import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from 'src/@types/user.interface';
import * as bcrypt from 'bcrypt';
import { Db } from 'mongodb';
import { AddUserDTO } from 'src/DTOs/users';
import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';

@Injectable()
export class UsersService {
  COLLECTION = 'users';
  OTP_EXPIRATION_TIME = 1;

  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: Db,
  ) {
    this.db
      .collection(this.COLLECTION)
      .createIndex({ username: 1 }, { unique: true });
    this.db
      .collection(this.COLLECTION)
      .createIndex({ email: 1 }, { unique: true });
  }

  // Create new user after verifying it and hashing the password.
  public async create(user: AddUserDTO): Promise<User> {
    try {
      const userCopy: any = { ...user };
      userCopy.password = this.hashPassword(userCopy.password);
      userCopy.isActive = false;
      userCopy.activationUUID = this.generateUUID();

      const canAddThisUser = await this.canAddUser(user);

      if (!canAddThisUser) {
        throw new BadRequestException('User already exists');
      }

      const result = await this.db
        .collection(this.COLLECTION)
        .insertOne(userCopy);

      let userAdded;
      if (result.acknowledged) {
        userAdded = await this.db
          .collection(this.COLLECTION)
          .findOne({ _id: result.insertedId });
      }

      const userAddedWithoutPassword: User = {
        username: userAdded.username,
        id: userAdded._id,
        firstName: userAdded.firstName,
        lastName: userAdded.lastName,
        email: userAdded.email,
        activationUUID: userCopy.activationUUID,
        isActive: !!userAdded.isActive,
      };

      return userAddedWithoutPassword;
    } catch (e) {
      throw e;
    }
  }

  // Use mongo client to find a user in user's collection buy user name.
  public async findByUsername(username: string): Promise<User> {
    try {
      const user = await this.db
        .collection(this.COLLECTION)
        .findOne({ username });

      if (user && user.isActive) {
        const userWithoutPassword: User = {
          username: user.username,
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isActive: !!user.isActive,
          password: user.password,
        };

        return userWithoutPassword;
      }

      return null;
    } catch (e) {
      throw e;
    }
  }

  // Use mongo client to find a user in user's collection buy activation UUID.
  public async findByActivationUUID(activationUUID: string): Promise<User> {
    try {
      const user = await this.db
        .collection(this.COLLECTION)
        .findOne({ activationUUID });

      if (user) {
        return parseUser(user);
      }

      return null;
    } catch (e) {
      throw e;
    }

    function parseUser (user): User {
        const parsedUser: User = {
            username: user.username,
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isActive: !!user.isActive,
            password: user.password,
        };

        if (!user.isActive) {
            parsedUser.activationUUID = user.activationUUID
        }

        return parsedUser;
    }
  }

  // Update isActive property to mark user as active.
  public async activateUser(user: User): Promise<boolean> {
    const result = await this.db
      .collection(this.COLLECTION)
      .updateOne({ activationUUID: user.activationUUID }, { $set: { isActive: true } });

    console.log('#DEBUG user', user);
    
    return result.acknowledged;
  }

  // Use bcrypt to compare the plain text password with a hashed one.
  public verifyPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  // Generate JWT with the user data as a payload.
  public generateToken(user: User): string {
    const TOKEN_SECRET = process.env.TOKEN_SECRET;

    if (!TOKEN_SECRET) {
      throw new Error('TOKEN_SECRET is not defined');
    }

    const token = jwt.sign(user, TOKEN_SECRET as string);

    return token;
  }

  // Use bcrypt to hash a plain text password after generating salt.
  private hashPassword(password: string): string {
    const BCRYPT_ROUNDS = +process.env.BCRYPT_ROUNDS;

    if (isNaN(BCRYPT_ROUNDS)) {
      throw new Error('BCRYPT_ROUNDS is not a number');
    }

    const salt = bcrypt.genSaltSync(BCRYPT_ROUNDS);

    return bcrypt.hashSync(password, salt);
  }

  // UUID generation wrapper.
  private generateUUID(): string {
    return uuid.v4();
  }

  // Check if the user can be added,
  // By checking if there are any other user used the same username or email before.
  private async canAddUser(user: AddUserDTO): Promise<boolean> {
    const userWithUserName = await this.db
      .collection(this.COLLECTION)
      .findOne({ username: user.username });
    const userWithEmail = await this.db
      .collection(this.COLLECTION)
      .findOne({ email: user.email });

    return !userWithUserName && !userWithEmail;
  }
}
