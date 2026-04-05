import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'spare-parts-secret-key',
    });
  }

  validate(payload: { id: number; username: string; role: string; shopName: string }) {
    return {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      shopName: payload.shopName,
    };
  }
}
