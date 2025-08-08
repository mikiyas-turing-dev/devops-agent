import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Analytics,
  CreateNewFolder,
  Build,
  GitHub,
  MergeType,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { DockerizationStatus, TaskStatus } from '@/types';
import { apiService } from '@/services/api';

interface DockerizationProgressProps {
  taskId: string;
  onComplete: (status: DockerizationStatus) => void;
}

const DockerizationProgress: React.FC<DockerizationProgressProps> = ({
  taskId,
  onComplete,
}) => {
  const [status, setStatus] = useState<DockerizationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { key: TaskStatus.ANALYZING, label: 'Analyzing Repository', icon: <Analytics /> },
    { key: TaskStatus.CREATING_BRANCH, label: 'Creating Branch', icon: <CreateNewFolder /> },
    { key: TaskStatus.DOCKERIZING, label: 'Creating Docker Files', icon: <Build /> },
    { key: TaskStatus.CREATING_WORKFLOW, label: 'Setting up CI/CD', icon: <GitHub /> },
    { key: TaskStatus.CREATING_PR, label: 'Creating Pull Request', icon: <MergeType /> },
  ];

  const getCurrentStepIndex = (currentStatus: TaskStatus): number => {
    const stepIndex = steps.findIndex(step => step.key === currentStatus);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const getStepStatus = (stepIndex: number, currentStatus: TaskStatus, currentStepIndex: number) => {
    if (currentStatus === TaskStatus.COMPLETED) return 'completed';
    if (currentStatus === TaskStatus.FAILED) return 'error';
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'inactive';
  };

  useEffect(() => {
    let intervalId: number;

    const pollStatus = async () => {
      try {
        const statusData = await apiService.getDockerizationStatus(taskId);
        setStatus(statusData);

        if (statusData.status === TaskStatus.COMPLETED || statusData.status === TaskStatus.FAILED) {
          clearInterval(intervalId);
          onComplete(statusData);
          return;
        }

        // Safety net: if PR URL exists or progress is 100, consider it completed
        if (statusData.pr_url || statusData.progress >= 100) {
          clearInterval(intervalId);
          onComplete({
            ...statusData,
            status: TaskStatus.COMPLETED,
            progress: 100,
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch status:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to fetch status');
        clearInterval(intervalId);
      }
    };

    // Initial fetch
    pollStatus();

    // Poll every 2 seconds
    intervalId = setInterval(pollStatus, 2000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, onComplete]);

  if (error) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Dockerization Failed
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={64} sx={{ mb: 2 }} />
          <Typography variant="h6">
            Initializing Dockerization...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const currentStepIndex = getCurrentStepIndex(status.status);
  const isCompleted = status.status === TaskStatus.COMPLETED;
  const isFailed = status.status === TaskStatus.FAILED;

  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', mt: 2 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'left', mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            🐳 Dockerization Status
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {status.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={status.progress}
            color={isFailed ? 'error' : isCompleted ? 'success' : 'primary'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Status Message */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Chip
            label={status.status.replace('_', ' ').toUpperCase()}
            color={isFailed ? 'error' : isCompleted ? 'success' : 'primary'}
            sx={{ mb: 2 }}
          />
          <Typography variant="body1">
            {status.message}
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={currentStepIndex} orientation="vertical" sx={{ mt: 3 }}>
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(index, status.status, currentStepIndex);
            
            return (
              <Step key={step.key} completed={stepStatus === 'completed'}>
                <StepLabel
                  error={stepStatus === 'error'}
                  icon={
                    stepStatus === 'completed' ? (
                      <CheckCircle color="success" />
                    ) : stepStatus === 'error' ? (
                      <Error color="error" />
                    ) : stepStatus === 'active' ? (
                      <CircularProgress size={24} />
                    ) : (
                      step.icon
                    )
                  }
                >
                  <Typography
                    variant="body1"
                    color={
                      stepStatus === 'completed'
                        ? 'success.main'
                        : stepStatus === 'error'
                        ? 'error.main'
                        : stepStatus === 'active'
                        ? 'primary.main'
                        : 'text.secondary'
                    }
                  >
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {/* Timestamp */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'grey.700' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Started:</strong> {new Date(status.timestamp).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DockerizationProgress;