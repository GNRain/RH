// src/auth/strategies/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Tell Passport to extract the JWT from the 'Authorization' header as a 'Bearer Token'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // This ensures that Passport doesn't reject expired tokens; our guard will handle it.
      // We are responsible for ensuring the secret is not compromised.
      ignoreExpiration: false,
      // The secret used to sign the tokens. This MUST be the same as in auth.module.ts
      secretOrKey: 'REPLACE_THIS_WITH_A_REAL_SECRET',
    });
  }

  /**
   * Passport automatically calls this method after it has verified the JWT's signature
   * and that it has not expired. The payload is the decrypted object we created
   * in the auth.service.ts login method.
   * @param payload The decoded JWT payload ({ sub: user.id, cin: user.cin, role: user.role })
   * @returns The user identifying information that will be attached to req.user
   */
  async validate(payload: any) {
    // The payload is already validated at this point. We can trust it.
    // We could add logic here to check if the user still exists in the DB, etc.
    // For now, we'll just return the essential user info.
    return { id: payload.sub, cin: payload.cin, role: payload.role };
  }
}