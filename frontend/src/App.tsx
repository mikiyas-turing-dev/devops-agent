import { useCallback, useEffect, useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Box,
  Fab,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Chip,
  Alert,
} from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { GitHub, Refresh, ExpandMore, CheckCircle, Error } from '@mui/icons-material';

import AnalysisForm from './components/AnalysisForm';
import AnalysisResults from './components/AnalysisResults';
import DockerizationProgress from './components/DockerizationProgress';
import CompletionDialog from './components/CompletionDialog';
import { AnalysisResponse, DockerizationStatus } from './types';
import { apiService } from './services/api';
import { theme } from './theme';
import ThoughtProcess, { ThoughtStep } from './components/ThoughtProcess';

function App() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [dockerizationTaskId, setDockerizationTaskId] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<DockerizationStatus | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAnalysisAccordion, setShowAnalysisAccordion] = useState(false);
  const [analysisActiveStep, setAnalysisActiveStep] = useState(0);
  const [showDockerAccordion, setShowDockerAccordion] = useState(false);
  const [dockerStatus, setDockerStatus] = useState<DockerizationStatus | null>(null);

  const handleAnalysisComplete = (analysisResult: AnalysisResponse) => {
    setAnalysis(analysisResult);
    // Auto-collapse analysis process when done
    setShowAnalysisAccordion(false);
  };

  const handleStartDockerization = async () => {
    if (!analysis) return;

    try {
      const response = await apiService.startDockerization({
        repo_url: repoUrl,
        github_token: githubToken,
        analysis_id: analysis.analysis_id,
      });

      setDockerizationTaskId(response.task_id);
      setShowDockerAccordion(true);
    } catch (error) {
      console.error('Failed to start dockerization:', error);
      // Handle error (you might want to show a snackbar)
    }
  };

  const handleDockerizationComplete = useCallback((status: DockerizationStatus) => {
    setCompletionStatus(status);
    setShowCompletionDialog(true);
    setShowDockerAccordion(false);
    setDockerStatus(status);
  }, []);

  const handleStartNew = () => {
    setAnalysis(null);
    setDockerizationTaskId(null);
    setCompletionStatus(null);
    setShowCompletionDialog(false);
    setRepoUrl('');
    setGithubToken('');
    setShowAnalysisAccordion(false);
    setShowDockerAccordion(false);
    setAnalysisActiveStep(0);
    setAnalysisLoading(false);
  };

  const handleCloseCompletionDialog = () => {
    setShowCompletionDialog(false);
  };

  // Store form data when analysis is initiated
  const handleFormSubmit = (formData: { repo_url: string; github_token: string }) => {
    setRepoUrl(formData.repo_url);
    setGithubToken(formData.github_token);
  };

  // Simulate analysis step progression to keep UI interactive
  const analysisSteps: ThoughtStep[] = [
    { key: 'init', label: 'Initialize AI agent' },
    { key: 'parse', label: 'Parse repository URL' },
    { key: 'meta', label: 'Fetch repository metadata' },
    { key: 'scan', label: 'Scan files and directories' },
    { key: 'stack', label: 'Detect technology stack' },
    { key: 'arch', label: 'Infer architecture and patterns' },
    { key: 'score', label: 'Compute complexity metrics' },
    { key: 'summ', label: 'Generate analysis summary' },
  ];

  useEffect(() => {
    if (!analysisLoading) return;
    setShowAnalysisAccordion(true);
    setAnalysisActiveStep(0);
    const id = setInterval(() => {
      setAnalysisActiveStep((prev) => (prev + 1) % analysisSteps.length);
    }, 900);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisLoading]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>

          {/* Main Content */}
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <AnalysisForm
              onAnalysisComplete={handleAnalysisComplete}
              onFormSubmit={handleFormSubmit}
              onLoadingChange={setAnalysisLoading}
            />

            {/* Analysis Thought Process */}
            <Box sx={{ mt: 3 }}>
              <ThoughtProcess
                title="Repository Analysis"
                steps={analysisSteps}
                activeKey={analysisLoading ? analysisSteps[analysisActiveStep]?.key : null}
                status={analysis ? 'completed' : analysisLoading ? 'in_progress' : 'idle'}
                progress={analysisLoading ? ((analysisActiveStep + 1) / analysisSteps.length) * 100 : undefined}
                message={analysisLoading ? 'Analyzing repository...' : undefined}
                expanded={showAnalysisAccordion || analysisLoading}
                onExpandedChange={setShowAnalysisAccordion}
              />
            </Box>

            {/* Analysis Results */}
            {analysis && (
              <Box sx={{ mt: 3 }}>
                <AnalysisResults analysis={analysis} onStartDockerization={handleStartDockerization} />
              </Box>
            )}

            {/* Dockerization Thought Process */}
            {dockerizationTaskId && (
              <Box sx={{ mt: 3 }}>
                <ThoughtProcess
                  title="Dockerization"
                  steps={[
                    { key: 'analyzing', label: 'Analyzing Repository' },
                    { key: 'creating_branch', label: 'Creating Branch' },
                    { key: 'dockerizing', label: 'Creating Docker Files' },
                    { key: 'creating_workflow', label: 'Setting up CI/CD' },
                    { key: 'creating_pr', label: 'Creating Pull Request' },
                  ]}
                  activeKey={dockerStatus?.status || undefined}
                  status={
                    dockerStatus
                      ? dockerStatus.status === 'failed'
                        ? 'failed'
                        : dockerStatus.status === 'completed'
                        ? 'completed'
                        : 'in_progress'
                      : 'in_progress'
                  }
                  progress={dockerStatus?.progress}
                  message={dockerStatus?.message}
                  expanded={showDockerAccordion}
                  onExpandedChange={setShowDockerAccordion}
                />
                <Box sx={{ mt: 2 }}>
                  <DockerizationProgress
                    taskId={dockerizationTaskId}
                    onComplete={handleDockerizationComplete}
                  />
                </Box>
              </Box>
            )}

            {(completionStatus || analysis) && (
              <Tooltip title="Start Over">
                <Fab
                  color="primary"
                  aria-label="start over"
                  sx={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                  }}
                  onClick={handleStartNew}
                >
                  <Refresh />
                </Fab>
              </Tooltip>
            )}
          </Container>

          {/* Completion Dialog */}
          <CompletionDialog
            open={showCompletionDialog}
            status={completionStatus}
            onClose={handleCloseCompletionDialog}
            onStartNew={handleStartNew}
          />
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;