import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { VscSend } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
// Make sure this path is correct for your project structure
import { ApprovalChain } from '@/components/ApprovalChain/ApprovalChain';
import API_URL from '../config';

type Approver = {
  name: string; familyName: string;
} | null;
type ApprovalStep = {
  id: string; approver: Approver;
  approverType: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  comment: string | null; step: number;
};
interface LeaveRequestType {
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

// This now uses theme-aware CSS classes from your shadcn/ui setup
const getStatusColor = (status: string) => {
  switch (status) {
    case "ACCEPTED":
      return "bg-success text-success-foreground";
    case "PENDING":
      return "bg-secondary text-secondary-foreground";
    case "DECLINED":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const LeaveRequest = () => {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [leaveHistory, setLeaveHistory] = useState<LeaveRequestType[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // --- NEW ---: State to track the expanded row
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // --- NEW ---: Toggle function
  const handleToggleRow = (requestId: string) => {
    setExpandedRequestId(currentId => (currentId === requestId ? null : requestId));
  };

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
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
      toast({
        title: "Error",
        description: err.response?.data?.message || 'Failed to submit leave request.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('leave_page.new_request_title')}</h2>
        <p className="text-muted-foreground">{t('leave_page.new_request_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Leave Request */}
        <Card>
          <CardHeader>
            <CardTitle>{t('leave_page.new_request_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-date">{t('leave_page.from_label')}</Label>
                  <Input id="from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="to-date">{t('leave_page.to_label')}</Label>
                  <Input id="to-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
                </div>
              </div>

              <div>
                <Label htmlFor="reason">{t('leave_page.reason_label')}</Label>
                <Textarea id="reason" placeholder={t('leave_page.reason_placeholder')} value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                <VscSend className="mr-2" />
                {loading ? t('leave_page.submitting_button') : t('leave_page.submit_button')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Leave Balance */}
         <Card>
          <CardHeader>
            <CardTitle>{t('leave_page.balance_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900">{t('leave_page.annual_leave')}</span>
                <span className="text-blue-700">18 {t('leave_page.days_remaining')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">{t('leave_page.sick_leave')}</span>
                <span className="text-green-700">12 {t('leave_page.days_remaining')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-900">{t('leave_page.personal_leave')}</span>
                <span className="text-purple-700">5 {t('leave_page.days_remaining')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MODIFIED ---: My Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('leave_page.history_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">{t('leave_page.duration_label')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">{t('leave_page.dates_label')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">{t('leave_page.reason_label')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">{t('leave_page.status_label')}</th>
                </tr>
              </thead>
              <tbody>
                {isHistoryLoading ? (
                  <tr><td colSpan={4} className="text-center py-4">{t('leave_page.history_loading')}</td></tr>
                ) : leaveHistory.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4">{t('leave_page.history_empty')}</td></tr>
                ) : (
                  leaveHistory.map((request) => (
                    // Use React.Fragment to group the main row and the details row
                    <React.Fragment key={request.id}>
                      <tr
                        className="border-b border-muted hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleToggleRow(request.id)}
                      >
                        <td className="py-3 px-4">{t('leave_page.duration', { count: calculateDuration(request.fromDate, request.toDate) })}</td>
                        <td className="py-3 px-4">{new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 truncate max-w-xs">{request.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.overallStatus)}`}>
                            {t(`leave_statuses.${request.overallStatus.toLowerCase()}`)}
                          </span>
                        </td>
                      </tr>
                      {/* This is the new expandable row */}
                      {expandedRequestId === request.id && (
                        <tr className="bg-muted/20">
                          <td colSpan={4} className="p-4">
                            <h4 className="text-sm font-semibold mb-2 text-foreground">Approval Workflow</h4>
                            <ApprovalChain approvals={request.approvals} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequest;