import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/user.schema.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }
    const { passwordHash: _passwordHash, ...result } = user.toObject();
    return result;
  }

  login(user: User) {
    const payload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      shopName: user.shopName,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        shopName: user.shopName,
      },
    };
  }
}
