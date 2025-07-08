import React, { useState, useEffect } from 'react';
import apiClient from '../api'; 
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Users, Clock, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jwtDecode } from 'jwt-decode';

const PIE_CHART_COLORS = ['#5227FF', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ffbb28'];

interface DecodedToken { role: 'HR' | 'DHR'; }

const WelcomeMessage = () => { const { t } = useTranslation(); return (<div className="space-y-6"><div><h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('dashboard.welcome')}</h2><p className="text-gray-600 dark:text-gray-400">{t('dashboard.welcome_subtitle')}</p></div></div>); };

const Dashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHrRole, setIsHrRole] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const userIsHr = decoded.role === 'HR' || decoded.role === 'DHR';
      setIsHrRole(userIsHr);
      if (userIsHr) {
        const fetchData = async () => {
          try {
            const response = await apiClient.get('/dashboard/hr');
            setData(response.data);
          } catch (error) { console.error("Failed to fetch HR dashboard data", error); }
          finally { setLoading(false); }
        };
        fetchData();
      } else { setLoading(false); }
    } catch (error) { console.error("Invalid token", error); setLoading(false); }
  }, []);

  if (loading) return <p className="text-white text-center">{t('dashboard.loading')}</p>;
  if (!isHrRole) return <WelcomeMessage />;
  if (!data) return <p className="text-red-500">{t('dashboard.error')}</p>;

  const stats = [
    {
      title: t('dashboard.kpi.total_employees'),
      value: data.totalActiveEmployees,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      title: t('dashboard.kpi.pending_leaves'),
      value: data.pendingLeaveRequests,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
    },
    {
      title: t('dashboard.kpi.new_hires'),
      value: data.newHiresThisMonth,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/50",
    },
    {
      title: t('dashboard.kpi.avg_tenure'),
      value: data.averageTenureYears,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('dashboard.title')}</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">{t('dashboard.charts.dept_employees')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.employeesByDept || []} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="name" stroke="#9ca3af"/><YAxis allowDecimals={false} stroke="#9ca3af"/><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/><Bar dataKey="count" name="Employees" fill="#8884d8" /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Leave Requests */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">{t('dashboard.charts.leave_by_dept')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.leaveDaysByDept || []} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="name" stroke="#9ca3af"/><YAxis allowDecimals={false} stroke="#9ca3af"/><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/><Bar dataKey="count" name="Days" fill="#82ca9d" /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Headcount Trend */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">{t('dashboard.charts.headcount_trend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.headcountTrend || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#374151"/><XAxis dataKey="name" stroke="#9ca3af"/><YAxis stroke="#9ca3af" domain={[0, 'dataMax + 2']}/><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/><Line type="monotone" dataKey="count" name="Employees" stroke="#8884d8" activeDot={{ r: 8 }} /></LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Type Breakdown */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">{t('dashboard.charts.leave_types')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.leaveTypeBreakdown || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {(data.leaveTypeBreakdown || []).map((_: any, i: number) => <Cell key={`cell-${i}`} fill={PIE_CHART_COLORS[i % PIE_CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Ratio */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">{t('dashboard.charts.gender_ratio')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.genderRatio || []} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                  {(data.genderRatio || []).map((_: any, i: number) => <Cell key={`cell-${i}`} fill={PIE_CHART_COLORS[i % PIE_CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">{t('dashboard.charts.age_distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.ageDistribution || []} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="name" stroke="#9ca3af"/><YAxis allowDecimals={false} stroke="#9ca3af"/><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/><Bar dataKey="count" name="Employees" fill="#ffc658" /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;