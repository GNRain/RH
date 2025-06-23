// rh-backend/prisma/seed.ts

import { PrismaClient, Role, Gender, LeaveType, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const roundsOfHashing = 10;

async function main() {
  console.log('Starting the seeding process with the full 2-team hierarchy...');

  // 1. Clean up old data
  await prisma.leaveApproval.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.position.deleteMany({});
  await prisma.department.deleteMany({});
  console.log('✅ Cleaned up old data.');

  // 2. Create Departments & Positions
  console.log('Creating departments and positions...');
  const hrDepartment = await prisma.department.create({ data: { name: 'HR' } });
  const itDepartment = await prisma.department.create({ data: { name: 'IT' } });
  const businessDepartment = await prisma.department.create({ data: { name: 'Business' } });
  
  const dhrPosition = await prisma.position.create({ data: { name: 'position_director_hr' } });
  const hrGeneralistPosition = await prisma.position.create({ data: { name: 'position_hr_generalist' } });
  const engManagerPosition = await prisma.position.create({ data: { name: 'position_eng_manager' } });
  const prodManagerPosition = await prisma.position.create({ data: { name: 'position_prod_manager' } });
  const seniorDevPosition = await prisma.position.create({ data: { name: 'position_senior_dev' } });
  const leadAnalystPosition = await prisma.position.create({ data: { name: 'position_lead_analyst' } });
  const softwareDevPosition = await prisma.position.create({ data: { name: 'position_software_dev' } });
  const businessAnalystPosition = await prisma.position.create({ data: { name: 'position_business_analyst' } });

  // 3. Create Users
  console.log('Creating users...');
  // HR Staff
  await prisma.user.create({
    data: {
      name: 'Danielle', familyName: 'Director', cin: '11111111',
      email: 'dhr@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '10000001',
      role: Role.DHR, departmentId: hrDepartment.id, positionId: dhrPosition.id,
      birthDate: new Date('1975-05-20'), gender: Gender.FEMALE,
    },
  });
  await prisma.user.create({
    data: {
        name: 'Harry', familyName: 'Humanist', cin: '11112222',
        email: 'hr@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '10000002',
        role: Role.HR, departmentId: hrDepartment.id, positionId: hrGeneralistPosition.id,
        birthDate: new Date('1991-04-10'), gender: Gender.MALE,
    },
  });

  // --- TEAM 1 (IT) ---
  const manager1 = await prisma.user.create({
    data: {
      name: 'Michael', familyName: 'Manager', cin: '22222222',
      email: 'manager1@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '20000001',
      role: Role.MANAGER, departmentId: itDepartment.id, positionId: engManagerPosition.id,
      birthDate: new Date('1985-08-15'), gender: Gender.MALE,
    },
  });
  const teamLeader1 = await prisma.user.create({
    data: {
      name: 'Laura', familyName: 'Leader', cin: '33333333',
      email: 'leader1@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '30000001',
      role: Role.TEAM_LEADER, departmentId: itDepartment.id, positionId: seniorDevPosition.id,
      managerId: manager1.id, birthDate: new Date('1990-11-02'), gender: Gender.FEMALE,
    },
  });
  const employee1 = await prisma.user.create({
    data: {
      name: 'Alice', familyName: 'Employee', cin: '44444444',
      email: 'employee1@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '40000001',
      role: Role.EMPLOYEE, departmentId: itDepartment.id, positionId: softwareDevPosition.id,
      teamLeaderId: teamLeader1.id, managerId: manager1.id,
      birthDate: new Date('1995-03-30'), gender: Gender.FEMALE,
    },
  });

  // --- TEAM 2 (Business) ---
  const manager2 = await prisma.user.create({
    data: {
      name: 'Sarah', familyName: 'Supervisor', cin: '66666666',
      email: 'manager2@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '60000001',
      role: Role.MANAGER, departmentId: businessDepartment.id, positionId: prodManagerPosition.id,
      birthDate: new Date('1988-02-10'), gender: Gender.FEMALE,
    },
  });
  const teamLeader2 = await prisma.user.create({
    data: {
      name: 'Tom', familyName: 'Lead', cin: '77777777',
      email: 'leader2@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '70000001',
      role: Role.TEAM_LEADER, departmentId: businessDepartment.id, positionId: leadAnalystPosition.id,
      managerId: manager2.id, birthDate: new Date('1991-09-05'), gender: Gender.MALE,
    },
  });
  await prisma.user.create({
    data: {
      name: 'Charlie', familyName: 'Coder', cin: '88888888',
      email: 'employee3@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '80000001',
      role: Role.EMPLOYEE, departmentId: businessDepartment.id, positionId: businessAnalystPosition.id,
      teamLeaderId: teamLeader2.id, managerId: manager2.id,
      birthDate: new Date('1998-10-18'), gender: Gender.MALE,
    },
  });

  // --- INACTIVE User ---
  await prisma.user.create({
    data: {
      name: 'Bob', familyName: 'Builder', cin: '55555555',
      email: 'employee2@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '50000001',
      role: Role.EMPLOYEE, departmentId: businessDepartment.id, positionId: businessAnalystPosition.id,
      status: UserStatus.INACTIVE, joinDate: new Date('2023-01-10'),
      terminationDate: new Date('2024-05-20'),
      birthDate: new Date('1992-07-22'), gender: Gender.MALE,
    },
  });
  
  // 4. Create Sample Leave Requests
  console.log('Creating sample leave requests...');
  await prisma.leaveRequest.create({
    data: {
        userId: employee1.id, fromDate: new Date('2025-07-10'), toDate: new Date('2025-07-15'),
        reason: 'Family vacation', type: LeaveType.VACATION, overallStatus: 'ACCEPTED'
    }
  });
  await prisma.leaveRequest.create({
    data: {
        userId: teamLeader1.id, fromDate: new Date('2025-08-01'), toDate: new Date('2025-08-02'),
        reason: 'Doctor appointment', type: LeaveType.SICK_LEAVE, overallStatus: 'PENDING'
    }
  });

  console.log('✅ Seeding finished successfully!');
}

main().catch((e) => {
  console.error('An error occurred during seeding:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});