// src/auth/strategies/local.strategy.ts

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'cin' }); // Tell Passport to use 'cin' instead of 'username'
  }

  /**
   * Passport automatically calls this method with the credentials from the request body.
   * @param cin The value from the 'cin' field in the request body.
   * @param password The value from the 'password' field in the request body.
   * @returns The user object if validation succeeds.
   * @throws UnauthorizedException if validation fails.
   */
  async validate(cin: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(cin, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}