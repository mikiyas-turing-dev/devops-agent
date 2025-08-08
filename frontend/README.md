# DevOps Agent Frontend

A modern React frontend built with Material-UI for the GitHub Repository Analysis and Dockerization tool.

## Features

- **Repository Analysis Form**: Input GitHub URL and token for repository analysis
- **Analysis Results Display**: Comprehensive view of technology stack and architecture
- **Real-time Progress Tracking**: Live updates during dockerization process
- **Completion Notifications**: Success/failure popups with PR links
- **Responsive Design**: Works on desktop and mobile devices
- **Material-UI Components**: Modern, accessible UI components

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── AnalysisForm.tsx     # GitHub URL/token input form
│   │   ├── AnalysisResults.tsx  # Display analysis results
│   │   ├── DockerizationProgress.tsx # Real-time progress tracker
│   │   └── CompletionDialog.tsx # Success/failure popup
│   ├── services/            # API services
│   │   └── api.ts              # Backend API integration
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts            # Shared interfaces
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
└── vite.config.ts           # Vite configuration
```

## User Flow

1. **Analysis Form**: User enters GitHub repository URL and personal access token
2. **Repository Analysis**: Backend analyzes the repository and returns:
   - Project overview (name, description, complexity)
   - Technology stack (language, framework, database)
   - System architecture (patterns, features)
3. **Results Display**: User reviews analysis and clicks "Start Dockerization"
4. **Progress Tracking**: Real-time progress with step-by-step updates:
   - Analyzing Repository
   - Creating Branch
   - Creating Docker Files
   - Setting up CI/CD
   - Creating Pull Request
5. **Completion Popup**: Success dialog with:
   - Summary of created files
   - Link to pull request
   - Option to analyze another repository

## Component Details

### AnalysisForm
- Input validation for GitHub URLs and tokens
- Secure token input with show/hide toggle
- Loading states and error handling
- Form submission to backend API

### AnalysisResults
- Comprehensive display of analysis data
- Technology stack visualization
- System architecture overview
- Complexity scoring with visual indicators
- Action button to start dockerization

### DockerizationProgress
- Real-time polling of task status
- Step-by-step progress visualization
- Progress bar with percentage
- Error handling for failed tasks

### CompletionDialog
- Success/failure modal dialog
- Summary of created Docker files
- Direct link to GitHub pull request
- Option to start analyzing another repository

## API Integration

The frontend communicates with the FastAPI backend through:

- `POST /analyze` - Analyze repository
- `POST /dockerize` - Start dockerization process
- `GET /status/{task_id}` - Get dockerization status
- `GET /health` - Health check

## Technology Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - UI component library
- **Vite** - Build tool and development server
- **Axios** - HTTP client for API calls
- **Notistack** - Toast notifications

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

MIT License