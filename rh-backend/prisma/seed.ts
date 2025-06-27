  import { PrismaClient, Role, Gender, LeaveType, UserStatus } from '@prisma/client';
  import * as bcrypt from 'bcrypt';

  const prisma = new PrismaClient();
  const roundsOfHashing = 10;

  async function main() {
    console.log('Starting the comprehensive seeding process...');

    // 1. Clean up old data in the correct order
    await prisma.leaveApproval.deleteMany({});
    await prisma.leaveRequest.deleteMany({});
    await prisma.scheduleOverride.deleteMany({}); // <-- UPDATED
    await prisma.user.deleteMany({});
    await prisma.shift.deleteMany({});
    await prisma.position.deleteMany({});
    await prisma.department.deleteMany({});
    console.log('✅ Cleaned up old data.');

    // 2. Create Shifts
    console.log('Creating shifts...');
    const morningShift = await prisma.shift.create({ data: { name: 'Morning Shift', startTime: '08:00', endTime: '16:00', color: '#3b82f6' } });
    const eveningShift = await prisma.shift.create({ data: { name: 'Evening Shift', startTime: '16:00', endTime: '00:00', color: '#f59e0b' } });
    const nightShift = await prisma.shift.create({ data: { name: 'Night Shift', startTime: '00:00', endTime: '08:00', color: '#8b5cf6' } });

    // 3. Create Departments with Default Shifts and Colors
    console.log('Creating departments...');
    const hrDepartment = await prisma.department.create({ data: { name: 'HR', color: '#ef4444', defaultShiftId: morningShift.id } });
    const itDepartment = await prisma.department.create({ data: { name: 'IT', color: '#8b5cf6', defaultShiftId: nightShift.id } });
    const businessDepartment = await prisma.department.create({ data: { name: 'Business', color: '#f59e0b', defaultShiftId: eveningShift.id } });
    const lawDepartment = await prisma.department.create({ data: { name: 'Law', color: '#3b82f6', defaultShiftId: morningShift.id } });

    // 4. Create Positions
    console.log('Creating positions...');
    const dhrPos = await prisma.position.create({ data: { name: 'position_director_hr' } });
    const hrPos = await prisma.position.create({ data: { name: 'position_hr_generalist' } });
    const itManagerPos = await prisma.position.create({ data: { name: 'position_it_manager' } });
    const bizManagerPos = await prisma.position.create({ data: { name: 'position_biz_manager' } });
    const lawManagerPos = await prisma.position.create({ data: { name: 'position_law_manager' } });
    const itLeadPos = await prisma.position.create({ data: { name: 'position_it_lead' } });
    const bizLeadPos = await prisma.position.create({ data: { name: 'position_biz_lead' } });
    const lawLeadPos = await prisma.position.create({ data: { name: 'position_law_lead' } });
    const devPos = await prisma.position.create({ data: { name: 'position_developer' } });
    const analystPos = await prisma.position.create({ data: { name: 'position_analyst' } });
    const paralegalPos = await prisma.position.create({ data: { name: 'position_paralegal' } });


    // 3. Create Users
    console.log('Creating users...');

    // --- HR DEPARTMENT ---
    await prisma.user.create({
      data: {
        name: 'Danielle', familyName: 'Director', cin: '10000001',
        email: 'dhr@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '10000001',
        role: Role.DHR, departmentId: hrDepartment.id, positionId: dhrPos.id,
        birthDate: new Date('1975-05-20'), gender: Gender.FEMALE,
      },
    });
    await prisma.user.create({
      data: {
        name: 'Harry', familyName: 'Humanist', cin: '10000002',
        email: 'hr1@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '10000002',
        role: Role.HR, departmentId: hrDepartment.id, positionId: hrPos.id,
        birthDate: new Date('1991-04-10'), gender: Gender.MALE,
      },
    });
    await prisma.user.create({
      data: {
        name: 'Helen', familyName: 'Resources', cin: '10000003',
        email: 'hr2@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '10000003',
        role: Role.HR, departmentId: hrDepartment.id, positionId: hrPos.id,
        birthDate: new Date('1993-02-15'), gender: Gender.FEMALE,
      },
    });
    console.log('✅ HR Department created.');

    // --- IT DEPARTMENT ---
    const itManager = await prisma.user.create({ data: { name: 'Michael', familyName: 'Manager', cin: '20000001', email: 'manager.it@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '20000001', role: Role.MANAGER, departmentId: itDepartment.id, positionId: itManagerPos.id, birthDate: new Date('1985-08-15'), gender: Gender.MALE, } });
    const itLead = await prisma.user.create({ data: { name: 'Laura', familyName: 'Leader', cin: '20000002', email: 'lead.it@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '20000002', role: Role.TEAM_LEADER, departmentId: itDepartment.id, positionId: itLeadPos.id, managerId: itManager.id, birthDate: new Date('1990-11-02'), gender: Gender.FEMALE, } });
    await prisma.user.create({ data: { name: 'Alice', familyName: 'Dev', cin: '20000003', email: 'dev1@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '20000003', role: Role.EMPLOYEE, departmentId: itDepartment.id, positionId: devPos.id, teamLeaderId: itLead.id, managerId: itManager.id, birthDate: new Date('1995-03-30'), gender: Gender.FEMALE, } });
    const itEmployee2 = await prisma.user.create({ data: { name: 'Alex', familyName: 'Coder', cin: '20000004', email: 'dev2@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '20000004', role: Role.EMPLOYEE, departmentId: itDepartment.id, positionId: devPos.id, teamLeaderId: itLead.id, managerId: itManager.id, birthDate: new Date('1997-06-25'), gender: Gender.MALE, } });
    console.log('✅ IT Department created.');

    // --- BUSINESS DEPARTMENT ---
    const bizManager = await prisma.user.create({ data: { name: 'Sarah', familyName: 'Supervisor', cin: '30000001', email: 'manager.biz@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '30000001', role: Role.MANAGER, departmentId: businessDepartment.id, positionId: bizManagerPos.id, birthDate: new Date('1988-02-10'), gender: Gender.FEMALE, } });
    const bizLead = await prisma.user.create({ data: { name: 'Tom', familyName: 'Lead', cin: '30000002', email: 'lead.biz@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '30000002', role: Role.TEAM_LEADER, departmentId: businessDepartment.id, positionId: bizLeadPos.id, managerId: bizManager.id, birthDate: new Date('1991-09-05'), gender: Gender.MALE, } });
    await prisma.user.create({ data: { name: 'Bob', familyName: 'Analyst', cin: '30000003', email: 'analyst1@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '30000003', role: Role.EMPLOYEE, departmentId: businessDepartment.id, positionId: analystPos.id, teamLeaderId: bizLead.id, managerId: bizManager.id, birthDate: new Date('1993-12-15'), gender: Gender.MALE, } });
    await prisma.user.create({ data: { name: 'Brenda', familyName: 'Sales', cin: '30000004', email: 'analyst2@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '30000004', role: Role.EMPLOYEE, departmentId: businessDepartment.id, positionId: analystPos.id, teamLeaderId: bizLead.id, managerId: bizManager.id, birthDate: new Date('1996-01-20'), gender: Gender.FEMALE, } });
    console.log('✅ Business Department created.');
    
    // --- LAW DEPARTMENT ---
    const lawManager = await prisma.user.create({ data: { name: 'Louis', familyName: 'Litt', cin: '40000001', email: 'manager.law@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '40000001', role: Role.MANAGER, departmentId: lawDepartment.id, positionId: lawManagerPos.id, birthDate: new Date('1980-04-11'), gender: Gender.MALE, } });
    const lawLead = await prisma.user.create({ data: { name: 'Jessica', familyName: 'Pearson', cin: '40000002', email: 'lead.law@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '40000002', role: Role.TEAM_LEADER, departmentId: lawDepartment.id, positionId: lawLeadPos.id, managerId: lawManager.id, birthDate: new Date('1982-08-22'), gender: Gender.FEMALE, } });
    await prisma.user.create({ data: { name: 'Harvey', familyName: 'Specter', cin: '40000003', email: 'lawyer1@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '40000003', role: Role.EMPLOYEE, departmentId: lawDepartment.id, positionId: paralegalPos.id, teamLeaderId: lawLead.id, managerId: lawManager.id, birthDate: new Date('1990-05-19'), gender: Gender.MALE, } });
    await prisma.user.create({ data: { name: 'Mike', familyName: 'Ross', cin: '40000004', email: 'lawyer2@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '40000004', role: Role.EMPLOYEE, departmentId: lawDepartment.id, positionId: paralegalPos.id, teamLeaderId: lawLead.id, managerId: lawManager.id, birthDate: new Date('1994-07-30'), gender: Gender.MALE, } });
    console.log('✅ Law Department created.');

    // --- INACTIVE User ---
    await prisma.user.create({
      data: {
        name: 'Inactive', familyName: 'User', cin: '99999999',
        email: 'inactive@example.com', password: await bcrypt.hash('password123', roundsOfHashing), phoneNumber: '99999999',
        role: Role.EMPLOYEE, departmentId: itDepartment.id, positionId: devPos.id,
        status: UserStatus.INACTIVE, joinDate: new Date('2022-01-10'),
        terminationDate: new Date('2024-01-20'),
        birthDate: new Date('1992-07-22'), gender: Gender.OTHER,
      },
    });

  // 6. Create a Sample Schedule Override for demonstration
    console.log('Creating a sample schedule override...');
    const today = new Date();
    const a_week_from_now = new Date(today);
    a_week_from_now.setDate(today.getDate() + 7);
    
    await prisma.scheduleOverride.create({
        data: {
            date: a_week_from_now,
            departmentId: itDepartment.id,
            shiftId: morningShift.id, // IT department will work Morning shift next week on this day, overriding their default Night shift
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