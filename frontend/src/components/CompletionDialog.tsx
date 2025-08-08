import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Launch,
  Build,
  GitHub,
  PlayArrow,
  Close,
  Celebration,
} from '@mui/icons-material';
import { DockerizationStatus, TaskStatus } from '@/types';

interface CompletionDialogProps {
  open: boolean;
  status: DockerizationStatus | null;
  onClose: () => void;
  onStartNew: () => void;
}

const CompletionDialog: React.FC<CompletionDialogProps> = ({
  open,
  status,
  onClose,
  onStartNew,
}) => {
  if (!status) return null;

  const isSuccess = status.status === TaskStatus.COMPLETED;

  const handleOpenPR = () => {
    if (status.pr_url) {
      window.open(status.pr_url, '_blank');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'visible',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {isSuccess ? (
            <>
              <Celebration sx={{ fontSize: 48, color: 'success.main' }} />
              <Typography variant="h4" component="h2" color="success.main">
                🎉 Dockerization Complete!
              </Typography>
            </>
          ) : (
            <>
              <Close sx={{ fontSize: 48, color: 'error.main' }} />
              <Typography variant="h4" component="h2" color="error.main">
                ❌ Dockerization Failed
              </Typography>
            </>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {isSuccess ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body1">
                Your repository has been successfully dockerized! A pull request has been created with all the necessary files.
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="success" />
              What was created:
            </Typography>

            <List dense sx={{ mb: 3 }}>
              <ListItem>
                <ListItemIcon>
                  <Build color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Multi-stage Dockerfile"
                  secondary="Optimized for production with security best practices"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Build color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Docker Compose Configuration"
                  secondary="Complete multi-service setup with database and caching"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <GitHub color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="GitHub Actions Workflow"
                  secondary="Automated CI/CD pipeline for testing and deployment"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Launch color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Pull Request"
                  secondary="Comprehensive documentation and setup instructions"
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                🚀 Ready to Deploy!
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Review the pull request and merge to start using your new Docker setup.
              </Typography>
              
              {status.pr_url && (
                <Chip
                  icon={<Launch />}
                  label="View Pull Request"
                  color="primary"
                  clickable
                  onClick={handleOpenPR}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Box>
        ) : (
          <Box>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body1">
                {status.message}
              </Typography>
            </Alert>

            <Typography variant="body2" color="text.secondary">
              Don't worry! You can try again with the same or different repository. 
              Common issues include invalid GitHub tokens or repository access permissions.
            </Typography>
          </Box>
        )}

        {/* Status Details */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'grey.700' }}>
          <Typography variant="caption" color="text.secondary" component="div">
            <strong>Task ID:</strong> {status.task_id}
            <br />
            <strong>Completed:</strong> {new Date(status.timestamp).toLocaleString()}
            <br />
            <strong>Final Status:</strong>{' '}
            <Chip
              label={status.status.replace('_', ' ').toUpperCase()}
              size="small"
              color={isSuccess ? 'success' : 'error'}
            />
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button
          onClick={onClose}
          color="inherit"
        >
          Close
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {status.pr_url && (
            <Button
              variant="outlined"
              startIcon={<Launch />}
              onClick={handleOpenPR}
            >
              View PR
            </Button>
          )}
          
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={onStartNew}
          >
            Analyze Another Repository
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CompletionDialog;