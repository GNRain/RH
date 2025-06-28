import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { jwtDecode } from 'jwt-decode';
import { VscChevronLeft, VscChevronRight, VscAccount } from 'react-icons/vsc';
import { Modal } from '../../components/Modal/Modal';
import './SchedulePage.css';

const API_URL = 'http://localhost:3000';

// --- Type Definitions (no changes here) ---
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

// --- Legend Component (no changes here) ---
const DepartmentLegend = ({ departments }: { departments: Department[] }) => (
    <div className="department-legend">
        {departments.map(dept => (
            <div key={dept.id} className="legend-item">
                <div className="legend-color-box" style={{ backgroundColor: dept.color }}></div>
                <span>{dept.name}</span>
            </div>
        ))}
    </div>
);


// --- Main Component ---
export function SchedulePage() {
  const { t, i18n } = useTranslation();
  const calendarRef = useRef<FullCalendar>(null);

  // State (no changes here)
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [weekRange, setWeekRange] = useState('');
  const [isHrRole, setIsHrRole] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedDepartmentUsers, setSelectedDepartmentUsers] = useState<User[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // --- Data Fetching ---
  const fetchSchedule = useCallback(async (start: Date, end: Date) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: start.toISOString(), endDate: end.toISOString() },
      });

      const formattedEvents = response.data.map((item: any) => {
        const startDate = new Date(`${item.date}T${item.shift.startTime}:00`);
        let endDate = new Date(`${item.date}T${item.shift.endTime}:00`);

        if (item.shift.endTime <= item.shift.startTime) {
          endDate.setDate(endDate.getDate() + 1);
        }

        return {
          id: item.id,
          title: item.department.name,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: false,
          // --- FIX: Use the color from item.shift instead of item.department ---
          backgroundColor: item.shift.color,
          borderColor: item.shift.color,
          extendedProps: {
            shiftId: item.shift.id,
            shiftName: item.shift.name,
            departmentId: item.department.id,
            departmentName: item.department.name,
            // --- FIX: Use the color from item.shift here as well ---
            departmentColor: item.shift.color,
          },
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Failed to fetch schedule", error);
    }
  }, []);

  // No changes to the rest of the file...
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
  }, []);
  
  const updateWeekRange = useCallback((start: Date, end: Date) => {
    const formattedStart = start.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: '2-digit' });
    const formattedEnd = end.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: '2-digit' });
    setWeekRange(`${formattedStart} - ${formattedEnd}`);
    fetchSchedule(start, end);
  }, [i18n.language, fetchSchedule]);

  const handleDatesSet = (arg: any) => {
    const view = arg.view;
    const end = new Date(view.activeEnd);
    end.setDate(end.getDate() - 1);
    updateWeekRange(view.activeStart, end);
  };
  
  const handleEventClick = async (info: any) => {
    const { departmentName } = info.event.extendedProps;
    setModalTitle(t('schedule_page.modal.title', { departmentName }));
    setIsModalOpen(true);
    setIsModalLoading(true);
    
    try {
        const token = localStorage.getItem('access_token');
        const { data } = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { department: departmentName },
        });
        setSelectedDepartmentUsers(data);
    } catch (error) {
        console.error("Failed to fetch department details", error);
    } finally {
        setIsModalLoading(false);
    }
  };

  const handleEventDrop = async (info: any) => {
    const { event, revert } = info;
    const draggedEvent = events.find(e => e.id === event.id);
    if (!draggedEvent) return revert();

    const targetEvent = events.find(e =>
      e.id !== draggedEvent.id &&
      new Date(e.start).getTime() === new Date(event.start).getTime()
    );
    
    if (!targetEvent) {
      return revert();
    }
    
    const updates = [
        { date: new Date(draggedEvent.start).toISOString().split('T')[0], departmentId: draggedEvent.extendedProps.departmentId, newShiftId: targetEvent.extendedProps.shiftId },
        { date: new Date(targetEvent.start).toISOString().split('T')[0], departmentId: targetEvent.extendedProps.departmentId, newShiftId: draggedEvent.extendedProps.shiftId },
    ];

    try {
        const token = localStorage.getItem('access_token');
        await axios.patch(`${API_URL}/schedules`, { updates }, { headers: { Authorization: `Bearer ${token}` } });
        if (calendarRef.current) {
            const view = calendarRef.current.getApi().view;
            const end = new Date(view.activeEnd);
            end.setDate(end.getDate() - 1);
            fetchSchedule(view.activeStart, end);
        }
    } catch (error) {
        console.error("Failed to swap shifts", error);
        revert();
    }
  };
  
  const goToPreviousWeek = () => calendarRef.current?.getApi().prev();
  const goToNextWeek = () => calendarRef.current?.getApi().next();

  const renderEventContent = (eventInfo: any) => (
      <div className="custom-event" style={{ borderColor: eventInfo.event.extendedProps.departmentColor }}>
        <strong className="event-title">{eventInfo.event.title}</strong>
        <span className="event-time">{eventInfo.timeText}</span>
      </div>
  );

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
    <div className="schedule-page-container">
      <div className="schedule-page-header">
        <button onClick={goToPreviousWeek} className="nav-arrow" aria-label="Previous week"><VscChevronLeft /></button>
        <span className="week-range-legend">{weekRange}</span>
        <button onClick={goToNextWeek} className="nav-arrow" aria-label="Next week"><VscChevronRight /></button>
      </div>

      <DepartmentLegend departments={departments} />

      <div className="calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          weekends={false}
          allDaySlot={false}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          slotDuration="01:00:00"
          snapDuration="01:00:00"
          events={events}
          editable={isHrRole}
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          slotLabelInterval={{hours: 1}}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
        {renderModalContent()}
      </Modal>
    </div>
  );
}