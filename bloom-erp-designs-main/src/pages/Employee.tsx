
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Employee = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
    joinDate: "",
  });

  const employees = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      phone: "+1-555-0123",
      department: "IT Department",
      position: "Senior Developer",
      salary: "$75,000",
      joinDate: "2023-01-15",
      status: "Active",
      leaveBalance: 18,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      phone: "+1-555-0124",
      department: "HR Department",
      position: "HR Manager",
      salary: "$65,000",
      joinDate: "2022-03-10",
      status: "Active",
      leaveBalance: 22,
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@company.com",
      phone: "+1-555-0125",
      department: "Operations",
      position: "Operations Lead",
      salary: "$70,000",
      joinDate: "2022-07-20",
      status: "Active",
      leaveBalance: 15,
    },
    {
      id: 4,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      phone: "+1-555-0126",
      department: "IT Department",
      position: "Junior Developer",
      salary: "$50,000",
      joinDate: "2023-09-01",
      status: "Active",
      leaveBalance: 25,
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@company.com",
      phone: "+1-555-0127",
      department: "Operations",
      position: "Supervisor",
      salary: "$55,000",
      joinDate: "2021-11-15",
      status: "On Leave",
      leaveBalance: 12,
    },
  ];

  const departments = ["IT Department", "HR Department", "Operations"];
  const positions = {
    "IT Department": ["Senior Developer", "Junior Developer", "DevOps Engineer", "QA Engineer"],
    "HR Department": ["HR Manager", "HR Assistant", "Recruiter"],
    "Operations": ["Operations Lead", "Supervisor", "Coordinator", "Analyst"],
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department || !newEmployee.position) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Employee added successfully",
    });

    setNewEmployee({
      name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      salary: "",
      joinDate: "",
    });
    setIsAddingEmployee(false);
  };

  const handleUpdateEmployee = () => {
    toast({
      title: "Success",
      description: "Employee details updated successfully",
    });
    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Management</h2>
          <p className="text-gray-600">Manage employee information and details</p>
        </div>
        <Dialog open={isAddingEmployee} onOpenChange={setIsAddingEmployee}>
          <DialogTrigger asChild>
            <Button>Add New Employee</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={newEmployee.department}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value, position: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Position *</Label>
                <Select
                  value={newEmployee.position}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, position: value })}
                  disabled={!newEmployee.department}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {newEmployee.department &&
                      positions[newEmployee.department as keyof typeof positions]?.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  placeholder="Enter salary"
                />
              </div>
              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={newEmployee.joinDate}
                  onChange={(e) => setNewEmployee({ ...newEmployee, joinDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex space-x-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setIsAddingEmployee(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee}>Add Employee</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">142</p>
              <p className="text-sm text-gray-600">Total Employees</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">138</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">4</p>
              <p className="text-sm text-gray-600">On Leave</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-sm text-gray-600">New This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search employees by name, email, department, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory ({filteredEmployees.length} employees)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Position</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Leave Balance</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-600">ID: EMP{employee.id.toString().padStart(3, '0')}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm text-gray-900">{employee.email}</div>
                        <div className="text-sm text-gray-600">{employee.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getDepartmentColor(employee.department)}>
                        {employee.department}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{employee.position}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{employee.leaveBalance} days</td>
                    <td className="py-4 px-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEmployee(employee)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Employee Details</DialogTitle>
                          </DialogHeader>
                          {selectedEmployee && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Full Name</Label>
                                <Input defaultValue={selectedEmployee.name} />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input defaultValue={selectedEmployee.email} />
                              </div>
                              <div>
                                <Label>Phone</Label>
                                <Input defaultValue={selectedEmployee.phone} />
                              </div>
                              <div>
                                <Label>Department</Label>
                                <Select defaultValue={selectedEmployee.department}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {departments.map((dept) => (
                                      <SelectItem key={dept} value={dept}>
                                        {dept}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Position</Label>
                                <Input defaultValue={selectedEmployee.position} />
                              </div>
                              <div>
                                <Label>Salary</Label>
                                <Input defaultValue={selectedEmployee.salary} />
                              </div>
                              <div>
                                <Label>Status</Label>
                                <Select defaultValue={selectedEmployee.status}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="On Leave">On Leave</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Leave Balance</Label>
                                <Input defaultValue={selectedEmployee.leaveBalance.toString()} />
                              </div>
                            </div>
                          )}
                          <div className="flex space-x-2 justify-end mt-6">
                            <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateEmployee}>Update Employee</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
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

export default Employee;
