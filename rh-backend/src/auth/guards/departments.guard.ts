import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Department } from '@prisma/client';
import { DEPARTMENTS_KEY } from '../decorators/departments.decorator';

@Injectable()
export class DepartmentsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredDepartments = this.reflector.getAllAndOverride<Department[]>(DEPARTMENTS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredDepartments) {
      return true; // No department specified, allow access
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Check if the user's department is in the list of required departments
    return requiredDepartments.some((department) => user.department === department);
  }
}