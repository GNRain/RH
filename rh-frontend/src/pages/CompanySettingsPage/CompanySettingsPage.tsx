import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { VscAdd, VscEdit, VscTrash } from 'react-icons/vsc';
import { Modal } from '../../components/Modal/Modal';
import './CompanySettingsPage.css';

const API_URL = 'http://localhost:3000';

// Add Shift and updated Department types
type Shift = {
  id: string;
  name: string;
}
type Department = {
  id: string;
  name: string;
  color: string;
  defaultShiftId: string | null;
};
type Position = {
  id: string;
  name: string;
};


export function CompanySettingsPage() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalType, setModalType] = useState<'department' | 'position'>('department');
  const [currentItem, setCurrentItem] = useState<Department | Position | null>(null);
  
  // State for the department form
  const [deptName, setDeptName] = useState('');
  const [deptColor, setDeptColor] = useState('#CCCCCC');
  const [defaultShiftId, setDefaultShiftId] = useState<string | undefined>(undefined);
  
  // State for the position form
  const [posName, setPosName] = useState('');


  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const [deptRes, posRes, shiftRes] = await Promise.all([
        axios.get(`${API_URL}/departments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/positions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/shift`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDepartments(deptRes.data);
      setPositions(posRes.data);
      setShifts(shiftRes.data);
    } catch (error) {
      console.error("Failed to fetch settings data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (mode: 'add' | 'edit', type: 'department' | 'position', item: Department | Position | null = null) => {
    setModalMode(mode);
    setModalType(type);
    setCurrentItem(item);
    
    if (type === 'department') {
        const dept = item as Department;
        setDeptName(dept ? dept.name : '');
        setDeptColor(dept ? dept.color : '#CCCCCC');
        setDefaultShiftId(dept?.defaultShiftId || undefined);
    } else {
        const pos = item as Position;
        setPosName(item ? (t(`positions.${pos.name}`)) : '');
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setDeptName('');
    setDeptColor('#CCCCCC');
    setDefaultShiftId(undefined);
    setPosName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const url = `${API_URL}/${modalType}s`;
    let payload;

    if (modalType === 'department') {
        payload = { name: deptName, color: deptColor, defaultShiftId: defaultShiftId || null };
    } else {
        payload = { name: posName };
    }

    try {
      if (modalMode === 'add') {
        await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else if (currentItem) {
        await axios.patch(`${url}/${currentItem.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchData();
      closeModal();
    } catch (error) {
      alert(`Failed to ${modalMode} ${modalType}.`);
      console.error(error);
    }
  };

  const handleDelete = async (type: 'department' | 'position', id: string) => {
    if (window.confirm(t('settings_page.delete_confirm'))) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`${API_URL}/${type}s/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch (error) {
        alert(`Failed to delete ${type}. Make sure no users are assigned to it.`);
      }
    }
  };
  
  const renderDepartmentModalContent = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="deptName">{t('settings_page.name_label')}</label>
        <input id="deptName" type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)} className="form-input" required />
      </div>
      <div className="form-group">
        <label htmlFor="deptColor">Color</label>
        <input id="deptColor" type="color" value={deptColor} onChange={(e) => setDeptColor(e.target.value)} className="form-input" required />
      </div>
      <div className="form-group">
        <label htmlFor="defaultShift">Default Shift</label>
        <select id="defaultShift" value={defaultShiftId || ''} onChange={(e) => setDefaultShiftId(e.target.value)} className="form-input">
            <option value="">None</option>
            {shifts.map(shift => <option key={shift.id} value={shift.id}>{shift.name}</option>)}
        </select>
      </div>
      <div className="modal-actions">
        <button type="button" onClick={closeModal} className="button button-secondary">{t('leave_management_page.cancel_button')}</button>
        <button type="submit" className="button button-primary">{t('employees_page.edit_modal.save_button')}</button>
      </div>
    </form>
  );

  const renderPositionModalContent = () => (
     <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="itemName">{t('settings_page.name_label')}</label>
            <input id="itemName" type="text" value={posName} onChange={(e) => setPosName(e.target.value)} className="form-input" required />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={closeModal} className="button button-secondary">{t('leave_management_page.cancel_button')}</button>
            <button type="submit" className="button button-primary">{t('employees_page.edit_modal.save_button')}</button>
          </div>
     </form>
  );

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="settings-page-container">
      <h1>{t('settings_page.title')}</h1>
      <p>{t('settings_page.subtitle')}</p>

      <div className="settings-layout">
        {/* Departments Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>{t('settings_page.departments_title')}</h3>
            <button className="button button-primary" onClick={() => openModal('add', 'department')}>
              <VscAdd /> {t('settings_page.add_department_button')}
            </button>
          </div>
          <div className="settings-list">
            {departments.map(dept => (
              <div key={dept.id} className="list-item">
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <div className="legend-color-box" style={{backgroundColor: dept.color}} />
                    <span>{dept.name}</span>
                </div>
                <div className="list-item-actions">
                  <button onClick={() => openModal('edit', 'department', dept)}><VscEdit /></button>
                  <button onClick={() => handleDelete('department', dept.id)}><VscTrash /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Positions Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>{t('settings_page.positions_title')}</h3>
            <button className="button button-primary" onClick={() => openModal('add', 'position')}>
              <VscAdd /> {t('settings_page.add_position_button')}
            </button>
          </div>
          <div className="settings-list">
            {positions.map(pos => (
              <div key={pos.id} className="list-item">
                <span>{t(`positions.${pos.name}`)}</span>
                <div className="list-item-actions">
                   {/* Editing position names (the keys) is disabled to prevent breaking translations */}
                  <button onClick={() => handleDelete('position', pos.id)}><VscTrash /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={t(`settings_page.${modalMode}_${modalType}_title`)}
      >
        {modalType === 'department' ? renderDepartmentModalContent() : renderPositionModalContent()}
      </Modal>
    </div>
  );
}