// src/auth/strategies/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'REPLACE_THIS_WITH_A_REAL_SECRET',
    });
  }

  /**
   * --- MODIFIED METHOD ---
   * Passport automatically calls this method after it has verified the JWT's signature.
   * We now return the entire payload, so all claims (sub, cin, role, purpose, etc.)
   * are available in the `req.user` object in our controllers.
   */
  async validate(payload: any) {
    return payload;
  }
}