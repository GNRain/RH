// src/auth/decorators/departments.decorator.ts

import { SetMetadata } from '@nestjs/common';

// We no longer need to import Department from Prisma client
// import { Department } from '@prisma/client';

export const DEPARTMENTS_KEY = 'departments';

// FIX: We change the expected parameter type from 'Department[]' to 'string[]'
export const Departments = (...departments: string[]) => SetMetadata(DEPARTMENTS_KEY, departments);