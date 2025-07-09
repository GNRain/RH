// src/components/ApprovalChain/ApprovalChain.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  User,
  Users,
  Building,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
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

// Helper to get the right data for each role
const getApproverTypeDetails = (
  type: ApprovalStep['approverType'],
  t: (key: string) => string
) => {
  switch (type) {
    case 'EMPLOYEE':
      return { label: t('approval_chain.roles.you'), icon: User };
    case 'TEAM_LEADER':
      return { label: t('approval_chain.roles.team_leader'), icon: Users };
    case 'MANAGER':
      return { label: t('approval_chain.roles.manager'), icon: Users };
    case 'HR':
      return { label: t('approval_chain.roles.hr'), icon: Building };
    case 'DHR':
      return { label: t('approval_chain.roles.dhr'), icon: Building };
    default:
      return { label: 'Unknown', icon: User };
  }
};

// Helper to get the right icon and color for the status
const getStatusDetails = (status: ApprovalStep['status']) => {
  switch (status) {
    case 'ACCEPTED':
      return { icon: CheckCircle, className: 'status-accepted' };
    case 'DECLINED':
      return { icon: XCircle, className: 'status-declined' };
    case 'PENDING':
      return { icon: Clock, className: 'status-pending' };
    default:
      return { icon: Clock, className: 'status-pending' };
  }
};

export function ApprovalChain({ approvals }: ApprovalChainProps) {
  const { t } = useTranslation();

  if (!approvals || approvals.length === 0) {
    return null;
  }

  // Find the current step index
  const currentStepIndex = approvals.findIndex(
    (step) => step.status === 'PENDING'
  );
  const isFinalized = currentStepIndex === -1; // No pending steps means the request is finalized

  return (
    <div className="approval-chain-wrapper">
      <div className="approval-chain-container">
        {approvals.map((step, index) => {
          const { icon: RoleIcon, label: roleLabel } = getApproverTypeDetails(
            step.approverType,
            t
          );
          const { icon: StatusIcon, className: statusClassName } =
            getStatusDetails(step.status);
          const isCurrent = index === currentStepIndex;

          const approverName = step.approver
            ? `${step.approver.name} ${step.approver.familyName}`
            : roleLabel; // Fallback to role label if no specific approver

          return (
            <React.Fragment key={step.id}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'chain-step',
                        statusClassName,
                        isCurrent && 'chain-step-current',
                        isFinalized && 'chain-step-finalized'
                      )}
                    >
                      <div className="step-icon">
                        <StatusIcon />
                      </div>
                      <div className="step-details">
                        <span className="step-role">{roleLabel}</span>
                        <span className="step-approver-name">
                          <RoleIcon className="h-3 w-3" /> {approverName}
                        </span>
                        {step.status === 'DECLINED' && step.comment && (
                          <span className="step-comment text-sm text-destructive-foreground mt-1">
                            {t('approval_chain.comment_label')}: {step.comment}
                          </span>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  {step.comment && (
                    <TooltipContent>
                      <p>
                        {t('approval_chain.comment_label')}: {step.comment}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {index < approvals.length - 1 && (
                <div className="chain-connector">
                  <ChevronRight />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}