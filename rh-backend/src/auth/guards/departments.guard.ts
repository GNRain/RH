// src/auth/guards/departments.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DEPARTMENTS_KEY } from '../decorators/departments.decorator';

@Injectable()
export class DepartmentsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // FIX: The decorator now provides an array of strings
    const requiredDepartmentNames = this.reflector.getAllAndOverride<string[]>(DEPARTMENTS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredDepartmentNames) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // The JWT payload now contains `department` as a string name.
    // We check if the user's department string is included in the required list.
    return user && user.department && requiredDepartmentNames.some((departmentName) => user.department === departmentName);
  }
}