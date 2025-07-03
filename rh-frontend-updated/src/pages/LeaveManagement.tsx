import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import API_URL from '../config';
import { Check, X, User, Calendar, Hourglass } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// --- MODIFIED ---: Updated interface to reflect the correct data structure
interface PendingRequest {
  id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  user: {
    name: string;
    familyName: string;
    department: {
        name: string; // The department is an object with a name property
    };
  };
}

const calculateDuration = (fromDate: string, toDate: string): number => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const differenceInTime = end.getTime() - start.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return Math.max(1, Math.round(differenceInDays) + 1);
};

// --- MODIFIED ---: Theme-aware color utility
const getDepartmentVariant = (departmentName: string): 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' => {
  if (departmentName.includes('IT')) return 'primary';
  if (departmentName.includes('HR')) return 'success';
  if (departmentName.includes('Operations')) return 'warning';
  return 'secondary';
};

const LeaveManagement = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // The endpoint `/leave/pending-actions` seems correct for fetching items requiring manager action.
  const fetchPendingRequests = useCallback(async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleUpdateRequest = async (requestId: string, status: 'ACCEPTED' | 'DECLINED', comment?: string) => {
    try {
        const token = localStorage.getItem('access_token');
        // The action endpoint seems correct
        await axios.patch(
            `${API_URL}/leave/${requestId}/action`,
            { status, comment },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchPendingRequests();
        toast({
          title: "Success",
          description: `Leave request has been ${status.toLowerCase()}.`,
        });
    } catch(err) {
        toast({
          title: "Error",
          description: "Failed to update the request. Please try again.",
          variant: "destructive",
        });
    }
  };

  const handleDeclineSubmit = () => {
    if (selectedRequest && declineReason) {
        handleUpdateRequest(selectedRequest.id, 'DECLINED', declineReason);
        setSelectedRequest(null);
        setDeclineReason('');
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-4 pt-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    );
  }

  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            {t('leave_management_page.title')}
        </h2>
        <p className="text-muted-foreground">{t('leave_management_page.subtitle')}</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Hourglass className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">{t('leave_management_page.no_requests_title')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('leave_management_page.no_requests_subtitle')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                     <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {request.user.name} {request.user.familyName}
                    </h3>
                      {/* --- THE FIX IS HERE --- */}
                      <Badge variant={getDepartmentVariant(request.user.department.name)}>
                        {request.user.department.name}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}</span>
                        </div>
                        <span className="font-bold text-lg text-foreground">
                            {calculateDuration(request.fromDate, request.toDate)}
                        </span>
                        <span>{t('leave_page.days_label')}</span>
                    </div>

                    <p className="text-sm text-foreground pt-2">
                        <strong className="block mb-1">{t('leave_management_page.reason_label')}:</strong>
                        {request.reason}
                    </p>
                  </div>
                  <div className="flex md:flex-col justify-end gap-2 shrink-0">
                    <Button onClick={() => handleUpdateRequest(request.id, 'ACCEPTED')} variant="outline" className="border-success text-success hover:bg-success hover:text-success-foreground">
                      <Check className="mr-2 h-4 w-4" />
                      {t('leave_management_page.approve_title')}
                    </Button>

                    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedRequest(null)}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" onClick={() => setSelectedRequest(request)}>
                                <X className="mr-2 h-4 w-4" />
                                {t('leave_management_page.decline_title')}
                            </Button>
                        </DialogTrigger>
                        {selectedRequest && selectedRequest.id === request.id && (
                           <DialogContent>
                             <DialogHeader>
                               <DialogTitle>{t('leave_management_page.decline_reason_prompt')}</DialogTitle>
                             </DialogHeader>
                             <div className="space-y-4 py-4">
                               <p className="text-sm text-muted-foreground">
                                 {t('leave_management_page.rejecting_request_for')} <strong>{selectedRequest.user.name} {selectedRequest.user.familyName}</strong>
                               </p>
                               <Textarea
                                 placeholder={t('leave_management_page.decline_reason_placeholder')}
                                 value={declineReason}
                                 onChange={(e) => setDeclineReason(e.target.value)}
                                 rows={4}
                               />
                             </div>
                             <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">{t('leave_management_page.cancel_button')}</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button variant="destructive" onClick={handleDeclineSubmit} disabled={!declineReason}>
                                        {t('leave_management_page.decline_button')}
                                    </Button>
                                </DialogClose>
                             </DialogFooter>
                           </DialogContent>
                        )}
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;