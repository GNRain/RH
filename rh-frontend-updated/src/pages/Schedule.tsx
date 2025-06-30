import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { VscChevronLeft, VscChevronRight, VscAccount } from 'react-icons/vsc';
import { Modal } from '@/components/Modal/Modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const API_URL = 'http://localhost:3000';

interface DecodedToken {
  role: 'HR' | 'DHR';
}
interface User {
  id: string; name: string; familyName: string; status: 'ACTIVE' | 'INACTIVE';
  role: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';
  leaveRequests: { fromDate: string; toDate: string }[];
}
interface Department {
    id: string; name: string; color: string;
}
interface ScheduleEvent {
  id: string; title: string; start: string; end: string; allDay: boolean;
  backgroundColor: string; borderColor: string;
  extendedProps: {
    shiftId: string; shiftName: string; departmentId: string;
    departmentName: string; departmentColor: string;
  };
}

const Schedule = () => {
  const { t, i18n } = useTranslation();

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [weekRange, setWeekRange] = useState('');
  const [isHrRole, setIsHrRole] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedDepartmentUsers, setSelectedDepartmentUsers] = useState<User[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [schedule, setSchedule] = useState<{ [key: string]: any }>({});

  const timeSlots = [
    "00:00-08:00", "08:00-16:00", "16:00-24:00"
  ];

  const weekdays = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')];

  const fetchSchedule = useCallback(async (start: Date, end: Date) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: start.toISOString(), endDate: end.toISOString() },
      });

      const newSchedule: { [key: string]: any } = {};
      response.data.forEach((item: any) => {
        const dayIndex = new Date(item.date).getDay();
        const timeIndex = timeSlots.findIndex(slot => slot.startsWith(item.shift.startTime));
        if (dayIndex !== -1 && timeIndex !== -1) {
          const key = `${dayIndex}-${timeIndex}`;
          newSchedule[key] = {
            id: item.id,
            departmentName: item.department.name,
            departmentColor: item.shift.color,
            shiftId: item.shift.id,
            departmentId: item.department.id,
          };
        }
      });
      setSchedule(newSchedule);

    } catch (error) {
      console.error("Failed to fetch schedule", error);
    }
  }, [timeSlots]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setIsHrRole(decoded.role === 'HR' || decoded.role === 'DHR');
    }

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const { data } = await axios.get(`${API_URL}/departments`, { headers: { Authorization: `Bearer ${token}` }});
            setDepartments(data.filter((d: Department) => d.name !== 'HR'));
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    }
    fetchDepartments();
    
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    updateWeekRange(startOfWeek, endOfWeek);

  }, []);
  
  const updateWeekRange = useCallback((start: Date, end: Date) => {
    const formattedStart = start.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: '2-digit' });
    const formattedEnd = end.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: '2-digit' });
    setWeekRange(`${formattedStart} - ${formattedEnd}`);
    fetchSchedule(start, end);
  }, [i18n.language, fetchSchedule]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) return;

    const sourceKey = source.droppableId;
    const destKey = destination.droppableId;

    const sourceCell = schedule[sourceKey];
    const destCell = schedule[destKey];

    const updates = [
        { date: new Date(sourceCell.start).toISOString().split('T')[0], departmentId: sourceCell.departmentId, newShiftId: destCell.shiftId },
        { date: new Date(destCell.start).toISOString().split('T')[0], departmentId: destCell.departmentId, newShiftId: sourceCell.shiftId },
    ];

    try {
        const token = localStorage.getItem('access_token');
        await axios.patch(`${API_URL}/schedules`, { updates }, { headers: { Authorization: `Bearer ${token}` } });
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        fetchSchedule(startOfWeek, endOfWeek);
    } catch (error) {
        console.error("Failed to swap shifts", error);
    }
  };

  const getDepartmentStyle = (departmentName: string) => {
    const dept = departments.find(d => d.name === departmentName);
    return dept ? { textColor: 'white', bgColor: dept.color } : { textColor: "text-gray-700 dark:text-gray-300", bgColor: "bg-gray-100 dark:bg-gray-800" };
  };

  const renderModalContent = () => {
    if (isModalLoading) return <p>{t('schedule_page.modal.loading')}</p>;
    
    const manager = selectedDepartmentUsers.find(u => u.role === 'MANAGER' || u.role === 'DHR');
    const teamLeader = selectedDepartmentUsers.find(u => u.role === 'TEAM_LEADER');
    const employees = selectedDepartmentUsers.filter(u => u.role === 'EMPLOYEE');

    const isOnLeave = (user: User) => {
        const today = new Date();
        return user.leaveRequests.some(leave => {
            const from = new Date(leave.fromDate);
            const to = new Date(leave.toDate);
            return from <= today && today <= to;
        });
    };

    return (
        <div className="department-modal-content">
            {manager && <div className="detail-row"><strong>{t('employees_page.roles.manager')}:</strong><span>{manager.name} {manager.familyName}</span></div>}
            {teamLeader && <div className="detail-row"><strong>{t('employees_page.roles.team_leader')}:</strong><span>{teamLeader.name} {teamLeader.familyName}</span></div>}
            <h4 className="employee-list-title">{t('employees_page.title')}</h4>
            <ul className="employee-list">
                {employees.map(user => (
                    <li key={user.id}>
                        <VscAccount /> {user.name} {user.familyName}
                        <div className='badges'>
                           <span className={`status-pill ${user.status.toLowerCase()}`}>{t(`employees_page.statuses.${user.status.toLowerCase()}`)}</span>
                           {isOnLeave(user) && <span className="status-pill on-leave">{t('schedule_page.modal.on_leave')}</span>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('schedule_page.title')}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t('schedule_page.subtitle')}</p>
      </div>

      {/* Department Legend */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">{t('departments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {departments.map((dept) => (
              <div key={dept.name} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded`} style={{backgroundColor: dept.color}}></div>
                <span className="text-sm font-medium dark:text-gray-300">{dept.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">{t('schedule_page.weekly_schedule_grid')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-200 dark:border-gray-600 py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">
                      {t('timeSlot')}
                    </th>
                    {weekdays.map((day) => (
                      <th key={day} className="border border-gray-200 dark:border-gray-600 py-3 px-4 text-center font-semibold text-gray-900 dark:text-white">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, timeIndex) => (
                    <tr key={timeSlot} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="border border-gray-200 dark:border-gray-600 py-4 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                        {timeSlot}
                      </td>
                      {weekdays.map((day, dayIndex) => {
                        const cellKey = `${dayIndex}-${timeIndex}`;
                        const cellData = schedule[cellKey];
                        if (!cellData) return <td key={`${day}-${timeSlot}`} className="border border-gray-200 dark:border-gray-600 py-4 px-4 text-center"></td>;
                        const style = getDepartmentStyle(cellData.departmentName);
                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-gray-200 dark:border-gray-600 py-4 px-4 text-center">
                            <Droppable droppableId={cellKey}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`min-h-[40px] flex items-center justify-center ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/30 rounded-lg' : ''}`}>
                                  <Draggable draggableId={`${cellKey}-${cellData.departmentName}`} index={0}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`${snapshot.isDragging ? 'transform rotate-6 scale-105' : ''}`}>
                                        <Badge variant="secondary" style={{backgroundColor: style.bgColor, color: style.textColor}} className={`font-medium px-3 py-1 cursor-grab active:cursor-grabbing transition-transform hover:scale-105`}>
                                          {cellData.departmentName}
                                        </Badge>
                                      </div>
                                    )}
                                  </Draggable>
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.name} className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <div className={`w-4 h-4 rounded`} style={{backgroundColor: dept.color}}></div>
                <span>{dept.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('schedule_page.weekly_hours')}:</span>
                  <span className="font-medium dark:text-gray-300">56 {t('schedule_page.hours')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('employees')}:</span>
                  <span className="font-medium dark:text-gray-300">
                    {/* This part needs to be dynamic based on actual employee data */}
                    {dept.name === t('itDepartment') ? "45" : dept.name === t('hrDepartment') ? "32" : "65"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('schedule_page.shift_pattern')}:</span>
                  <span className="font-medium dark:text-gray-300">{t('schedule_page.eight_hour_shifts')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;