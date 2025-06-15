import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { VscCheck, VscChromeClose } from 'react-icons/vsc';
import './LeaveManagementPage.css';

const API_URL = 'http://localhost:3000';

interface PendingRequest {
  id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  user: {
    name: string;
    familyName: string;
    department: string;
  };
}

const calculateDuration = (fromDate: string, toDate: string): number => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const differenceInTime = end.getTime() - start.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return Math.max(1, differenceInDays + 1);
};

export function LeaveManagementPage() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/leave/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch pending requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleUpdateRequest = async (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
        const token = localStorage.getItem('access_token');
        await axios.patch(
            `${API_URL}/leave/${requestId}/status`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        // Refresh the list after an action
        fetchPendingRequests();
    } catch(err) {
        alert('Failed to update the request. Please try again.');
    }
  };

  if (loading) {
    return <p style={{color: 'white'}}>Loading requests...</p>;
  }

  if (error) {
      return <p style={{color: 'red'}}>{error}</p>;
  }

  return (
    <div className="leave-mgmt-container">
      <h1>Leave Management</h1>
      <p>Review and respond to pending leave requests from employees.</p>

      {requests.length === 0 ? (
        <div className="no-requests-card">
            <h3>All Clear!</h3>
            <p>There are no pending leave requests at this time.</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((req) => (
            <div key={req.id} className="request-item">
              <div className="request-item-main">
                <h4>{req.user.name} {req.user.familyName} <span className="department-tag">{req.user.department}</span></h4>
                <p className="request-reason">{req.reason}</p>
                <div className="request-dates">
                  <span>From: <strong>{new Date(req.fromDate).toLocaleDateString()}</strong></span>
                  <span>To: <strong>{new Date(req.toDate).toLocaleDateString()}</strong></span>
                  <span>Duration: <strong>{calculateDuration(req.fromDate, req.toDate)} day(s)</strong></span>
                </div>
              </div>
              <div className="request-actions">
                <button className="action-button decline" onClick={() => handleUpdateRequest(req.id, 'DECLINED')} title="Decline">
                    <VscChromeClose size={20} />
                </button>
                <button className="action-button accept" onClick={() => handleUpdateRequest(req.id, 'ACCEPTED')} title="Accept">
                    <VscCheck size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}