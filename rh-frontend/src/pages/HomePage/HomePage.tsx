import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { VscAccount, VscBriefcase, VscChecklist, VscOrganization, VscGraph, VscGraphLine, VscPieChart, VscPerson } from 'react-icons/vsc';
import { jwtDecode } from 'jwt-decode';
import './HomePage.css';

const API_URL = 'http://localhost:3000';
const PIE_CHART_COLORS = ['#5227FF', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ffbb28'];

const DashboardWidget = ({ icon, title, value, children }: any) => ( <div className="dashboard-widget"><div className="widget-header"><div className="widget-icon">{icon}</div><span className="widget-title">{title}</span></div><div className="widget-content">{value !== undefined && <p className="widget-value">{value}</p>}{children}</div></div>);
const WelcomeMessage = () => { const { t } = useTranslation(); return (<div className="homepage-container"><h1>{t('dashboard.welcome')}</h1><p>{t('dashboard.welcome_subtitle')}</p></div>); };
interface DecodedToken { role: 'HR' | 'DHR'; }

export function HomePage() {
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
            const response = await axios.get(`${API_URL}/dashboard/hr`, { headers: { Authorization: `Bearer ${token}` }});
            setData(response.data);
          } catch (error) { console.error("Failed to fetch HR dashboard data", error); } 
          finally { setLoading(false); }
        };
        fetchData();
      } else { setLoading(false); }
    } catch (error) { console.error("Invalid token", error); setLoading(false); }
  }, []);

  if (loading) return <p style={{ color: 'white', textAlign: 'center' }}>{t('dashboard.loading')}</p>;
  if (!isHrRole) return <WelcomeMessage />;
  if (!data) return <p style={{ color: 'red' }}>{t('dashboard.error')}</p>;

  return (
    <div className="homepage-container">
      <h1>{t('dashboard.title')}</h1>
      {/* --- FIX: KPI grid now fills the width --- */}
      <div className="dashboard-grid kpi-grid">
        <DashboardWidget icon={<VscOrganization />} title={t('dashboard.kpi.total_employees')} value={data.totalActiveEmployees} />
        <DashboardWidget icon={<VscChecklist />} title={t('dashboard.kpi.pending_leaves')} value={data.pendingLeaveRequests} />
        <DashboardWidget icon={<VscAccount />} title={t('dashboard.kpi.new_hires')} value={data.newHiresThisMonth} />
        <DashboardWidget icon={<VscBriefcase />} title={t('dashboard.kpi.avg_tenure')} value={data.averageTenureYears} />
      </div>

      {/* --- FIX: Reorganized main charts into a 3-column grid --- */}
      <div className="dashboard-grid main-chart-grid">
        <DashboardWidget icon={<VscGraphLine />} title={t('dashboard.charts.headcount_trend')}>
            <ResponsiveContainer width="100%" height={250}><LineChart data={data.headcountTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#374151"/><XAxis dataKey="name" stroke="#9ca3af"/><YAxis stroke="#9ca3af" domain={[0, 'dataMax + 2']}/><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/><Line type="monotone" dataKey="count" name="Employees" stroke="#8884d8" activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer>
        </DashboardWidget>
        <DashboardWidget icon={<VscGraph />} title={t('dashboard.charts.dept_employees')}>
            <ResponsiveContainer width="100%" height={250}><BarChart data={data.employeesByDept} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="name" stroke="#9ca3af"/><YAxis allowDecimals={false} stroke="#9ca3af"/><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/><Bar dataKey="count" name="Employees" fill="#8884d8" /></BarChart></ResponsiveContainer>
        </DashboardWidget>
        <DashboardWidget icon={<VscChecklist />} title={t('dashboard.charts.leave_by_dept')}>
            <ResponsiveContainer width="100%" height={250}><BarChart data={data.leaveDaysByDept} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="name" stroke="#9ca3af"/><YAxis allowDecimals={false} stroke="#9ca3af"/><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/><Bar dataKey="count" name="Days" fill="#82ca9d" /></BarChart></ResponsiveContainer>
        </DashboardWidget>
      </div>

      {/* --- Secondary Charts --- */}
      <div className="dashboard-grid secondary-chart-grid">
        <DashboardWidget icon={<VscPieChart />} title={t('dashboard.charts.leave_types')}>
            <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={data.leaveTypeBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{data.leaveTypeBreakdown.map((_: any, i: number) => <Cell key={`cell-${i}`} fill={PIE_CHART_COLORS[i % PIE_CHART_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/><Legend /></PieChart></ResponsiveContainer>
        </DashboardWidget>
        <DashboardWidget icon={<VscPerson />} title={t('dashboard.charts.gender_ratio')}>
            <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={data.genderRatio} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>{data.genderRatio.map((_: any, i: number) => <Cell key={`cell-${i}`} fill={PIE_CHART_COLORS[i % PIE_CHART_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/><Legend /></PieChart></ResponsiveContainer>
        </DashboardWidget>
        <DashboardWidget icon={<VscGraph />} title={t('dashboard.charts.age_distribution')}>
            <ResponsiveContainer width="100%" height={250}><BarChart data={data.ageDistribution} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="name" stroke="#9ca3af"/><YAxis allowDecimals={false} stroke="#9ca3af"/><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}/><Bar dataKey="count" name="Employees" fill="#ffc658" /></BarChart></ResponsiveContainer>
        </DashboardWidget>
      </div>
    </div>
  );
}