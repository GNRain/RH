
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Settings, Users, Clock, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const CompanySettings = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: "TechCorp Solutions",
    address: "123 Business Ave, Tech City, TC 12345",
    phone: "+1-555-0100",
    email: "contact@techcorp.com",
    website: "www.techcorp.com",
    description: "Leading technology solutions provider specializing in enterprise software development and digital transformation.",
  });

  const [departments, setDepartments] = useState([
    { id: 1, name: "IT Department", employees: 45, manager: "John Smith" },
    { id: 2, name: "HR Department", employees: 32, manager: "Jane Doe" },
    { id: 3, name: "Operations", employees: 65, manager: "Mike Wilson" },
  ]);

  const [positions, setPositions] = useState([
    { id: 1, title: "Senior Developer", department: "IT Department", count: 15 },
    { id: 2, title: "Junior Developer", department: "IT Department", count: 20 },
    { id: 3, title: "DevOps Engineer", department: "IT Department", count: 10 },
    { id: 4, title: "HR Manager", department: "HR Department", count: 2 },
    { id: 5, title: "HR Assistant", department: "HR Department", count: 15 },
    { id: 6, title: "Recruiter", department: "HR Department", count: 15 },
    { id: 7, title: "Operations Lead", department: "Operations", count: 5 },
    { id: 8, title: "Supervisor", department: "Operations", count: 20 },
    { id: 9, title: "Coordinator", department: "Operations", count: 25 },
    { id: 10, title: "Analyst", department: "Operations", count: 15 },
  ]);

  const [leaveSettings, setLeaveSettings] = useState({
    annualLeaveDefault: 25,
    sickLeaveDefault: 15,
    personalLeaveDefault: 5,
    emergencyLeaveDefault: 3,
    carryOverEnabled: true,
    maxCarryOver: 5,
    approvalRequired: true,
    minimumNotice: 7,
  });

  const [workSettings, setWorkSettings] = useState({
    workingHoursPerDay: 8,
    workingDaysPerWeek: 5,
    shiftPattern: "3-shift",
    overtimeEnabled: true,
    flexTimeEnabled: false,
  });

  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: "", manager: "" });
  const [newPosition, setNewPosition] = useState({ title: "", department: "" });

  const handleSaveCompanyInfo = () => {
    toast({
      title: "Success",
      description: "Company information updated successfully",
    });
  };

  const handleAddDepartment = () => {
    if (!newDepartment.name || !newDepartment.manager) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newDept = {
      id: departments.length + 1,
      name: newDepartment.name,
      employees: 0,
      manager: newDepartment.manager,
    };

    setDepartments([...departments, newDept]);
    setNewDepartment({ name: "", manager: "" });
    setIsAddingDepartment(false);

    toast({
      title: "Success",
      description: "Department added successfully",
    });
  };

  const handleAddPosition = () => {
    if (!newPosition.title || !newPosition.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newPos = {
      id: positions.length + 1,
      title: newPosition.title,
      department: newPosition.department,
      count: 0,
    };

    setPositions([...positions, newPos]);
    setNewPosition({ title: "", department: "" });
    setIsAddingPosition(false);

    toast({
      title: "Success",
      description: "Position added successfully",
    });
  };

  const handleSaveLeaveSettings = () => {
    toast({
      title: "Success",
      description: "Leave settings updated successfully",
    });
  };

  const handleSaveWorkSettings = () => {
    toast({
      title: "Success",
      description: "Work settings updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Settings</h2>
        <p className="text-gray-600">Manage company configuration and organizational structure</p>
      </div>

      {/* Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Configuration</p>
                <p className="text-lg font-semibold">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-lg font-semibold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Positions</p>
                <p className="text-lg font-semibold">{positions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Work Hours</p>
                <p className="text-lg font-semibold">{workSettings.workingHoursPerDay}h/day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={companyInfo.description}
                onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button onClick={handleSaveCompanyInfo} className="w-full">
              Save Company Information
            </Button>
          </CardContent>
        </Card>

        {/* Leave Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="annualLeave">Annual Leave (days)</Label>
                <Input
                  id="annualLeave"
                  type="number"
                  value={leaveSettings.annualLeaveDefault}
                  onChange={(e) => setLeaveSettings({ ...leaveSettings, annualLeaveDefault: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="sickLeave">Sick Leave (days)</Label>
                <Input
                  id="sickLeave"
                  type="number"
                  value={leaveSettings.sickLeaveDefault}
                  onChange={(e) => setLeaveSettings({ ...leaveSettings, sickLeaveDefault: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="personalLeave">Personal Leave (days)</Label>
                <Input
                  id="personalLeave"
                  type="number"
                  value={leaveSettings.personalLeaveDefault}
                  onChange={(e) => setLeaveSettings({ ...leaveSettings, personalLeaveDefault: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="emergencyLeave">Emergency Leave (days)</Label>
                <Input
                  id="emergencyLeave"
                  type="number"
                  value={leaveSettings.emergencyLeaveDefault}
                  onChange={(e) => setLeaveSettings({ ...leaveSettings, emergencyLeaveDefault: Number(e.target.value) })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="carryOver">Enable Leave Carry Over</Label>
                  <p className="text-sm text-gray-600">Allow unused leave to carry over to next year</p>
                </div>
                <Switch
                  id="carryOver"
                  checked={leaveSettings.carryOverEnabled}
                  onCheckedChange={(checked) => setLeaveSettings({ ...leaveSettings, carryOverEnabled: checked })}
                />
              </div>

              {leaveSettings.carryOverEnabled && (
                <div>
                  <Label htmlFor="maxCarryOver">Maximum Carry Over (days)</Label>
                  <Input
                    id="maxCarryOver"
                    type="number"
                    value={leaveSettings.maxCarryOver}
                    onChange={(e) => setLeaveSettings({ ...leaveSettings, maxCarryOver: Number(e.target.value) })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="approvalRequired">Require Approval</Label>
                  <p className="text-sm text-gray-600">All leave requests need manager approval</p>
                </div>
                <Switch
                  id="approvalRequired"
                  checked={leaveSettings.approvalRequired}
                  onCheckedChange={(checked) => setLeaveSettings({ ...leaveSettings, approvalRequired: checked })}
                />
              </div>

              <div>
                <Label htmlFor="minimumNotice">Minimum Notice Period (days)</Label>
                <Input
                  id="minimumNotice"
                  type="number"
                  value={leaveSettings.minimumNotice}
                  onChange={(e) => setLeaveSettings({ ...leaveSettings, minimumNotice: Number(e.target.value) })}
                />
              </div>
            </div>

            <Button onClick={handleSaveLeaveSettings} className="w-full">
              Save Leave Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Departments Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Departments</CardTitle>
            <Dialog open={isAddingDepartment} onOpenChange={setIsAddingDepartment}>
              <DialogTrigger asChild>
                <Button>Add Department</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Department</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deptName">Department Name *</Label>
                    <Input
                      id="deptName"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      placeholder="Enter department name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deptManager">Department Manager *</Label>
                    <Input
                      id="deptManager"
                      value={newDepartment.manager}
                      onChange={(e) => setNewDepartment({ ...newDepartment, manager: e.target.value })}
                      placeholder="Enter manager name"
                    />
                  </div>
                </div>
                <div className="flex space-x-2 justify-end mt-6">
                  <Button variant="outline" onClick={() => setIsAddingDepartment(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDepartment}>Add Department</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{dept.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Employees:</span>
                      <Badge variant="secondary">{dept.employees}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Manager:</span>
                      <span className="font-medium">{dept.manager}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Positions Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Job Positions</CardTitle>
            <Dialog open={isAddingPosition} onOpenChange={setIsAddingPosition}>
              <DialogTrigger asChild>
                <Button>Add Position</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Position</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="posTitle">Position Title *</Label>
                    <Input
                      id="posTitle"
                      value={newPosition.title}
                      onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                      placeholder="Enter position title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="posDept">Department *</Label>
                    <Select
                      value={newPosition.department}
                      onValueChange={(value) => setNewPosition({ ...newPosition, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-2 justify-end mt-6">
                  <Button variant="outline" onClick={() => setIsAddingPosition(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPosition}>Add Position</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Position</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Current Count</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{position.title}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-blue-100 text-blue-800">
                        {position.department}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{position.count} employees</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Work Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Work Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workingHours">Working Hours per Day</Label>
              <Input
                id="workingHours"
                type="number"
                value={workSettings.workingHoursPerDay}
                onChange={(e) => setWorkSettings({ ...workSettings, workingHoursPerDay: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="workingDays">Working Days per Week</Label>
              <Input
                id="workingDays"
                type="number"
                value={workSettings.workingDaysPerWeek}
                onChange={(e) => setWorkSettings({ ...workSettings, workingDaysPerWeek: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shiftPattern">Shift Pattern</Label>
            <Select
              value={workSettings.shiftPattern}
              onValueChange={(value) => setWorkSettings({ ...workSettings, shiftPattern: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single-shift">Single Shift</SelectItem>
                <SelectItem value="2-shift">2 Shifts</SelectItem>
                <SelectItem value="3-shift">3 Shifts (24/7)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="overtime">Enable Overtime</Label>
                <p className="text-sm text-gray-600">Allow employees to work overtime hours</p>
              </div>
              <Switch
                id="overtime"
                checked={workSettings.overtimeEnabled}
                onCheckedChange={(checked) => setWorkSettings({ ...workSettings, overtimeEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="flextime">Enable Flexible Hours</Label>
                <p className="text-sm text-gray-600">Allow flexible start and end times</p>
              </div>
              <Switch
                id="flextime"
                checked={workSettings.flexTimeEnabled}
                onCheckedChange={(checked) => setWorkSettings({ ...workSettings, flexTimeEnabled: checked })}
              />
            </div>
          </div>

          <Button onClick={handleSaveWorkSettings} className="w-full">
            Save Work Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySettings;
