import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api'; // --- Use the new API client ---
import { VscSend } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ApprovalChain } from '@/components/ApprovalChain/ApprovalChain';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Interfaces ---
type Approver = { name: string; familyName: string; } | null;
type ApprovalStep = { id: string; approver: Approver; approverType: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR'; status: 'PENDING' | 'ACCEPTED' | 'DECLINED'; comment: string | null; step: number; };
interface LeaveRequestType { id: string; fromDate: string; toDate: string; reason: string; overallStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED'; approvals: ApprovalStep[]; }
interface LeaveBalance {
  annual: { balance: number };
  sick: { balance: number };
  personal: { balance: number };
}

const calculateDuration = (fromDate: string, toDate: string): number => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const differenceInTime = end.getTime() - start.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);
  return Math.max(1, Math.round(differenceInDays) + 1);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACCEPTED": return "bg-success text-success-foreground";
    case "PENDING": return "bg-secondary text-secondary-foreground";
    case "DECLINED": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const LeaveRequest = () => {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('VACATION');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [leaveHistory, setLeaveHistory] = useState<LeaveRequestType[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);

  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const handleToggleRow = (requestId: string) => {
    setExpandedRequestId(currentId => (currentId === requestId ? null : requestId));
  };

  const fetchLeaveData = useCallback(async () => {
    setIsHistoryLoading(true);
    setIsBalanceLoading(true);
    setError('');
    try {
      // --- Use apiClient for both requests ---
      const [historyRes, balanceRes] = await Promise.all([
        apiClient.get('/leave/my-requests'),
        apiClient.get('/leave/balance')
      ]);
      setLeaveHistory(historyRes.data);
      setLeaveBalance(balanceRes.data);
    } catch (err: any) {
      setError('Failed to fetch leave data.');
    } finally {
      setIsHistoryLoading(false);
      setIsBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // --- Use apiClient for the post request ---
      await apiClient.post(
        '/leave',
        { fromDate, toDate, reason, type: leaveType },
      );
      setFromDate('');
      setToDate('');
      setReason('');
      setLeaveType('VACATION');
      await fetchLeaveData();
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
                <Label htmlFor="leave-type">{t('leave_page.type_label')}</Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger id="leave-type">
                        <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="VACATION">{t('leave_page.annual_leave')}</SelectItem>
                        <SelectItem value="SICK_LEAVE">{t('leave_page.sick_leave')}</SelectItem>
                        <SelectItem value="PERSONAL">{t('leave_page.personal_leave')}</SelectItem>
                    </SelectContent>
                </Select>
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

        <Card>
          <CardHeader>
            <CardTitle>{t('leave_page.balance_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isBalanceLoading ? (
              <p>{t('leave_page.history_loading')}</p>
            ) : leaveBalance ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-900">{t('leave_page.annual_leave')}</span>
                  <span className="text-blue-700">{leaveBalance.annual.balance} {t('leave_page.days_remaining')}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-900">{t('leave_page.sick_leave')}</span>
                  <span className="text-green-700">{leaveBalance.sick.balance} {t('leave_page.days_remaining')}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-900">{t('leave_page.personal_leave')}</span>
                  <span className="text-purple-700">{leaveBalance.personal.balance} {t('leave_page.days_remaining')}</span>
                </div>
              </div>
            ) : (
              <p>Could not load leave balance.</p>
            )}
          </CardContent>
        </Card>
      </div>

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