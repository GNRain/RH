import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api'; // --- Use the new API client ---
import { useTranslation } from 'react-i18next';
import { VscAdd, VscEdit, VscTrash } from 'react-icons/vsc';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

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
  defaultName: string;
  name: string; // This will be the translated name from the backend
  translations?: { languageCode: string; translatedName: string }[];
};

const CompanySettings = () => {
  const { t, i18n } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalType, setModalType] = useState<'department' | 'position'>('department');
  const [currentItem, setCurrentItem] = useState<Department | Position | null>(null);
  
  // Form state
  const [deptName, setDeptName] = useState('');
  const [deptColor, setDeptColor] = useState('#CCCCCC');
  const [defaultShiftId, setDefaultShiftId] = useState<string | undefined>(undefined);
  const [posNameEn, setPosNameEn] = useState('');
  const [posNameFr, setPosNameFr] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // --- Use apiClient for all requests ---
      const [deptRes, posRes, shiftRes] = await Promise.all([
        apiClient.get('/departments'),
        apiClient.get('/positions', { params: { lang: i18n.language.split('-')[0] } }),
        apiClient.get('/shift')
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
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [deptRes, posRes, shiftRes] = await Promise.all([
          apiClient.get('/departments'),
          apiClient.get('/positions', { params: { lang: i18n.language.split('-')[0] } }),
          apiClient.get('/shift')
        ]);
        setDepartments(deptRes.data);
        setPositions(posRes.data);
        setShifts(shiftRes.data);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [i18n.language]);

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
        setPosNameEn(pos ? pos.defaultName : '');
        setPosNameFr(pos ? (pos.translations?.find(t => t.languageCode === 'fr')?.translatedName || '') : '');
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setDeptName('');
    setDeptColor('#CCCCCC');
    setDefaultShiftId(undefined);
    setPosNameEn('');
    setPosNameFr('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = `/${modalType}s`;
    let payload;

    if (modalType === 'department') {
        payload = { name: deptName, color: deptColor, defaultShiftId: (defaultShiftId === undefined || defaultShiftId === '') ? null : defaultShiftId };
    } else {
        payload = {
            defaultName: posNameEn,
            translations: [
                { languageCode: 'fr', translatedName: posNameFr }
            ]
        };
    }

    try {
      if (modalMode === 'add') {
        await apiClient.post(url, payload);
      } else if (currentItem) {
        await apiClient.patch(`${url}/${currentItem.id}`, payload);
      }
      fetchData();
      closeModal();
      toast({
        title: "Success",
        description: `${modalType} ${modalMode === 'add' ? 'added' : 'updated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${modalMode} ${modalType}.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (type: 'department' | 'position', id: string) => {
    if (window.confirm(t('settings_page.delete_confirm'))) {
      try {
        await apiClient.delete(`/${type}s/${id}`);
        fetchData();
        toast({
          title: "Success",
          description: `${type} deleted successfully`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || `Failed to delete ${type}. Make sure no users are assigned to it.`,
          variant: "destructive",
        });
      }
    }
  };
  
  if (loading) return <p className="text-white">{t('settings_page.loading')}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('settings_page.title')}</h2>
        <p className="text-gray-600">{t('settings_page.subtitle')}</p>
      </div>

      {/* Departments Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('settings_page.departments_title')}</CardTitle>
            <Button onClick={() => openModal('add', 'department')}>
              <VscAdd className="mr-2" /> {t('settings_page.add_department_button')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map(dept => (
              <Card key={dept.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openModal('edit', 'department', dept)}>
                        <VscEdit />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete('department', dept.id)}>
                        <VscTrash />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>{t('settings_page.color_label')}:</span>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: dept.color }}></div>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('settings_page.default_shift_label')}:</span>
                      <span className="font-medium">{shifts.find(s => s.id === dept.defaultShiftId)?.name || t('settings_page.none')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Positions Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('settings_page.positions_title')}</CardTitle>
            <Button onClick={() => openModal('add', 'position')}>
              <VscAdd className="mr-2" /> {t('settings_page.add_position_button')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('settings_page.name_label')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">{t('settings_page.actions_label')}</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => (
                  <tr key={pos.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{pos.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openModal('edit', 'position', pos)}>
                          <VscEdit />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete('position', pos.id)}>
                          <VscTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`settings_page.${modalMode}_${modalType}_title`)}</DialogTitle>
          </DialogHeader>
          {modalType === 'department' ? (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 py-4">
              <div>
                <Label htmlFor="deptName">{t('settings_page.name_label')}</Label>
                <Input id="deptName" type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="deptColor">{t('settings_page.color_label')}</Label>
                <Input id="deptColor" type="color" value={deptColor} onChange={(e) => setDeptColor(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="defaultShift">{t('settings_page.default_shift_label')}</Label>
                <Select value={defaultShiftId || 'none'} onValueChange={(value) => setDefaultShiftId(value === 'none' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings_page.none')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('settings_page.none')}</SelectItem>
                    {shifts.map(shift => <SelectItem key={shift.id} value={shift.id}>{shift.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={closeModal}>{t('leave_management_page.cancel_button')}</Button>
                <Button type="submit">{t('employees_page.edit_modal.save_button')}</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 py-4">
              <div>
                <Label htmlFor="posNameEn">{t('settings_page.name_en_label')}</Label>
                <Input id="posNameEn" type="text" value={posNameEn} onChange={(e) => setPosNameEn(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="posNameFr">{t('settings_page.name_fr_label')}</Label>
                <Input id="posNameFr" type="text" value={posNameFr} onChange={(e) => setPosNameFr(e.target.value)} required />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={closeModal}>{t('leave_management_page.cancel_button')}</Button>
                <Button type="submit">{t('employees_page.edit_modal.save_button')}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySettings;