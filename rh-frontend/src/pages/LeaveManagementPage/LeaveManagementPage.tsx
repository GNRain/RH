import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { VscCheck, VscChromeClose } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal/Modal';
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
    return Math.max(1, Math.round(differenceInDays) + 1);
};

export function LeaveManagementPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/leave/pending-actions`, {
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

  const handleUpdateRequest = async (requestId: string, status: 'ACCEPTED' | 'DECLINED', comment?: string) => {
    try {
        const token = localStorage.getItem('access_token');
        await axios.patch(
            `${API_URL}/leave/${requestId}/action`,
            { status, comment },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchPendingRequests();
    } catch(err) {
        alert('Failed to update the request. Please try again.');
    }
  };

  const openDeclineModal = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIsDeclineModalOpen(true);
  };

  const closeDeclineModal = () => {
    setSelectedRequest(null);
    setDeclineReason('');
    setIsDeclineModalOpen(false);
  }

  const submitDecline = () => {
    if (selectedRequest && declineReason) {
        handleUpdateRequest(selectedRequest.id, 'DECLINED', declineReason);
        closeDeclineModal();
    }
  }

  if (loading) return <p style={{color: 'white'}}>Loading requests...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;

  return (
    <div className="leave-mgmt-container">
      {/* Text is translated here */}
      <h1>{t('leave_management_page.title')}</h1>
      <p>{t('leave_management_page.subtitle')}</p>

      {requests.length === 0 ? (
        <div className="no-requests-card">
            <h3>{t('leave_management_page.no_requests_title')}</h3>
            <p>{t('leave_management_page.no_requests_subtitle')}</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((req) => (
            <div key={req.id} className="request-item">
              <div className="request-item-main">
                <h4>{req.user.name} {req.user.familyName} <span className="department-tag">{req.user.department}</span></h4>
                <p className="request-reason">{req.reason}</p>
<div className="request-dates">
  <span>{t('leave_management_page.duration_label')}: <strong>{calculateDuration(req.fromDate, req.toDate)} day(s)</strong></span>
  {/* Use the t() function for From and To */}
  <span>{t('leave_management_page.from_label')}: <strong>{new Date(req.fromDate).toLocaleDateString()}</strong></span>
  <span>{t('leave_management_page.to_label')}: <strong>{new Date(req.toDate).toLocaleDateString()}</strong></span>
</div>
              </div>
              <div className="request-actions">
                {/* Titles (tooltips) are translated here */}
                <button className="action-button decline" onClick={() => openDeclineModal(req)} title={t('leave_management_page.decline_title')}>
                    <VscChromeClose size={20} />
                </button>
                <button className="action-button accept" onClick={() => handleUpdateRequest(req.id, 'ACCEPTED')} title={t('leave_management_page.approve_title')}>
                    <VscCheck size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isDeclineModalOpen} onClose={closeDeclineModal} title={t('leave_management_page.decline_reason_prompt')}>
        <div className="decline-modal-content">
            {/* Text is translated here */}
            <label htmlFor="declineReason">{t('leave_management_page.decline_reason_label')}</label>
            <textarea 
                id="declineReason"
                className="form-input-reason" 
                rows={4} 
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
            />
        </div>
        <div className="modal-actions">
            {/* Text is translated here */}
            <button type="button" onClick={closeDeclineModal} className="button button-secondary">{t('leave_management_page.cancel_button')}</button>
            <button type="button" onClick={submitDecline} disabled={!declineReason} className="button button-danger">{t('leave_management_page.decline_button')}</button>
        </div>
      </Modal>
    </div>
  );
}