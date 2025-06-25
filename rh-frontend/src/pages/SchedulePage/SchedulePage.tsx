import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { jwtDecode } from 'jwt-decode';
import './SchedulePage.css';

const API_URL = 'http://localhost:3000';

interface DecodedToken { role: 'HR' | 'DHR'; }

export function SchedulePage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [isHrRole, setIsHrRole] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);

  const fetchSchedule = useCallback(async (start: Date, end: Date) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate: start.toISOString(), endDate: end.toISOString() }
      });

      const formattedEvents = response.data.map((item: any) => ({
        id: item.id,
        title: item.department.name,
        start: item.date,
        allDay: true,
        extendedProps: {
            shift: item.shift,
            departmentId: item.department.id,
        }
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Failed to fetch schedule", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setIsHrRole(decoded.role === 'HR' || decoded.role === 'DHR');
    }
  }, []);

  const handleEventDrop = (info: any) => {
    const { event } = info;
    const change = {
        scheduleId: event.id,
        newDate: event.start.toISOString().split('T')[0], // The new date
        originalDepartmentId: event.extendedProps.departmentId
    };
    // For a simple swap, we need more complex logic, but for now we'll just track the move
    // In a real scenario, you'd find the event that was swapped with and update both
    console.log("Change detected (for now, we're not handling swaps, just moves):", change);
    alert("Drag & Drop is visually enabled for HR, but the logic to swap shift between two teams on the same day is a more complex feature we can build next!");
  };

  return (
    <div className="schedule-page-container">
      <div className="schedule-page-header">
        <div>
          <h1>{t('schedule_page.title')}</h1>
          <p>{t('schedule_page.subtitle')}</p>
        </div>
        {pendingChanges.length > 0 && (
            <div className="actions">
                <button className="button button-secondary">{t('schedule_page.cancel')}</button>
                <button className="button button-primary">{t('schedule_page.apply_changes')}</button>
            </div>
        )}
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          weekends={true}
          events={events}
          editable={isHrRole} // Make calendar editable only for HR
          eventDrop={handleEventDrop}
          datesSet={(arg) => fetchSchedule(arg.start, arg.end)} // Refetch when view changes
        />
      </div>
    </div>
  );
}