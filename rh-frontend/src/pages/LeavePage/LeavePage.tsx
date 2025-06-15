import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { VscSend } from 'react-icons/vsc';

import './LeavePage.css';
import '../../components/Stepper/Stepper.css';

const API_URL = 'http://localhost:3000';

// Define an interface for our leave request data
interface LeaveRequest {
  id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  // Optional: Add a duration field if the backend calculates it
  duration?: number;
}

// Helper function to calculate duration (since backend doesn't provide it)
const calculateDuration = (fromDate: string, toDate: string): number => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const differenceInTime = end.getTime() - start.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return Math.max(1, differenceInDays + 1); // Ensure at least 1 day
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'ACCEPTED': return 'status-accepted';
        case 'PENDING': return 'status-pending';
        case 'DECLINED': return 'status-declined';
        default: return '';
    }
}

export function LeavePage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // --- STATE FOR LIVE DATA ---
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // --- FUNCTION TO FETCH LEAVE HISTORY ---
  const fetchLeaveHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/leave/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveHistory(response.data);
    } catch (err: any) {
      setError('Failed to fetch leave history.');
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // --- FETCH DATA ON COMPONENT MOUNT ---
  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
        const token = localStorage.getItem('access_token');
        await axios.post(
            `${API_URL}/leave`, 
            { fromDate, toDate, reason },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Reset form and refresh history on success
        setFromDate('');
        setToDate('');
        setReason('');
        await fetchLeaveHistory(); 
    } catch(err: any) {
        setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
        setLoading(false);
    }
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

            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="reason" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Reason</label>
              <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="form-input-reason" placeholder="Please provide a reason for your leave..." rows={2} required />
            </div>
          </div>
          
          {error && <p style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '1rem' }}>{error}</p>}

          <div className="step-footer" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loading} className="button button-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <VscSend />
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: The History List */}
      <div className="step-circle-container" style={{ marginTop: '0' }}>
        <div className="step-default">
          <h2>Request History</h2>
          
          <div className="history-list">
            {isHistoryLoading ? (
                <p>Loading history...</p>
            ) : leaveHistory.length === 0 ? (
                <p>You have no leave requests.</p>
            ) : (
                leaveHistory.map(request => (
                <div key={request.id} className="history-item">
                    <div className="history-item-dates">
                    <span>Duration: <strong>{calculateDuration(request.fromDate, request.toDate)} day(s)</strong></span>
                    <span>From: {new Date(request.fromDate).toLocaleDateString()} To: {new Date(request.toDate).toLocaleDateString()}</span>
                    </div>
                    <div className={`status-badge ${getStatusClass(request.status)}`}>
                    {request.status}
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}