
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    leaveRequest: 'Leave Request',
    schedule: 'Schedule',
    leaveManagement: 'Leave Management',
    employees: 'Employees',
    documents: 'Documents',
    companySettings: 'Company Settings',
    navigation: 'Navigation',
    erpSystem: 'ERP System',
    
    // Dashboard
    dashboardOverview: 'Dashboard Overview',
    monitorMetrics: 'Monitor your company\'s key metrics and activities',
    totalEmployees: 'Total Employees',
    pendingLeaveRequests: 'Pending Leave Requests',
    activeDepartments: 'Active Departments',
    departmentDistribution: 'Department Distribution',
    monthlyLeaveRequests: 'Monthly Leave Requests',
    recentActivity: 'Recent Activity',
    fromLastMonth: 'from last month',
    
    // Schedule
    departmentSchedule: 'Department Schedule',
    weeklyScheduleDesc: 'Weekly schedule showing which department works at each time slot',
    departments: 'Departments',
    weeklyScheduleGrid: 'Weekly Schedule Grid',
    timeSlot: 'Time Slot',
    weeklyHours: 'Weekly Hours',
    shiftPattern: 'Shift Pattern',
    hours: 'hours',
    eightHourShifts: '8-hour shifts',
    
    // Leave Request
    requestLeave: 'Request Leave',
    leaveType: 'Leave Type',
    startDate: 'Start Date',
    endDate: 'End Date',
    reason: 'Reason',
    submitRequest: 'Submit Request',
    vacation: 'Vacation',
    sick: 'Sick Leave',
    personal: 'Personal',
    emergency: 'Emergency',
    
    // Leave Management
    manageLeaveRequests: 'Manage Leave Requests',
    employee: 'Employee',
    status: 'Status',
    actions: 'Actions',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    approve: 'Approve',
    reject: 'Reject',
    
    // Employee Management
    employeeManagement: 'Employee Management',
    addEmployee: 'Add Employee',
    name: 'Name',
    email: 'Email',
    position: 'Position',
    department: 'Department',
    joinDate: 'Join Date',
    edit: 'Edit',
    delete: 'Delete',
    
    // Documents
    companyDocuments: 'Company Documents',
    documentName: 'Document Name',
    type: 'Type',
    uploadDate: 'Upload Date',
    download: 'Download',
    
    // Company Settings
    companySettingsTitle: 'Company Settings',
    general: 'General',
    companyName: 'Company Name',
    address: 'Address',
    phone: 'Phone',
    save: 'Save',
    
    // Profile & Security
    profile: 'Profile',
    security: 'Security',
    logout: 'Logout',
    changePassword: 'Change Password',
    twoFactorAuth: 'Two-Factor Authentication',
    backupEmail: 'Backup Email',
    
    // Common
    welcomeBack: 'Welcome back, Admin',
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    
    // Days of week
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    
    // Departments
    itDepartment: 'IT Department',
    hrDepartment: 'HR Department',
    operations: 'Operations',
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de Bord',
    leaveRequest: 'Demande de Congé',
    schedule: 'Horaire',
    leaveManagement: 'Gestion des Congés',
    employees: 'Employés',
    documents: 'Documents',
    companySettings: 'Paramètres de l\'Entreprise',
    navigation: 'Navigation',
    erpSystem: 'Système ERP',
    
    // Dashboard
    dashboardOverview: 'Aperçu du Tableau de Bord',
    monitorMetrics: 'Surveillez les métriques clés et les activités de votre entreprise',
    totalEmployees: 'Total des Employés',
    pendingLeaveRequests: 'Demandes de Congé en Attente',
    activeDepartments: 'Départements Actifs',
    departmentDistribution: 'Répartition des Départements',
    monthlyLeaveRequests: 'Demandes de Congé Mensuelles',
    recentActivity: 'Activité Récente',
    fromLastMonth: 'du mois dernier',
    
    // Schedule
    departmentSchedule: 'Horaire des Départements',
    weeklyScheduleDesc: 'Horaire hebdomadaire montrant quel département travaille à quel créneau horaire',
    departments: 'Départements',
    weeklyScheduleGrid: 'Grille d\'Horaire Hebdomadaire',
    timeSlot: 'Créneau Horaire',
    weeklyHours: 'Heures Hebdomadaires',
    shiftPattern: 'Modèle d\'Équipe',
    hours: 'heures',
    eightHourShifts: 'Équipes de 8 heures',
    
    // Leave Request
    requestLeave: 'Demander un Congé',
    leaveType: 'Type de Congé',
    startDate: 'Date de Début',
    endDate: 'Date de Fin',
    reason: 'Raison',
    submitRequest: 'Soumettre la Demande',
    vacation: 'Vacances',
    sick: 'Congé Maladie',
    personal: 'Personnel',
    emergency: 'Urgence',
    
    // Leave Management
    manageLeaveRequests: 'Gérer les Demandes de Congé',
    employee: 'Employé',
    status: 'Statut',
    actions: 'Actions',
    pending: 'En Attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    approve: 'Approuver',
    reject: 'Rejeter',
    
    // Employee Management
    employeeManagement: 'Gestion des Employés',
    addEmployee: 'Ajouter un Employé',
    name: 'Nom',
    email: 'Email',
    position: 'Poste',
    department: 'Département',
    joinDate: 'Date d\'Embauche',
    edit: 'Modifier',
    delete: 'Supprimer',
    
    // Documents
    companyDocuments: 'Documents de l\'Entreprise',
    documentName: 'Nom du Document',
    type: 'Type',
    uploadDate: 'Date de Téléchargement',
    download: 'Télécharger',
    
    // Company Settings
    companySettingsTitle: 'Paramètres de l\'Entreprise',
    general: 'Général',
    companyName: 'Nom de l\'Entreprise',
    address: 'Adresse',
    phone: 'Téléphone',
    save: 'Sauvegarder',
    
    // Profile & Security
    profile: 'Profil',
    security: 'Sécurité',
    logout: 'Déconnexion',
    changePassword: 'Changer le Mot de Passe',
    twoFactorAuth: 'Authentification à Deux Facteurs',
    backupEmail: 'Email de Secours',
    
    // Common
    welcomeBack: 'Bienvenue, Admin',
    language: 'Langue',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    
    // Days of week
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
    
    // Departments
    itDepartment: 'Département IT',
    hrDepartment: 'Département RH',
    operations: 'Opérations',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
