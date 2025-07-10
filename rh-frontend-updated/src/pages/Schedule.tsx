// rh-frontend-updated/src/pages/Schedule.tsx

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api'; // --- Use the new API client ---
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { VscAccount, VscChevronLeft, VscChevronRight } from 'react-icons/vsc';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

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

interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
}

const Schedule = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<{ [key: string]: any }>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
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
    const controller = new AbortController(); // Create AbortController
    const signal = controller.signal; // Get signal

    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setIsHrRole(decoded.role === 'HR' || decoded.role === 'DHR');
    }

    const fetchInitialData = async () => {
        try {
            const [deptRes, userRes, shiftRes] = await Promise.all([
                apiClient.get('/departments', { signal }),
                apiClient.get('/users', { signal }),
                apiClient.get('/shift', { signal }),
            ]);

            const filteredDepts = deptRes.data.filter((d: Department) => d.name !== 'HR');
            setDepartments(filteredDepts);
            setShifts(shiftRes.data);

            const counts: { [key: string]: number } = {};
            for (const dept of filteredDepts) {
                const deptUsers = userRes.data.filter((user: any) => user.department.name === dept.name);
                counts[dept.id] = deptUsers.length;
            }
            setEmployeeCounts(counts);

        } catch (error: any) {
            if (error.name === 'CanceledError') {
                console.log('Fetch initial data aborted');
            } else {
                console.error("Failed to fetch initial data", error);
            }
        }
    }
    fetchInitialData();

    return () => { // Cleanup function
      controller.abort(); // Abort requests on unmount
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController(); // Create AbortController
    const signal = controller.signal; // Get signal

    const { startOfWeek, endOfWeek } = getWeekStartAndEnd(currentDate);

    const fetchSchedule = async () => {
        try {
          const response = await apiClient.get('/schedules', {
            params: { startDate: startOfWeek.toISOString(), endDate: endOfWeek.toISOString() },
            signal, // Pass signal
          });

          const newSchedule: { [key: string]: any[] } = {}; // Change to array of any
          response.data.forEach((item: any) => {
            const itemDate = new Date(item.date);
            const dayIndex = itemDate.getUTCDay();
            const timeIndex = timeSlots.findIndex(slot => slot.startsWith(item.shift.startTime));

            if (dayIndex >= 1 && dayIndex <= 5 && timeIndex !== -1) {
              const key = `${dayIndex - 1}-${timeIndex}`;
              if (!newSchedule[key]) {
                newSchedule[key] = []; // Initialize as array if not exists
              }
              newSchedule[key].push({ // Push item to array
                id: item.id,
                date: item.date,
                departmentName: item.department.name,
                departmentColor: item.shift.color,
                shiftId: item.shift.id,
                departmentId: item.department.id,
              });
            }
          });
          setSchedule(newSchedule);

        } catch (error: any) { // Catch error as any to access error.name
            if (error.name === 'CanceledError') {
                console.log('Fetch schedule aborted');
            } else {
                console.error("Failed to fetch schedule", error);
            }
        }
    }

    fetchSchedule();

    return () => { // Cleanup function
      controller.abort(); // Abort requests on unmount
    };
  }, [currentDate, timeSlots, getWeekStartAndEnd]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result; // Add draggableId here
    if (!destination || source.droppableId === destination.droppableId) return;

    if (!isHrRole) {
      toast({
        variant: "destructive",
        title: t('schedule_page.toast.permission_denied.title'),
        description: t('schedule_page.toast.permission_denied.description'),
      });
      return;
    }

    // No longer need sourceDayIndex and destDayIndex here as they are not used for the cross-day check
    // The cross-day check was removed in the previous step.

    const sourceKey = source.droppableId;
    const destKey = destination.droppableId;

    // Extract dragged department's data
    // The draggableId is now `${cellKey}-${deptData.id}`
    const [originalCellKey, draggedDepartmentId] = draggableId.split('|');

    const sourceDepartments = schedule[originalCellKey];
    if (!Array.isArray(sourceDepartments)) { // Defensive check
      console.error("sourceDepartments is not an array:", sourceDepartments);
      return;
    }
    const draggedDepartment = sourceDepartments.find((dept: any) => dept.id === draggedDepartmentId);

    if (!draggedDepartment) { // This can happen if the item is not found in the source array
      console.error("Dragged department not found in source cell:", draggedDepartmentId, originalCellKey);
      return;
    }

    // Determine the new shift ID based on the destination cell's time slot
    const [destDayIndex, destTimeIndex] = destKey.split('-').map(Number); // destDayIndex is still used for destTimeIndex
    const destinationShiftName = timeSlots[destTimeIndex];
    const destinationShift = (Array.isArray(shifts) ? shifts : []).find(s => s.startTime === destinationShiftName.split('-')[0]);

    if (!destinationShift) {
      toast({
        variant: "destructive",
        title: t('schedule_page.toast.error.title'),
        description: "Could not find destination shift details.",
      });
      return;
    }

    const newShiftId = destinationShift.id;

    // Construct the update payload for the dragged department
    const updates = [
        { date: draggedDepartment.date, departmentId: draggedDepartment.departmentId, newShiftId: newShiftId },
    ];

    // Optimistic update for frontend display
    const newSchedule = { ...schedule };

    // Remove from source cell
    newSchedule[originalCellKey] = newSchedule[originalCellKey].filter((dept: any) => dept.id !== draggedDepartmentId);

    // Add to destination cell
    if (!newSchedule[destKey]) {
      newSchedule[destKey] = [];
    }
    newSchedule[destKey].push({
      ...draggedDepartment,
      shiftId: newShiftId, // Update shiftId for the moved department
    });

    setSchedule(newSchedule); // Update frontend immediately

    try {
        await apiClient.patch('/schedules', { updates });
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
                        const cellDepartments = schedule[cellKey]; // This is now an array
                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-gray-200 dark:border-gray-600 py-4 px-4 text-center">
                            <Droppable droppableId={cellKey}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`min-h-[40px] flex flex-col items-center justify-center gap-1 ${snapshot.isDraggingOver && isHrRole ? 'bg-blue-50 dark:bg-blue-900/30 rounded-lg' : ''}`}>
                                  {cellDepartments && cellDepartments.map((deptData: any, index: number) => {
                                    const style = getDepartmentStyle(deptData.departmentName);
                                    return (
                                      <Draggable
                                        key={deptData.id} // Use department ID as key
                                        draggableId={`${cellKey}|${deptData.id}`} // Use department ID in draggableId
                                        index={index}
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
                                              {deptData.departmentName}
                                            </Badge>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
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