// src/pages/LeavePage/index.tsx

import React, { useState } from 'react';
import { VscSend } from 'react-icons/vsc';

import './LeavePage.css';
import '../../components/Stepper/Stepper.css';

const mockLeaveHistory = [
  { id: 1, fromDate: '2025-05-20', toDate: '2025-05-22', duration: 3, status: 'Accepted' },
  { id: 2, fromDate: '2025-04-10', toDate: '2025-04-10', duration: 1, status: 'Accepted' },
  { id: 3, fromDate: '2025-02-01', toDate: '2025-02-05', duration: 5, status: 'Declined' },
];

const getStatusClass = (status: string) => {
    switch (status) {
        case 'Accepted': return 'status-accepted';
        case 'Pending': return 'status-pending';
        case 'Declined': return 'status-declined';
        default: return '';
    }
}

export function LeavePage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log({ fromDate, toDate, reason });
    alert('Request submitted! Check the browser console for the data.');
  };

  return (
    <div className="outer-container" style={{ alignItems: 'flex-start', paddingTop: '8rem', gap: '2rem' }}>
      
      {/* Card 1: The Request Form */}
      <div className="step-circle-container">
        <form onSubmit={handleSubmit} className="step-default">
          <h2>New Leave Request</h2>
          <p>Select the dates and provide a reason for your leave.</p>

          <div className="form-container" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="from-date" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>From </label>
                <input id="from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="form-input" required />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="to-date" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>To </label>
                <input id="to-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="form-input" required />
              </div>
            </div>

            {/* --- FIX 1: ADDED MARGIN TOP FOR SPACING --- */}
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="reason" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Reason</label>
              <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="form-input-reason" placeholder="" rows={1} required />
            </div>
          </div>
          
          {/* --- FIX 2: ALIGN BUTTON TO THE RIGHT --- */}
          <div className="step-footer" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loading} className="button button-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <VscSend />
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: The History List */}
      <div className="step-circle-container" style={{ marginTop: '3rem' }}>
        <div className="step-default">
          <h2>Request History</h2>
          
          <div className="history-list">
            {mockLeaveHistory.map(request => (
              <div key={request.id} className="history-item">
                <div className="history-item-dates">
                  <span>Duration: <strong>{request.duration} day(s)</strong></span>
                  <span>From: {request.fromDate} To: {request.toDate}</span>
                </div>
                <div className={`status-badge ${getStatusClass(request.status)}`}>
                  {request.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}