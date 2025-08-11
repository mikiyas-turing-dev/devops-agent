import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider,
  Button,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Code,
  Architecture,
  Storage,
  Speed,
  Category,
  CheckCircle,
  Build,
} from '@mui/icons-material';
import { AnalysisResponse } from '@/types';

interface AnalysisResultsProps {
  analysis: AnalysisResponse;
  onStartDockerization: () => void;
  loading?: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  onStartDockerization,
  loading = false,
}) => {
  const { project_overview, technical_architecture } = analysis;
  const { technology_stack, system_architecture } = technical_architecture;

  const getComplexityColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score <= 3) return 'success';
    if (score <= 7) return 'warning';
    return 'error';
  };

  const getComplexityLabel = (score: number): string => {
    if (score <= 3) return 'Simple';
    if (score <= 7) return 'Moderate';
    return 'Complex';
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
      {/* Project Overview Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            📊 Project Analysis Results
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" color="primary" gutterBottom>
                {project_overview.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {project_overview.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Purpose
                </Typography>
                <Typography variant="body2">
                  {project_overview.purpose}
                </Typography>
              </Box>

              {project_overview.domain && (
                <Chip
                  icon={<Category />}
                  label={project_overview.domain}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', border: '1px solid', borderColor: 'grey.700' }}>
                <Typography variant="h6" gutterBottom>
                  Complexity Score
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(project_overview.complexity_score / 10) * 100}
                    color={getComplexityColor(project_overview.complexity_score)}
                    sx={{ width: 100, height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="h4" color={`${getComplexityColor(project_overview.complexity_score)}.main`}>
                  {project_overview.complexity_score}/10
                </Typography>
                <Chip
                  label={getComplexityLabel(project_overview.complexity_score)}
                  color={getComplexityColor(project_overview.complexity_score)}
                  size="small"
                />
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Technical Architecture Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Architecture />
            Technical Architecture
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Technology Stack */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code />
                  Technology Stack
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon><Speed /></ListItemIcon>
                    <ListItemText
                      primary="Language"
                      secondary={technology_stack.language}
                    />
                  </ListItem>
                  
                  {technology_stack.framework && (
                    <ListItem>
                      <ListItemIcon><Category /></ListItemIcon>
                      <ListItemText
                        primary="Framework"
                        secondary={technology_stack.framework}
                      />
                    </ListItem>
                  )}
                  
                  {technology_stack.database && (
                    <ListItem>
                      <ListItemIcon><Storage /></ListItemIcon>
                      <ListItemText
                        primary="Database"
                        secondary={technology_stack.database}
                      />
                    </ListItem>
                  )}
                  
                  <ListItem>
                    <ListItemIcon><Speed /></ListItemIcon>
                    <ListItemText
                      primary="Runtime"
                      secondary={technology_stack.runtime}
                    />
                  </ListItem>
                  
                  {technology_stack.package_manager && (
                    <ListItem>
                      <ListItemIcon><Category /></ListItemIcon>
                      <ListItemText
                        primary="Package Manager"
                        secondary={technology_stack.package_manager}
                      />
                    </ListItem>
                  )}
                </List>

                {technology_stack.dependencies.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Dependencies
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {technology_stack.dependencies.slice(0, 8).map((dep, index) => (
                        <Chip
                          key={index}
                          label={dep}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* System Architecture */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Architecture />
                  System Architecture
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Architecture Type
                  </Typography>
                  <Chip
                    label={system_architecture.architecture_type}
                    color="primary"
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {system_architecture.patterns.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Design Patterns
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {system_architecture.patterns.map((pattern, index) => (
                        <Chip
                          key={index}
                          label={pattern}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {system_architecture.key_features.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Features
                    </Typography>
                    {system_architecture.key_features.map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CheckCircle color="success" sx={{ fontSize: 16 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Card */}
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Ready to Dockerize & Deploy?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Generate Dockerfiles, CI/CD, and Kubernetes manifests, then open a pull request automatically.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<Build />}
            onClick={onStartDockerization}
            disabled={loading}
            sx={{ px: 4, py: 1.5 }}
          >
            {loading ? 'Starting Automation...' : 'Dockerize & Generate K8s'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalysisResults;