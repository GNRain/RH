// rh-frontend-updated/src/pages/Schedule.tsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { VscAccount, VscChevronLeft, VscChevronRight } from 'react-icons/vsc';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import API_URL from '../config';

// Interfaces (no changes here)
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

const Schedule = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<{ [key: string]: any }>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employeeCounts, setEmployeeCounts] = useState<{ [key: string]: number }>({});
  const [isHrRole, setIsHrRole] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedDepartmentUsers, setSelectedDepartmentUsers] = useState<User[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const timeSlots = ["00:00-08:00", "08:00-16:00", "16:00-24:00"];
  
  const weekdays = [
    t('schedule_page.days.monday'),
    t('schedule_page.days.tuesday'),
    t('schedule_page.days.wednesday'),
    t('schedule_page.days.thursday'),
    t('schedule_page.days.friday'),
  ];

  const getWeekStartAndEnd = useCallback((date: Date) => {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = start.getUTCDay();
    const diff = start.getUTCDate() - day + (day === 0 ? -6 : 1);
    start.setUTCDate(diff);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 4);

    return { startOfWeek: start, endOfWeek: end };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setIsHrRole(decoded.role === 'HR' || decoded.role === 'DHR');
    }

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const { data } = await axios.get(`${API_URL}/departments`, { headers: { Authorization: `Bearer ${token}` }});
            const filteredDepts = data.filter((d: Department) => d.name !== 'HR');
            setDepartments(filteredDepts);

            const counts: { [key: string]: number } = {};
            for (const dept of filteredDepts) {
                const res = await axios.get(`${API_URL}/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { department: dept.name }
                });
                counts[dept.id] = res.data.length;
            }
            setEmployeeCounts(counts);

        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    const { startOfWeek, endOfWeek } = getWeekStartAndEnd(currentDate);

    const source = axios.CancelToken.source();

    const fetchSchedule = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const response = await axios.get(`${API_URL}/schedules`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { startDate: startOfWeek.toISOString(), endDate: endOfWeek.toISOString() },
            cancelToken: source.token
          });
    
          const newSchedule: { [key: string]: any } = {};
          response.data.forEach((item: any) => {
            const itemDate = new Date(item.date);
            const dayIndex = itemDate.getUTCDay();
            const timeIndex = timeSlots.findIndex(slot => slot.startsWith(item.shift.startTime));
            
            if (dayIndex >= 1 && dayIndex <= 5 && timeIndex !== -1) {
              const key = `${dayIndex - 1}-${timeIndex}`;
              newSchedule[key] = {
                id: item.id,
                date: item.date,
                departmentName: item.department.name,
                departmentColor: item.shift.color,
                shiftId: item.shift.id,
                departmentId: item.department.id,
              };
            }
          });
          setSchedule(newSchedule);
    
        } catch (error) {
          if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
          } else {
            console.error("Failed to fetch schedule", error);
          }
        }
    }

    fetchSchedule();

    return () => {
        source.cancel('Component unmounted');
    }
  }, [currentDate, timeSlots, getWeekStartAndEnd]);
  
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    if (!isHrRole) {
      toast({
        variant: "destructive",
        title: t('schedule_page.toast.permission_denied.title'),
        description: t('schedule_page.toast.permission_denied.description'),
      });
      return;
    }

    const [sourceDayIndex] = source.droppableId.split('-').map(Number);
    const [destDayIndex] = destination.droppableId.split('-').map(Number);

    if (sourceDayIndex !== destDayIndex) {
        toast({
            variant: "alert",
            title: t('schedule_page.toast.invalid_move.title'),
            description: t('schedule_page.toast.invalid_move.description'),
        });
        return;
    }

    const sourceKey = source.droppableId;
    const destKey = destination.droppableId;
    const sourceCell = schedule[sourceKey];
    const destCell = schedule[destKey];

    const newSchedule = { ...schedule, [sourceKey]: destCell, [destKey]: sourceCell };
    setSchedule(newSchedule);

    const updates = [
        { date: sourceCell.date, departmentId: sourceCell.departmentId, newShiftId: destCell.shiftId },
        { date: destCell.date, departmentId: destCell.departmentId, newShiftId: sourceCell.shiftId },
    ];

    try {
        const token = localStorage.getItem('access_token');
        await axios.patch(`${API_URL}/schedules`, { updates }, { headers: { Authorization: `Bearer ${token}` } });
        toast({
            variant: "success",
            title: t('schedule_page.toast.success.title'),
            description: t('schedule_page.toast.success.description'),
        });
    } catch (error) {
        setSchedule(schedule); // Revert on error
        console.error("Failed to swap shifts", error);
        toast({
            variant: "destructive",
            title: t('schedule_page.toast.error.title'),
            description: t('schedule_page.toast.error.description'),
        });
    }
  };

  const goToPreviousWeek = () => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setUTCDate(prev.getUTCDate() - 7);
        return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setUTCDate(prev.getUTCDate() + 7);
        return newDate;
    });
  };

  const getWeekRange = () => {
    const { startOfWeek, endOfWeek } = getWeekStartAndEnd(currentDate);

    const formattedStart = startOfWeek.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'UTC' });
    const formattedEnd = endOfWeek.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'UTC' });

    return `${formattedStart} - ${formattedEnd}`;
  }

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

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">{t('schedule_page.departments')}</CardTitle>
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
      
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dark:text-white">{t('schedule_page.weekly_schedule_grid')}</CardTitle>
            <div className="flex items-center gap-2">
                <button onClick={goToPreviousWeek} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <VscChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-semibold">{getWeekRange()}</span>
                <button onClick={goToNextWeek} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <VscChevronRight className="h-5 w-5" />
                </button>
            </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-200 dark:border-gray-600 py-3 px-4 text-left font-semibold text-gray-900 dark:text-white">
                      {t('schedule_page.timeSlot')}
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
                                  className={`min-h-[40px] flex items-center justify-center ${snapshot.isDraggingOver && isHrRole ? 'bg-blue-50 dark:bg-blue-900/30 rounded-lg' : ''}`}>
                                  <Draggable 
                                    draggableId={`${cellKey}-${cellData.departmentName}`} 
                                    index={0}
                                    isDragDisabled={!isHrRole}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`${snapshot.isDragging ? 'transform rotate-6 scale-105' : ''}`}>
                                        <Badge 
                                          variant="secondary" 
                                          style={{backgroundColor: style.bgColor, color: style.textColor}} 
                                          className={`font-medium px-3 py-1 ${isHrRole ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} transition-transform hover:scale-105`}
                                        >
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
                  <span className="font-medium dark:text-gray-300">40 {t('schedule_page.hours')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('schedule_page.employees')}:</span>
                  <span className="font-medium dark:text-gray-300">
                    {employeeCounts[dept.id] || 0}
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