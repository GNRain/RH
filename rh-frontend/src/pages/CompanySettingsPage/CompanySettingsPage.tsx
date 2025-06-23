import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { VscAdd, VscEdit, VscTrash } from 'react-icons/vsc';
import { Modal } from '../../components/Modal/Modal';
import './CompanySettingsPage.css';

const API_URL = 'http://localhost:3000';

type DataItem = {
  id: string;
  name: string;
};

export function CompanySettingsPage() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<DataItem[]>([]);
  const [positions, setPositions] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalType, setModalType] = useState<'department' | 'position'>('department');
  const [currentItem, setCurrentItem] = useState<DataItem | null>(null);
  const [itemName, setItemName] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const [deptRes, posRes] = await Promise.all([
        axios.get(`${API_URL}/departments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/positions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDepartments(deptRes.data);
      setPositions(posRes.data);
    } catch (error) {
      console.error("Failed to fetch settings data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (mode: 'add' | 'edit', type: 'department' | 'position', item: DataItem | null = null) => {
    setModalMode(mode);
    setModalType(type);
    setCurrentItem(item);
    setItemName(item ? (type === 'position' ? t(`positions.${item.name}`) : item.name) : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setItemName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const url = `<span class="math-inline">\{API\_URL\}/</span>{modalType}s`;

    try {
      if (modalMode === 'add') {
        await axios.post(url, { name: itemName }, { headers: { Authorization: `Bearer ${token}` } });
      } else if (currentItem) {
        await axios.patch(`<span class="math-inline">\{url\}/</span>{currentItem.id}`, { name: itemName }, { headers: { Authorization: `Bearer ${token}` } });
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
        await axios.delete(`<span class="math-inline">\{API\_URL\}/</span>{type}s/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch (error) {
        alert(`Failed to delete ${type}. Make sure no users are assigned to it.`);
      }
    }
  };

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
                <span>{dept.name}</span>
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
        title={t(`settings_page.<span class="math-inline">\{modalMode\}\_</span>{modalType}_title`)}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="itemName">{t('settings_page.name_label')}</label>
            <input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={closeModal} className="button button-secondary">{t('leave_management_page.cancel_button')}</button>
            <button type="submit" className="button button-primary">{t('employees_page.edit_modal.save_button')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}