import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './EmployeesPage.css';
import { VscSearch, VscEdit, VscAdd, VscRefresh } from 'react-icons/vsc';
import { Modal } from '../../components/Modal/Modal';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:3000';

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

export function EmployeesPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState(initialCreateFormData);
  
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [positions, setPositions] = useState<{id: string, name: string}[]>([]);
  
  const [teamLeaders, setTeamLeaders] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User & { departmentId?: string, positionId?: string }>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (departmentFilter) params.append('department', departmentFilter);
      if (statusFilter) params.append('status', statusFilter);
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }, params,
      });
      setUsers(response.data);
    } catch (err) { console.error('Failed to fetch employees.', err); } 
    finally { setLoading(false); }
  }, [debouncedSearchTerm, departmentFilter, statusFilter]);

  useEffect(() => {
    const fetchSupportingData = async () => {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [tlRes, managerRes, deptRes, posRes] = await Promise.all([
          axios.get(`${API_URL}/users`, { headers, params: { role: 'TEAM_LEADER' } }),
          axios.get(`${API_URL}/users`, { headers, params: { role: 'MANAGER' } }),
          axios.get(`${API_URL}/departments`, { headers }),
          axios.get(`${API_URL}/positions`, { headers }),
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
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/users`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsCreateModalOpen(false);
      setCreateFormData(initialCreateFormData);
      fetchUsers();
    } catch (err: any) { alert(err.response?.data?.message[0] || 'Failed to create user.'); }
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
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API_URL}/users/${editingUser.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) { alert(err.response?.data?.message[0] || 'Failed to update user.'); }
  };

  const handleReset2FA = async () => {
    if (!editingUser) return;
    if (window.confirm(t('employees_page.edit_modal.reset_2fa_confirm', { name: editingUser.name }))) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.patch(`${API_URL}/users/${editingUser.id}/reset-2fa`, {}, { headers: { Authorization: `Bearer ${token}` }});
        alert('2FA has been successfully reset.');
        setIsEditModalOpen(false);
      } catch (err: any) { alert(err.response?.data?.message[0] || 'Failed to reset 2FA.'); }
    }
  };

  return (
    <div className="employees-page-container">
      <h1>{t('employees_page.title')}</h1>
      <p>{t('employees_page.subtitle')}</p>
      <div className="controls-bar">
        <div className="search-input-wrapper"><VscSearch className="search-icon" /><input type="text" placeholder={t('employees_page.search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input"/></div>
        <div className="filters">
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="filter-select">
            <option value="">{t('employees_page.departments.all')}</option>
            {departments.map(dept => <option key={dept.id} value={dept.name}>{dept.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')} className="filter-select"><option value="">{t('employees_page.statuses.all')}</option><option value="ACTIVE">{t('employees_page.statuses.active')}</option><option value="INACTIVE">{t('employees_page.statuses.inactive')}</option></select>
        </div>
        <button className="button button-primary" onClick={() => setIsCreateModalOpen(true)}><VscAdd /> {t('employees_page.new_employee_button')}</button>
      </div>
      
      <div className="table-container">
        <table>
          <thead><tr><th>{t('employees_page.table.name')}</th><th>{t('employees_page.table.contact')}</th><th>{t('employees_page.table.position')}</th><th>{t('employees_page.table.department')}</th><th>{t('employees_page.table.status')}</th><th>{t('employees_page.table.actions')}</th></tr></thead>
          <tbody>
            {loading ? (<tr><td colSpan={6} style={{ textAlign: 'center' }}>{t('employees_page.loading')}</td></tr>) : (
              users.map(user => (
                <tr key={user.id}>
                  <td><div className="user-cell"><div className="avatar-small">{user.name.charAt(0)}{user.familyName.charAt(0)}</div><div><strong>{user.name} {user.familyName}</strong><small>{user.cin}</small></div></div></td>
                  <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                  <td>{t(`positions.${user.position.name}`)}</td>
                  <td>{user.department.name}</td>
                  <td><span className={`status-pill ${user.status.toLowerCase()}`}>{t(`employees_page.statuses.${user.status.toLowerCase()}`)}</span></td>
                  <td><button className="action-btn-table" title={t('employees_page.edit_modal.title', { name: `${user.name} ${user.familyName}`})} onClick={() => handleOpenEditModal(user)}><VscEdit /></button></td>
                </tr>
              )))}
          </tbody>
        </table>
        {!loading && users.length === 0 && <p className="no-results">{t('employees_page.no_results')}</p>}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('employees_page.create_modal.title')}>
        <form onSubmit={handleCreateUser} className="edit-form">
          <div className="edit-form-grid">
            <div className="form-group"><label>{t('employees_page.create_modal.first_name')}</label><input name="name" value={createFormData.name} onChange={handleCreateFormChange} className="form-input" required /></div>
            <div className="form-group"><label>{t('employees_page.create_modal.family_name')}</label><input name="familyName" value={createFormData.familyName} onChange={handleCreateFormChange} className="form-input" required /></div>
            <div className="form-group"><label>{t('employees_page.create_modal.email')}</label><input type="email" name="email" value={createFormData.email} onChange={handleCreateFormChange} className="form-input" required /></div>
            <div className="form-group"><label>{t('employees_page.create_modal.phone_number')}</label><input name="phoneNumber" value={createFormData.phoneNumber} onChange={handleCreateFormChange} className="form-input" required /></div>
            <div className="form-group"><label>{t('employees_page.create_modal.cin')}</label><input name="cin" value={createFormData.cin} onChange={handleCreateFormChange} className="form-input" required /></div>
            <div className="form-group"><label>{t('employees_page.create_modal.position')}</label><select name="positionId" value={createFormData.positionId} onChange={handleCreateFormChange} className="form-input" required><option value="">Select...</option>{positions.map(p => (<option key={p.id} value={p.id}>{t(`positions.${p.name}`)}</option>))}</select></div>
            <div className="form-group full-width"><label>{t('employees_page.create_modal.password')}</label><input name="password_to_be_hashed" type="password" value={createFormData.password_to_be_hashed} onChange={handleCreateFormChange} className="form-input" required minLength={8} /></div>
            <div className="form-group"><label>{t('employees_page.create_modal.department')}</label><select name="departmentId" value={createFormData.departmentId} onChange={handleCreateFormChange} className="form-input" required><option value="">Select...</option>{departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}</select></div>
            <div className="form-group"><label>{t('employees_page.create_modal.role')}</label><select name="role" value={createFormData.role} onChange={handleCreateFormChange} className="form-input"><option value="EMPLOYEE">{t('employees_page.roles.employee')}</option><option value="TEAM_LEADER">{t('employees_page.roles.team_leader')}</option><option value="MANAGER">{t('employees_page.roles.manager')}</option><option value="HR">{t('employees_page.roles.hr')}</option><option value="DHR">{t('employees_page.roles.dhr')}</option></select></div>
            {createFormData.role === 'EMPLOYEE' && (<div className="form-group full-width"><label>{t('employees_page.create_modal.assign_tl')}</label><select name="teamLeaderId" value={createFormData.teamLeaderId} onChange={handleCreateFormChange} className="form-input"><option value="">{t('employees_page.placeholders.none')}</option>{teamLeaders.map(tl => (<option key={tl.id} value={tl.id}>{tl.name} {tl.familyName}</option>))}</select><small>{t('employees_page.create_modal.tl_note')}</small></div>)}
            {createFormData.role === 'TEAM_LEADER' && (<div className="form-group full-width"><label>{t('employees_page.create_modal.assign_manager')}</label><select name="managerId" value={createFormData.managerId} onChange={handleCreateFormChange} className="form-input"><option value="">{t('employees_page.placeholders.none')}</option>{managers.map(m => (<option key={m.id} value={m.id}>{m.name} {m.familyName}</option>))}</select></div>)}
          </div>
          <div className="modal-actions"><button type="button" onClick={() => setIsCreateModalOpen(false)} className="button button-secondary">{t('leave_management_page.cancel_button')}</button><button type="submit" className="button button-primary">{t('employees_page.create_modal.create_button')}</button></div>
        </form>
      </Modal>

      {editingUser && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={t('employees_page.edit_modal.title', { name: `${editingUser.name} ${editingUser.familyName}`})}>
           <form onSubmit={handleUpdateUser} className="edit-form">
            <div className="edit-form-grid">
              <div className="form-group"><label>{t('employees_page.create_modal.first_name')}</label><input name="name" value={editFormData.name || ''} onChange={handleEditFormChange} className="form-input" /></div>
              <div className="form-group"><label>{t('employees_page.create_modal.family_name')}</label><input name="familyName" value={editFormData.familyName || ''} onChange={handleEditFormChange} className="form-input" /></div>
              <div className="form-group"><label>{t('employees_page.create_modal.email')}</label><input name="email" value={editFormData.email || ''} onChange={handleEditFormChange} className="form-input" /></div>
              <div className="form-group"><label>{t('employees_page.create_modal.phone_number')}</label><input name="phoneNumber" value={editFormData.phoneNumber || ''} onChange={handleEditFormChange} className="form-input" /></div>
              <div className="form-group"><label>{t('employees_page.create_modal.position')}</label><select name="positionId" value={editFormData.positionId || ''} onChange={handleEditFormChange} className="form-input"><option value="">{t('employees_page.placeholders.none')}</option>{positions.map(p => (<option key={p.id} value={p.id}>{t(`positions.${p.name}`)}</option>))}</select></div>
              <div className="form-group"><label>{t('employees_page.create_modal.department')}</label><select name="departmentId" value={editFormData.departmentId || ''} onChange={handleEditFormChange} className="form-input"><option value="">{t('employees_page.placeholders.none')}</option>{departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}</select></div>
              <div className="form-group"><label>{t('employees_page.create_modal.role')}</label><select name="role" value={editFormData.role || ''} onChange={handleEditFormChange} className="form-input"><option value="EMPLOYEE">{t('employees_page.roles.employee')}</option><option value="TEAM_LEADER">{t('employees_page.roles.team_leader')}</option><option value="MANAGER">{t('employees_page.roles.manager')}</option><option value="HR">{t('employees_page.roles.hr')}</option><option value="DHR">{t('employees_page.roles.dhr')}</option></select></div>
              <div className="form-group"><label>{t('employees_page.table.status')}</label><select name="status" value={editFormData.status || ''} onChange={handleEditFormChange} className="form-input"><option value="ACTIVE">{t('employees_page.statuses.active')}</option><option value="INACTIVE">{t('employees_page.statuses.inactive')}</option></select></div>
              {editFormData.role === 'EMPLOYEE' && (<div className="form-group full-width"><label>{t('employees_page.edit_modal.change_tl')}</label><select name="teamLeaderId" value={editFormData.teamLeaderId || ''} onChange={handleEditFormChange} className="form-input"><option value="">{t('employees_page.placeholders.none')}</option>{teamLeaders.map(tl => (<option key={tl.id} value={tl.id}>{tl.name} {tl.familyName}</option>))}</select></div>)}
              {editFormData.role === 'TEAM_LEADER' && (<div className="form-group full-width"><label>{t('employees_page.edit_modal.change_manager')}</label><select name="managerId" value={editFormData.managerId || ''} onChange={handleEditFormChange} className="form-input"><option value="">{t('employees_page.placeholders.none')}</option>{managers.map(m => (<option key={m.id} value={m.id}>{m.name} {m.familyName}</option>))}</select></div>)}
            </div>
            <div className="modal-actions">
              <button type="button" onClick={handleReset2FA} className="button button-danger"><VscRefresh /> {t('employees_page.edit_modal.reset_2fa_button')}</button>
              <div style={{ flexGrow: 1 }}></div>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="button button-secondary">{t('leave_management_page.cancel_button')}</button>
              <button type="submit" className="button button-primary">{t('employees_page.edit_modal.save_button')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}