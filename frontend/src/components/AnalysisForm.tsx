import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import {
  GitHub,
  Visibility,
  VisibilityOff,
  Analytics,
} from '@mui/icons-material';
import { RepositoryRequest, AnalysisResponse, AnalysisStatus } from '@/types';
import { apiService } from '@/services/api';

interface AnalysisFormProps {
  onAnalysisComplete: (analysis: AnalysisResponse) => void;
  onFormSubmit?: (formData: { repo_url: string; github_token: string }) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalysisComplete, onFormSubmit, onLoadingChange }) => {
  const [formData, setFormData] = useState<RepositoryRequest>({
    repo_url: '',
    github_token: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);

  const handleInputChange = (field: keyof RepositoryRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.repo_url.trim()) {
      setError('GitHub repository URL is required');
      return false;
    }

    if (!formData.github_token.trim()) {
      setError('GitHub token is required');
      return false;
    }

    // Basic GitHub URL validation
    const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
    if (!githubUrlPattern.test(formData.repo_url.trim())) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    onLoadingChange?.(true);
    setError(null);

    try {
      const trimmedData = {
        repo_url: formData.repo_url.trim(),
        github_token: formData.github_token.trim(),
      };

      // Notify parent component about form submission
      if (onFormSubmit) {
        onFormSubmit(trimmedData);
      }

      // Start analysis (background) and poll for status + final result from cache
      const { analysis_id } = await apiService.analyzeRepository(trimmedData);
      let done = false;
      while (!done) {
        const status: AnalysisStatus = await apiService.getAnalysisStatus(analysis_id);
        if (status.status === 'failed') {
          setError(status.message || 'Analysis failed');
          done = true;
          break;
        }
        if (status.status === 'completed') {
          done = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 800));
      }
      if (!error) {
        try {
          const analysis = await apiService.getAnalysisResult(analysis_id);
          onAnalysisComplete(analysis);
        } catch (fetchErr: any) {
          setError(fetchErr.response?.data?.detail || fetchErr.message || 'Failed to fetch analysis result');
        }
      }
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Failed to analyze repository. Please check your inputs and try again.'
      );
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <GitHub sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Repository Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analyze your GitHub repository to detect technology stack, architecture, and complexity
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="GitHub Repository URL"
              placeholder="https://github.com/owner/repository"
              value={formData.repo_url}
              onChange={handleInputChange('repo_url')}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GitHub />
                  </InputAdornment>
                ),
              }}
              helperText="Enter the full GitHub repository URL"
            />

            <TextField
              fullWidth
              label="GitHub Personal Access Token"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              type={showToken ? 'text' : 'password'}
              value={formData.github_token}
              onChange={handleInputChange('github_token')}
              disabled={loading}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowToken(!showToken)}
                      edge="end"
                    >
                      {showToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Required for accessing private repositories and API rate limits"
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Analytics />}
              sx={{ px: 4, py: 1.5 }}
            >
              {loading ? 'Analyzing Repository...' : 'Analyze Repository'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'grey.700' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> Your GitHub token is used only for API access and is not stored. 
            Make sure it has repository read permissions. Learn more in{' '}
            <Link
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token"
              target="_blank"
              rel="noreferrer"
              color="primary"
              underline="hover"
            >
              GitHub docs
            </Link>.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnalysisForm;