import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Chip,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

export interface ThoughtStep {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ThoughtProcessProps {
  title: string;
  steps: ThoughtStep[];
  activeKey?: string | null;
  status: 'idle' | 'in_progress' | 'completed' | 'failed';
  progress?: number; // 0-100
  message?: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const ThoughtProcess: React.FC<ThoughtProcessProps> = ({
  title,
  steps,
  activeKey,
  status,
  progress,
  message,
  expanded,
  onExpandedChange,
}) => {
  const activeIndex = activeKey ? steps.findIndex((s) => s.key === activeKey) : -1;

  return (
    <Accordion expanded={expanded} onChange={(_, e) => onExpandedChange(e)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        <Box sx={{ ml: 'auto' }}>
          <Chip
            size="small"
            label={status === 'completed' ? 'Completed' : status === 'failed' ? 'Failed' : status === 'in_progress' ? 'In Progress' : 'Ready'}
            color={status === 'completed' ? 'success' : status === 'failed' ? 'error' : status === 'in_progress' ? 'primary' : 'default'}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stepper activeStep={activeIndex >= 0 ? activeIndex : 0} orientation="vertical">
          {steps.map((step) => (
            <Step key={step.key} completed={status === 'completed' || (activeIndex > steps.findIndex((s) => s.key === step.key))}>
              <StepLabel icon={step.icon}>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {(typeof progress === 'number' || message) && (
          <Box sx={{ mt: 2 }}>
            {typeof progress === 'number' && (
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
            )}
            {message && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {message}
              </Typography>
            )}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ThoughtProcess;


