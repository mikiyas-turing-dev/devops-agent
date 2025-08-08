import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#a78bfa',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff', // White text
      secondary: '#cccccc', // Light grey for secondary text
    },
    grey: {
      50: '#4a4a4a',
      100: '#5a5a5a',
      200: '#6a6a6a',
      300: '#7a7a7a',
      400: '#8a8a8a',
      500: '#9a9a9a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    allVariants: {
      color: '#ffffff',
    },
    h1: { fontWeight: 700, letterSpacing: 0.2 },
    h2: { fontWeight: 700, letterSpacing: 0.2 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #121212 0%, #0e0e0e 100%)',
          backgroundAttachment: 'fixed',
        },
        'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, textarea:-webkit-autofill, select:-webkit-autofill': {
          WebkitTextFillColor: '#ffffff',
          WebkitBoxShadow: '0 0 0px 1000px #1e1e1e inset',
          transition: 'background-color 9999s ease-in-out 0s',
          caretColor: '#ffffff',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%'
        },
        '#root': {
          margin: 0,
          padding: 0,
          width: '100%',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(20,20,20,0.9)',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
        contained: {
          backgroundColor: '#90caf9',
          color: '#0b0b0b',
          boxShadow: '0 8px 20px rgba(144,202,249,0.18)',
          '&:hover': {
            backgroundColor: '#64b5f6',
            boxShadow: '0 10px 24px rgba(144,202,249,0.28)'
          },
          '&:disabled': {
            backgroundColor: '#666666',
            color: '#999999',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(40,40,40,0.6)',
          color: '#ffffff',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 16px 36px rgba(0,0,0,0.45)'
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#666666',
            },
            '&:hover fieldset': {
              borderColor: '#90caf9',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#90caf9',
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0px 1000px #1e1e1e inset',
              WebkitTextFillColor: '#ffffff',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#cccccc',
            '&.Mui-focused': {
              color: '#90caf9',
            },
          },
          '& .MuiInputBase-input': {
            color: '#ffffff',
          },
          '& .MuiFormHelperText-root': {
            color: '#999999',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#4a4a4a',
          color: '#ffffff',
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#90caf9',
            color: '#0b0b0b',
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: '#a78bfa',
            color: '#0b0b0b',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#4a4a4a',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#90caf9',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)'
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: '#4a4a4a',
          color: '#ffffff',
          '& .MuiAlert-icon': {
            color: '#90caf9',
          },
        },
        standardSuccess: {
          backgroundColor: '#2e7d32',
          color: '#ffffff',
        },
        standardError: {
          backgroundColor: '#d32f2f',
          color: '#ffffff',
        },
        standardWarning: {
          backgroundColor: '#f57c00',
          color: '#ffffff',
        },
      },
    },
  },
})