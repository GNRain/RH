import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api'; // --- Use the new API client ---
import { useTranslation } from 'react-i18next';
import { VscSearch, VscEdit, VscAdd, VscRefresh } from 'react-icons/vsc';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

// A custom hook to debounce input
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

// --- Data Types ---
type UserStatus = 'ACTIVE' | 'INACTIVE';
type Role = 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';

interface User {
  id: string; name: string; familyName: string; email: string; cin: string;
  position: { id: string, name: string };
  department: { id: string, name: string };
  status: UserStatus; role: Role; phoneNumber?: string;
  managerId?: string; teamLeaderId?: string;
}

const initialCreateFormData = {
  name: '', familyName: '', email: '', cin: '', positionId: '', phoneNumber: '',
  departmentId: '', role: 'EMPLOYEE' as Role,
  password_to_be_hashed: '', teamLeaderId: '', managerId: '',
};

const Employee = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState(initialCreateFormData);

  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
  const [positions, setPositions] = useState<{ id: string, name: string }[]>([]);

  const [teamLeaders, setTeamLeaders] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User & { departmentId?: string, positionId?: string }>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await apiClient.get('/users', { params });
      setUsers(response.data);
    } catch (err) { console.error('Failed to fetch employees.', err); }
    finally { setLoading(false); }
  }, [debouncedSearchTerm, departmentFilter, statusFilter]);

  useEffect(() => {
    const fetchSupportingData = async () => {
      try {
        const [tlRes, managerRes, deptRes, posRes] = await Promise.all([
          apiClient.get('/users', { params: { role: 'TEAM_LEADER' } }),
          apiClient.get('/users', { params: { role: 'MANAGER' } }),
          apiClient.get('/departments'),
          apiClient.get('/positions'),
        ]);
        setTeamLeaders(tlRes.data);
        setManagers(managerRes.data);
        setDepartments(deptRes.data);
        setPositions(posRes.data);
      } catch (error) { console.error('Failed to fetch supporting data', error); }
    };
    fetchSupportingData();
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...createFormData };
    if (payload.role === 'EMPLOYEE' && payload.teamLeaderId) {
      const selectedTeamLeader = teamLeaders.find(tl => tl.id === payload.teamLeaderId);
      payload.managerId = selectedTeamLeader?.managerId || '';
    }
    try {
      await apiClient.post('/users', payload);
      setIsCreateModalOpen(false);
      setCreateFormData(initialCreateFormData);
      fetchUsers();
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message[0] || 'Failed to create user.',
        variant: "destructive",
      });
    }
  };

  const handleOpenEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setEditFormData({
      ...userToEdit,
      departmentId: userToEdit.department.id,
      positionId: userToEdit.position.id,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const payload = { ...editFormData };
    if (payload.role === 'EMPLOYEE' && payload.teamLeaderId) {
        const selectedTeamLeader = teamLeaders.find(tl => tl.id === payload.teamLeaderId);
        payload.managerId = selectedTeamLeader?.managerId;
    }
    try {
      await apiClient.patch(`/users/${editingUser.id}`, payload);
      setIsEditModalOpen(false);
      fetchUsers();
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message[0] || 'Failed to update user.',
        variant: "destructive",
      });
    }
  };

  const handleReset2FA = async () => {
    if (!editingUser) return;
    if (window.confirm(t('employees_page.edit_modal.reset_2fa_confirm', { name: editingUser.name }))) {
      try {
        await apiClient.patch(`/users/${editingUser.id}/reset-2fa`, {});
        toast({
          title: "Success",
          description: "2FA has been successfully reset.",
        });
        setIsEditModalOpen(false);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.response?.data?.message[0] || 'Failed to reset 2FA.',
          variant: "destructive",
        });
      }
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "IT Department":
        return "bg-blue-100 text-blue-800";
      case "HR Department":
        return "bg-green-100 text-green-800";
      case "Operations":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('employees_page.title')}</h2>
          <p className="text-gray-600">{t('employees_page.subtitle')}</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button><VscAdd className="mr-2" />{t('employees_page.new_employee_button')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('employees_page.create_modal.title')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t('employees_page.create_modal.first_name')}</Label>
                <Input id="name" name="name" value={createFormData.name} onChange={handleCreateFormChange} placeholder={t('employees_page.create_modal.first_name_placeholder')} required />
              </div>
              <div>
                <Label htmlFor="familyName">{t('employees_page.create_modal.family_name')}</Label>
                <Input id="familyName" name="familyName" value={createFormData.familyName} onChange={handleCreateFormChange} placeholder={t('employees_page.create_modal.family_name_placeholder')} required />
              </div>
              <div>
                <Label htmlFor="email">{t('employees_page.create_modal.email')}</Label>
                <Input id="email" type="email" name="email" value={createFormData.email} onChange={handleCreateFormChange} placeholder={t('employees_page.create_modal.email_placeholder')} required />
              </div>
              <div>
                <Label htmlFor="phoneNumber">{t('employees_page.create_modal.phone_number')}</Label>
                <Input id="phoneNumber" name="phoneNumber" value={createFormData.phoneNumber} onChange={handleCreateFormChange} placeholder={t('employees_page.create_modal.phone_number_placeholder')} required />
              </div>
              <div>
                <Label htmlFor="cin">{t('employees_page.create_modal.cin')}</Label>
                <Input id="cin" name="cin" value={createFormData.cin} onChange={handleCreateFormChange} placeholder={t('employees_page.create_modal.cin_placeholder')} required />
              </div>
              <div>
                <Label htmlFor="positionId">{t('employees_page.create_modal.position')}</Label>
                <Select name="positionId" value={createFormData.positionId} onValueChange={(value) => setCreateFormData({ ...createFormData, positionId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('employees_page.create_modal.position_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('employees_page.placeholders.none')}</SelectItem>
                    {positions.map(p => (<SelectItem key={p.id} value={p.id}>{t(`positions.${p.name}`)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="password_to_be_hashed">{t('employees_page.create_modal.password')}</Label>
                <Input id="password_to_be_hashed" name="password_to_be_hashed" type="password" value={createFormData.password_to_be_hashed} onChange={handleCreateFormChange} required minLength={8} />
              </div>
              <div>
                <Label htmlFor="departmentId">{t('employees_page.create_modal.department')}</Label>
                <Select name="departmentId" value={createFormData.departmentId} onValueChange={(value) => setCreateFormData({ ...createFormData, departmentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('employees_page.create_modal.department_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('employees_page.placeholders.none')}</SelectItem>
                    {departments.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">{t('employees_page.create_modal.role')}</Label>
                <Select name="role" value={createFormData.role} onValueChange={(value) => setCreateFormData({ ...createFormData, role: value as Role })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('employees_page.create_modal.role_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">{t('employees_page.roles.employee')}</SelectItem>
                    <SelectItem value="TEAM_LEADER">{t('employees_page.roles.team_leader')}</SelectItem>
                    <SelectItem value="MANAGER">{t('employees_page.roles.manager')}</SelectItem>
                    <SelectItem value="HR">{t('employees_page.roles.hr')}</SelectItem>
                    <SelectItem value="DHR">{t('employees_page.roles.dhr')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {createFormData.role === 'EMPLOYEE' && (
                <div className="col-span-2">
                  <Label htmlFor="teamLeaderId">{t('employees_page.create_modal.assign_tl')}</Label>
                  <Select name="teamLeaderId" value={createFormData.teamLeaderId} onValueChange={(value) => setCreateFormData({ ...createFormData, teamLeaderId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('employees_page.placeholders.none')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('employees_page.placeholders.none')}</SelectItem>
                      {teamLeaders.map(tl => (<SelectItem key={tl.id} value={tl.id}>{tl.name} {tl.familyName}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">{t('employees_page.create_modal.tl_note')}</p>
                </div>
              )}
              {createFormData.role === 'TEAM_LEADER' && (
                <div className="col-span-2">
                  <Label htmlFor="managerId">{t('employees_page.create_modal.assign_manager')}</Label>
                  <Select name="managerId" value={createFormData.managerId} onValueChange={(value) => setCreateFormData({ ...createFormData, managerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('employees_page.placeholders.none')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('employees_page.placeholders.none')}</SelectItem>
                      {managers.map(m => (<SelectItem key={m.id} value={m.id}>{m.name} {m.familyName}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex space-x-2 justify-end col-span-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>{t('leave_management_page.cancel_button')}</Button>
                <Button type="submit">{t('employees_page.create_modal.create_button')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <VscSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t('employees_page.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('employees_page.departments.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('employees_page.departments.all')}</SelectItem>
                {departments.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatus | '')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('employees_page.statuses.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('employees_page.statuses.all')}</SelectItem>
                <SelectItem value="ACTIVE">{t('employees_page.statuses.active')}</SelectItem>
                <SelectItem value="INACTIVE">{t('employees_page.statuses.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('employees_page.table.title')} ({users.length} {t('employees_page.table.employees')})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('employees_page.table.name')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('employees_page.table.contact')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('employees_page.table.position')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('employees_page.table.department')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('employees_page.table.status')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('employees_page.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-4">{t('employees_page.loading')}</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4">{t('employees_page.no_results')}</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name.charAt(0)}{user.familyName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name} {user.familyName}</div>
                            <div className="text-sm text-gray-600">CIN: {user.cin}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-600">{user.phoneNumber}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{t(`positions.${user.position.name}`)}</td>
                      <td className="py-4 px-4">
                        <Badge className={getDepartmentColor(user.department.name)}>
                          {user.department.name}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(user.status)}>
                          {t(`employees_page.statuses.${user.status.toLowerCase()}`)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Dialog open={isEditModalOpen && editingUser?.id === user.id} onOpenChange={setIsEditModalOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(user)}>
                              <VscEdit className="mr-2" />
                              {t('employees_page.table.edit_button')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{t('employees_page.edit_modal.title', { name: `${editingUser?.name} ${editingUser?.familyName}`})}</DialogTitle>
                            </DialogHeader>
                            {editingUser && (
                              <form onSubmit={handleUpdateUser} className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-name">{t('employees_page.create_modal.first_name')}</Label>
                                  <Input id="edit-name" name="name" value={editFormData.name || ''} onChange={handleEditFormChange} />
                                </div>
                                <div>
                                  <Label htmlFor="edit-familyName">{t('employees_page.create_modal.family_name')}</Label>
                                  <Input id="edit-familyName" name="familyName" value={editFormData.familyName || ''} onChange={handleEditFormChange} />
                                </div>
                                <div>
                                  <Label htmlFor="edit-email">{t('employees_page.create_modal.email')}</Label>
                                  <Input id="edit-email" name="email" value={editFormData.email || ''} onChange={handleEditFormChange} />
                                </div>
                                <div>
                                  <Label htmlFor="edit-phoneNumber">{t('employees_page.create_modal.phone_number')}</Label>
                                  <Input id="edit-phoneNumber" name="phoneNumber" value={editFormData.phoneNumber || ''} onChange={handleEditFormChange} />
                                </div>
                                <div>
                                  <Label htmlFor="edit-positionId">{t('employees_page.create_modal.position')}</Label>
                                  <Select name="positionId" value={editFormData.positionId || 'none'} onValueChange={(value) => setEditFormData({ ...editFormData, positionId: value })}>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('employees_page.placeholders.none')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">{t('employees_page.placeholders.none')}</SelectItem>
                                      {positions.map(p => (<SelectItem key={p.id} value={p.id}>{t(`positions.${p.name}`)}</SelectItem>))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-departmentId">{t('employees_page.create_modal.department')}</Label>
                                  <Select name="departmentId" value={editFormData.departmentId || 'none'} onValueChange={(value) => setEditFormData({ ...editFormData, departmentId: value })}>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('employees_page.placeholders.none')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">{t('employees_page.placeholders.none')}</SelectItem>
                                      {departments.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-role">{t('employees_page.create_modal.role')}</Label>
                                  <Select name="role" value={editFormData.role || 'EMPLOYEE'} onValueChange={(value) => setEditFormData({ ...editFormData, role: value as Role })}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="EMPLOYEE">{t('employees_page.roles.employee')}</SelectItem>
                                      <SelectItem value="TEAM_LEADER">{t('employees_page.roles.team_leader')}</SelectItem>
                                      <SelectItem value="MANAGER">{t('employees_page.roles.manager')}</SelectItem>
                                      <SelectItem value="HR">{t('employees_page.roles.hr')}</SelectItem>
                                      <SelectItem value="DHR">{t('employees_page.roles.dhr')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-status">{t('employees_page.table.status')}</Label>
                                  <Select name="status" value={editFormData.status || 'ACTIVE'} onValueChange={(value) => setEditFormData({ ...editFormData, status: value as UserStatus })}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ACTIVE">{t('employees_page.statuses.active')}</SelectItem>
                                      <SelectItem value="INACTIVE">{t('employees_page.statuses.inactive')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                {editFormData.role === 'EMPLOYEE' && (
                                  <div className="col-span-2">
                                    <Label htmlFor="edit-teamLeaderId">{t('employees_page.edit_modal.change_tl')}</Label>
                                    <Select name="teamLeaderId" value={editFormData.teamLeaderId || 'none'} onValueChange={(value) => setEditFormData({ ...editFormData, teamLeaderId: value })}>
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('employees_page.placeholders.none')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">{t('employees_page.placeholders.none')}</SelectItem>
                                        {teamLeaders.map(tl => (<SelectItem key={tl.id} value={tl.id}>{tl.name} {tl.familyName}</SelectItem>))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                {editFormData.role === 'TEAM_LEADER' && (
                                  <div className="col-span-2">
                                    <Label htmlFor="edit-managerId">{t('employees_page.edit_modal.change_manager')}</Label>
                                    <Select name="managerId" value={editFormData.managerId || 'none'} onValueChange={(value) => setEditFormData({ ...editFormData, managerId: value })}>
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('employees_page.placeholders.none')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">{t('employees_page.placeholders.none')}</SelectItem>
                                        {managers.map(m => (<SelectItem key={m.id} value={m.id}>{m.name} {m.familyName}</SelectItem>))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                <div className="flex space-x-2 justify-end col-span-2 mt-6">
                                  <Button type="button" variant="outline" onClick={handleReset2FA} className="mr-auto">
                                    <VscRefresh className="mr-2" />{t('employees_page.edit_modal.reset_2fa_button')}
                                  </Button>
                                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>{t('leave_management_page.cancel_button')}</Button>
                                  <Button type="submit">{t('employees_page.edit_modal.save_button')}</Button>
                                </div>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employee;