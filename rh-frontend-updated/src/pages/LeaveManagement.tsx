import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { VscCheck, VscChromeClose } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

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

const LeaveManagement = () => {
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
        toast({
          title: "Success",
          description: `Leave request ${status.toLowerCase()}`,
        });
    } catch(err) {
        toast({
          title: "Error",
          description: "Failed to update the request. Please try again.",
          variant: "destructive",
        });
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

  if (loading) return <p className="text-white">{t('leave_management_page.loading')}</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "IT Department":
        return "bg-blue-100 text-blue-800";
      case "HR Department":
        return "bg-green-100 text-green-800";
      case "Operations":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('leave_management_page.title')}</h2>
        <p className="text-gray-600">{t('leave_management_page.subtitle')}</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold">{t('leave_management_page.no_requests_title')}</h3>
            <p className="text-gray-600">{t('leave_management_page.no_requests_subtitle')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('leave_management_page.pending_requests_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-900">{request.user.name} {request.user.familyName}</h3>
                        <Badge className={getDepartmentColor(request.user.department)}>
                          {request.user.department}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">{t('leave_management_page.duration_label')}:</span> {calculateDuration(request.fromDate, request.toDate)} day(s)
                        </div>
                        <div>
                          <span className="font-medium">{t('leave_management_page.from_label')}:</span> {new Date(request.fromDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">{t('leave_management_page.to_label')}:</span> {new Date(request.toDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">{t('leave_management_page.reason_label')}:</span>
                        <p className="text-gray-600 mt-1">{request.reason}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleUpdateRequest(request.id, 'ACCEPTED')} className="bg-green-600 hover:bg-green-700">
                        <VscCheck className="mr-2" />
                        {t('leave_management_page.approve_title')}
                      </Button>
                      <Dialog open={isDeclineModalOpen && selectedRequest?.id === request.id} onOpenChange={setIsDeclineModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" onClick={() => openDeclineModal(request)}>
                            <VscChromeClose className="mr-2" />
                            {t('leave_management_page.decline_title')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t('leave_management_page.decline_reason_prompt')}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                {t('leave_management_page.rejecting_request_for')} <strong>{selectedRequest?.user.name} {selectedRequest?.user.familyName}</strong>
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('leave_management_page.decline_reason_label')}
                              </label>
                              <Textarea
                                placeholder={t('leave_management_page.decline_reason_placeholder')}
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <div className="flex space-x-2 justify-end">
                              <Button variant="outline" onClick={closeDeclineModal}>
                                {t('leave_management_page.cancel_button')}
                              </Button>
                              <Button variant="destructive" onClick={submitDecline} disabled={!declineReason}>
                                {t('leave_management_page.decline_button')}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaveManagement;
