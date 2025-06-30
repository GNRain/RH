
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const LeaveRequest = () => {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const leaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Personal Leave",
    "Maternity/Paternity Leave",
    "Emergency Leave",
  ];

  const myLeaveRequests = [
    {
      id: 1,
      type: "Annual Leave",
      startDate: "2024-01-15",
      endDate: "2024-01-19",
      status: "Approved",
      reason: "Family vacation",
      appliedDate: "2024-01-01",
    },
    {
      id: 2,
      type: "Sick Leave",
      startDate: "2024-01-22",
      endDate: "2024-01-22",
      status: "Pending",
      reason: "Medical appointment",
      appliedDate: "2024-01-20",
    },
    {
      id: 3,
      type: "Personal Leave",
      startDate: "2024-02-05",
      endDate: "2024-02-07",
      status: "Rejected",
      reason: "Personal matters",
      appliedDate: "2024-01-25",
      rejectionReason: "Insufficient notice period",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Leave request submitted successfully",
    });
    
    setFormData({
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Leave Request</h2>
        <p className="text-gray-600">Submit and manage your leave requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Leave Request */}
        <Card>
          <CardHeader>
            <CardTitle>Submit New Leave Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select value={formData.leaveType} onValueChange={(value) => setFormData({ ...formData, leaveType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for your leave request"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Leave Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Leave Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900">Annual Leave</span>
                <span className="text-blue-700">18 days remaining</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">Sick Leave</span>
                <span className="text-green-700">12 days remaining</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-900">Personal Leave</span>
                <span className="text-purple-700">5 days remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Dates</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Applied</th>
                </tr>
              </thead>
              <tbody>
                {myLeaveRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{request.type}</td>
                    <td className="py-3 px-4">
                      {request.startDate} to {request.endDate}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        {request.reason}
                        {request.rejectionReason && (
                          <div className="text-sm text-red-600 mt-1">
                            Rejected: {request.rejectionReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{request.appliedDate}</td>
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

export default LeaveRequest;
