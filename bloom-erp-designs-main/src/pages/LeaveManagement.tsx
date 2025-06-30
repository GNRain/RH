
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const LeaveManagement = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingRequests = [
    {
      id: 1,
      employeeName: "John Doe",
      employeeId: "EMP001",
      department: "IT Department",
      leaveType: "Annual Leave",
      startDate: "2024-02-15",
      endDate: "2024-02-19",
      days: 5,
      reason: "Family vacation to Europe",
      appliedDate: "2024-02-01",
      remainingBalance: 18,
    },
    {
      id: 2,
      employeeName: "Jane Smith",
      employeeId: "EMP002",
      department: "HR Department",
      leaveType: "Sick Leave",
      startDate: "2024-02-10",
      endDate: "2024-02-12",
      days: 3,
      reason: "Medical treatment and recovery",
      appliedDate: "2024-02-08",
      remainingBalance: 12,
    },
    {
      id: 3,
      employeeName: "Mike Wilson",
      employeeId: "EMP003",
      department: "Operations",
      leaveType: "Personal Leave",
      startDate: "2024-02-20",
      endDate: "2024-02-20",
      days: 1,
      reason: "Personal appointment",
      appliedDate: "2024-02-05",
      remainingBalance: 5,
    },
    {
      id: 4,
      employeeName: "Sarah Johnson",
      employeeId: "EMP004",
      department: "IT Department",
      leaveType: "Emergency Leave",
      startDate: "2024-02-12",
      endDate: "2024-02-14",
      days: 3,
      reason: "Family emergency",
      appliedDate: "2024-02-10",
      remainingBalance: 8,
    },
  ];

  const recentDecisions = [
    {
      id: 5,
      employeeName: "David Brown",
      leaveType: "Annual Leave",
      startDate: "2024-01-15",
      endDate: "2024-01-19",
      status: "Approved",
      decidedBy: "HR Manager",
      decidedDate: "2024-01-02",
    },
    {
      id: 6,
      employeeName: "Lisa Anderson",
      leaveType: "Sick Leave",
      startDate: "2024-01-22",
      endDate: "2024-01-24",
      status: "Rejected",
      decidedBy: "HR Manager",
      decidedDate: "2024-01-20",
      rejectionReason: "Insufficient medical documentation",
    },
  ];

  const handleApprove = (requestId: number) => {
    toast({
      title: "Success",
      description: "Leave request approved successfully",
    });
  };

  const handleReject = (requestId: number) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Leave request rejected with reason provided",
    });
    
    setRejectionReason("");
    setSelectedRequest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Leave Management</h2>
        <p className="text-gray-600">Review and manage employee leave requests</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">15</p>
              <p className="text-sm text-gray-600">Approved This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">3</p>
              <p className="text-sm text-gray-600">Rejected This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">87%</p>
              <p className="text-sm text-gray-600">Approval Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900">{request.employeeName}</h3>
                      <Badge variant="secondary">{request.employeeId}</Badge>
                      <Badge className={getDepartmentColor(request.department)}>
                        {request.department}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Leave Type:</span> {request.leaveType}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {request.days} day(s)
                      </div>
                      <div>
                        <span className="font-medium">Dates:</span> {request.startDate} to {request.endDate}
                      </div>
                      <div>
                        <span className="font-medium">Remaining Balance:</span> {request.remainingBalance} days
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Reason:</span>
                      <p className="text-gray-600 mt-1">{request.reason}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Applied on: {request.appliedDate}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleApprove(request.id)} className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" onClick={() => setSelectedRequest(request)}>
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Leave Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              Rejecting leave request for <strong>{selectedRequest?.employeeName}</strong>
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Reason for Rejection *
                            </label>
                            <Textarea
                              placeholder="Please provide a clear reason for rejecting this leave request"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="flex space-x-2 justify-end">
                            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => handleReject(selectedRequest?.id)}>
                              Confirm Rejection
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

      {/* Recent Decisions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Leave Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Dates</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Decided By</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDecisions.map((decision) => (
                  <tr key={decision.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{decision.employeeName}</td>
                    <td className="py-3 px-4">{decision.leaveType}</td>
                    <td className="py-3 px-4">
                      {decision.startDate} to {decision.endDate}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <Badge className={getStatusColor(decision.status)}>
                          {decision.status}
                        </Badge>
                        {decision.rejectionReason && (
                          <div className="text-xs text-red-600 mt-1">
                            {decision.rejectionReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{decision.decidedBy}</td>
                    <td className="py-3 px-4 text-gray-600">{decision.decidedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagement;
