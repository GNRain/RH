import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { VscSend } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next'; // --- ADD IMPORT ---

import { ApprovalChain } from '../../components/ApprovalChain/ApprovalChain';
import './LeavePage.css';
import '../../components/Stepper/Stepper.css';

const API_URL = 'http://localhost:3000';

// --- (Interfaces remain the same) ---
type Approver = {
  name: string; familyName: string;
} | null;
type ApprovalStep = {
  id: string; approver: Approver;
  approverType: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  comment: string | null; step: number;
};
interface LeaveRequest {
  id: string; fromDate: string; toDate: string; reason: string;
  overallStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  approvals: ApprovalStep[];
}

const calculateDuration = (fromDate: string, toDate: string): number => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const differenceInTime = end.getTime() - start.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);
  return Math.max(1, Math.round(differenceInDays) + 1);
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ACCEPTED': return 'status-accepted';
    case 'PENDING': return 'status-pending';
    case 'DECLINED': return 'status-declined';
    default: return '';
  }
};

export function LeavePage() {
  const { t } = useTranslation(); // --- INITIALIZE THE HOOK ---
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFromDate('');
      setToDate('');
      setReason('');
      await fetchLeaveHistory();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-page-layout">
      {/* Card 1: The Request Form */}
      <div className="step-circle-container">
        <form onSubmit={handleSubmit} className="step-default">
          <h2>{t('leave_page.new_request_title')}</h2>
          <p>{t('leave_page.new_request_subtitle')}</p>

          <div className="form-container" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="from-date" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{t('leave_page.from_label')}</label>
                <input id="from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="form-input" required />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="to-date" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{t('leave_page.to_label')}</label>
                <input id="to-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="form-input" required />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="reason" style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{t('leave_page.reason_label')}</label>
              <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="form-input-reason" placeholder={t('leave_page.reason_placeholder')} rows={2} required />
            </div>
          </div>

          {error && <p style={{ color: '#fca5a5', fontSize: '0.875rem', marginTop: '1rem' }}>{error}</p>}

          <div className="step-footer" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loading} className="button button-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <VscSend />
              {loading ? t('leave_page.submitting_button') : t('leave_page.submit_button')}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: The History List */}
      <div className="step-circle-container" style={{ marginTop: '0' }}>
        <div className="step-default">
          <h2>{t('leave_page.history_title')}</h2>
          <div className="history-list">
            {isHistoryLoading ? (
              <p>{t('leave_page.history_loading')}</p>
            ) : leaveHistory.length === 0 ? (
              <p>{t('leave_page.history_empty')}</p>
            ) : (
              leaveHistory.map((request) => (
                <div key={request.id} className="history-item">
                  <div className="history-item-main-content">
                    <div className="history-item-details">
                      <span>{t('leave_page.duration', { count: calculateDuration(request.fromDate, request.toDate) })}</span>
                      <span>{t('leave_page.from_label')}: {new Date(request.fromDate).toLocaleDateString()} {t('leave_page.to_label')}: {new Date(request.toDate).toLocaleDateString()}</span>
                    </div>
                    <div className={`status-badge ${getStatusClass(request.overallStatus)}`}>
                      {t(`leave_statuses.${request.overallStatus.toLowerCase()}`)}
                    </div>
                  </div>
                  <ApprovalChain approvals={request.approvals} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}