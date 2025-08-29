# AGO CRM Frontend

Vue 3 frontend application for the AGO Care Management System.

## Features

- **Authentication**: JWT-based login/logout with token refresh
- **Participants Management**: Full CRUD operations for participants
- **Shifts Management**: Schedule and manage care shifts
- **Documents Management**: Upload and manage care documents
- **Care Plans**: Create and manage participant care plans
- **Dashboard**: Real-time stats and quick actions
- **Responsive Design**: Works on desktop and mobile

## API Integration

The frontend is designed to work with the GoFiber AGO CRM Backend. All API services are configured to connect to:
- **Base URL**: `http://localhost:8080/api/v1`
- **Health Check**: `http://localhost:8080/health`

### Authentication Flow

1. Login with credentials (email/password)
2. Receive JWT access token and refresh token
3. Access token automatically added to all API requests
4. Automatic token refresh on 401 responses
5. Fallback to logout on refresh failure

### API Services Available

- `authService` - Authentication operations
- `usersService` - User management
- `participantsService` - Participant CRUD operations
- `shiftsService` - Shift management with status updates
- `documentsService` - Document upload/download
- `carePlansService` - Care plan management
- `emergencyContactsService` - Emergency contact management
- `organizationService` - Organization settings
- `healthService` - Backend health checks

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Start your GoFiber backend** on port 8080

4. **Test API connection** (optional):
   - Open browser console
   - Import and run the API test:
   ```javascript
   import { testAPIConnection, logAPIStatus } from './src/utils/apiTest.js'
   await testAPIConnection()
   logAPIStatus()
   ```

## Backend Integration Notes

### Expected API Response Format

All API endpoints should return responses in this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // response data here
  },
  "error": null
}
```

### Pagination Format

For paginated endpoints, include pagination metadata:
```json
{
  "success": true,
  "data": {
    "participants": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 247,
      "totalPages": 13
    }
  }
}
```

### Authentication Headers

The frontend automatically includes JWT tokens in requests:
```
Authorization: Bearer <jwt_token>
```

### File Upload Format

Document uploads use `multipart/form-data` with these fields:
- `file` - The uploaded file
- `title` - Document title
- `description` - Document description
- `category` - Document category
- `participant_id` - Associated participant ID
- `expiry_date` - Document expiration date (optional)

## Fallback Behavior

If the backend is not available, the application provides:
- Mock authentication (kennedy@dasyin.com.au / password)
- Sample dashboard data
- Graceful error handling with user-friendly messages
- Loading states during API calls

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server
- **FontAwesome** - Icons
