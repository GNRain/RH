// src/components/ApprovalChain/ApprovalChain.tsx

import React from 'react';
import { VscAccount, VscArrowRight, VscCheck, VscClose, VscEllipsis, VscOrganization } from 'react-icons/vsc';
import './ApprovalChain.css';

// Define the types to match our backend response
type Approver = {
  name: string;
  familyName: string;
} | null;

type ApprovalStep = {
  id: string;
  approver: Approver;
  approverType: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  comment: string | null;
  step: number;
};

interface ApprovalChainProps {
  approvals: ApprovalStep[];
}

// A helper to format the role names nicely
const formatApproverType = (type: ApprovalStep['approverType']) => {
  switch (type) {
    case 'EMPLOYEE': return 'You';
    case 'TEAM_LEADER': return 'Team Leader';
    case 'MANAGER': return 'Manager';
    case 'HR': return 'Human Resources';
    case 'DHR': return 'Director of HR';
    default: return 'Unknown';
  }
};

// A helper to get the right icon for the status
const getStatusIcon = (status: ApprovalStep['status']) => {
  switch (status) {
    case 'ACCEPTED': return <VscCheck className="icon-accepted" />;
    case 'DECLINED': return <VscClose className="icon-declined" />;
    case 'PENDING': return <VscEllipsis className="icon-pending" />;
    default: return null;
  }
};

export function ApprovalChain({ approvals }: ApprovalChainProps) {
  if (!approvals || approvals.length === 0) {
    return null;
  }

  // Add the initial "You" step for visualization
  const fullChain: ApprovalStep[] = [
    { 
      id: 'start',
      approver: null,
      approverType: 'EMPLOYEE',
      status: 'ACCEPTED',
      comment: 'Request Submitted',
      step: 0,
    },
    ...approvals,
  ];

  return (
    <div className="approval-chain-container">
      {fullChain.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={`chain-step ${step.status.toLowerCase()}`}>
            <div className="step-icon">
              {getStatusIcon(step.status)}
            </div>
            <div className="step-details">
              <span className="step-role">{formatApproverType(step.approverType)}</span>
              {step.approver && (
                <span className="step-approver-name">
                  <VscAccount /> {step.approver.name} {step.approver.familyName}
                </span>
              )}
              {step.approverType === 'HR' && !step.approver && (
                 <span className="step-approver-name"><VscOrganization /> HR Department</span>
              )}
              {step.status === 'DECLINED' && step.comment && (
                <span className="step-comment">Reason: {step.comment}</span>
              )}
            </div>
          </div>
          {index < fullChain.length - 1 && (
            <div className="chain-connector">
              <VscArrowRight />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}