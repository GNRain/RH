// src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles from the @Roles() decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. If an endpoint has no @Roles decorator, grant access
    if (!requiredRoles) {
      return true;
    }

    // 3. Get the user object from the request (attached by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // 4. Compare the user's roles with the required roles
    // The .some() method returns true if at least one role matches.
    return requiredRoles.some((role) => user.role === role);
  }
}