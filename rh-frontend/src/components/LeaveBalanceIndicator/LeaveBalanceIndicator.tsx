// src/components/LeaveBalanceIndicator/LeaveBalanceIndicator.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { VscCalendar } from 'react-icons/vsc';
import './LeaveBalanceIndicator.css';

const API_URL = 'http://localhost:3000';

interface LeaveBalance {
  totalEarnedLeave: number;
  daysTaken: number;
  availableBalance: number;
}

export function LeaveBalanceIndicator() {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_URL}/leave/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBalance(response.data);
      } catch (error) {
        console.error('Failed to fetch leave balance', error);
      }
    };

    fetchBalance();
  }, []);

  if (!balance) {
    return null; // Don't render anything until the balance is fetched
  }

  return (
    <div className="leave-balance-indicator" title={`You have ${balance.availableBalance} days of leave remaining.`}>
      <VscCalendar />
      <span>{balance.availableBalance} days</span>
    </div>
  );
}