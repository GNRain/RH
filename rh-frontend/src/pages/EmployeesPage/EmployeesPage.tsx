import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './EmployeesPage.css';
import { VscSearch, VscEdit } from 'react-icons/vsc';
import { Modal } from '../../components/Modal/Modal';

const API_URL = 'http://localhost:3000';

// A custom hook to debounce input
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// Define types for our data
type UserStatus = 'ACTIVE' | 'INACTIVE';
type Department = 'HR' | 'IT' | 'Business' | 'Management';

interface User {
  id: string;
  name: string;
  familyName: string;
  email: string;
  cin: string;
  position: string;
  department: Department;
  status: UserStatus;
}

export function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- NEW STATE FOR MODAL AND EDITING ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<Department | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (departmentFilter) params.append('department', departmentFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch employees.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('access_token');
      // The backend 'updateUserDto' only allows certain fields, so we send what's editable.
      const { name, familyName, position, department, status } = editFormData;
      await axios.patch(`${API_URL}/users/${selectedUser.id}`, 
        { name, familyName, position, department, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleModalClose();
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert('Failed to update user.');
    }
  };

  return (
    <div className="employees-page-container">
      <h1>Employees</h1>
      <p>Search, filter, and manage all employees in the organization.</p>
      
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <VscSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or CIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filters">
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value as Department | '')} className="filter-select">
            <option value="">All Departments</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Business">Business</option>
            <option value="Management">Management</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as UserStatus | '')} className="filter-select">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Loading...</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                        <div className="avatar-small">{user.name.charAt(0)}{user.familyName.charAt(0)}</div>
                        <div>
                            <strong>{user.name} {user.familyName}</strong>
                            <small>{user.cin}</small>
                        </div>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </td>
                  <td>{user.department}</td>
                  <td>{user.position}</td>
                  <td>
                    <span className={`status-pill ${user.status.toLowerCase()}`}>{user.status}</span>
                  </td>
                  <td>
                    <button className="action-btn-table" title="Edit User" onClick={() => handleEdit(user.id)}>
                      <VscEdit />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && users.length === 0 && <p className="no-results">No employees found matching your criteria.</p>}
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        title={selectedUser ? `Edit ${selectedUser.name} ${selectedUser.familyName}` : 'Edit Employee'} 
             >
        <form onSubmit={handleUpdateUser} className="edit-form">
            <div className="edit-form-grid">
                <div className="form-group">
                    <label>First Name</label>
                    <input name="name" value={editFormData.name || ''} onChange={handleFormChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label>Family Name</label>
                    <input name="familyName" value={editFormData.familyName || ''} onChange={handleFormChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label>Position</label>
                    <input name="position" value={editFormData.position || ''} onChange={handleFormChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label>Department</label>
                    <select name="department" value={editFormData.department || ''} onChange={handleFormChange} className="form-input">
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Business">Business</option>
                        <option value="Management">Management</option>
                    </select>
                </div>
                <div className="form-group full-width">
                    <label>Status</label>
                    <select name="status" value={editFormData.status || ''} onChange={handleFormChange} className="form-input">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>
            <div className="modal-actions">
                <button type="button" onClick={handleModalClose} className="button button-secondary">Cancel</button>
                <button type="submit" className="button button-primary">Save Changes</button>
            </div>
        </form>
      </Modal>
    </div>
  );
}   