# Online Poll System

A modern, full-stack real-time polling platform built with React, Redux, TypeScript, and Django REST Framework. Create, share, and participate in polls with live results and interactive visualizations.

[PollSupaa Demo]([https://pages.github.com/](https://poll-system-frontend.vercel.app/))

## Features

### Core Functionality
- **Real-time Polling** - Create polls with multiple options (2-10 choices)
- **Live Results** - View results instantly as votes are cast
- **Interactive Charts** - Bar charts and pie charts with Recharts
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Duplicate Vote Prevention** - IP-based voting restrictions
- **Poll Expiration** - Optional time-limited polls

### User Experience
- **Modern UI/UX** - Clean, intuitive interface with smooth animations
- **Real-time Updates** - Live vote counting without page refreshes
- **Search & Filter** - Find polls by keywords or status (active/expired)
- **Share Functionality** - Easy poll sharing with direct links
- **Success Notifications** - User feedback for all interactions

### Technical Features
- **Type Safety** - Full TypeScript implementation
- **State Management** - Redux Toolkit for predictable state updates
- **API Documentation** - Swagger/OpenAPI documentation
- **Error Handling** - Comprehensive error handling and user feedback
- **Performance Optimized** - Efficient database queries and frontend rendering

## Tech Stack

### Frontend
- **React 18** - Modern component-based UI framework
- **TypeScript** - Type-safe JavaScript development
- **Redux Toolkit** - Efficient state management
- **React Router** - Client-side routing
- **Recharts** - Interactive data visualizations
- **Axios** - HTTP client for API communication
- **CSS3** - Custom styling with modern features

### Backend
- **Django 4.2** - High-level Python web framework
- **Django REST Framework** - Powerful toolkit for building APIs
- **PostgreSQL** - Robust relational database
- **Django CORS Headers** - Cross-origin resource sharing
- **drf-yasg** - Swagger/OpenAPI documentation generator

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **pip** - Python package management
- **Virtual Environment** - Isolated Python environments

## Project Structure

```
online-poll-system/
├── backend/                    # Django Backend
│   ├── venv/                  # Python virtual environment
│   ├── pollsystem/            # Django project
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py
│   └── polls/                 # Django app
│       ├── models.py          # Database models
│       ├── serializers.py     # API serializers
│       ├── views.py           # API views
│       ├── urls.py           # App URLs
│       └── admin.py          # Admin interface
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── common/        # Shared components (Header, Footer, etc.)
│   │   │   └── poll/          # Poll-specific components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux store and slices
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript type definitions
│   │   └── styles/            # Global styles
│   ├── public/
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL (v12 or higher)
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd online-poll-system/backend
```

2. **Create and activate virtual environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. **Install Python dependencies**
```bash
pip install django djangorestframework python-decouple psycopg2-binary django-cors-headers drf-yasg
```

4. **Configure environment variables**
Create `.env` file in `backend/` directory:
```env
DB_NAME=pollsystem
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-very-long-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOW_ALL_ORIGINS=True
```

5. **Set up database**
```bash
cd pollsystem
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

6. **Run the development server**
```bash
python manage.py runserver
```

The Django backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install Node.js dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create `.env` file in `frontend/` directory:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

4. **Start the development server**
```bash
npm start
```

The React frontend will be available at `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### Polls
- `GET /polls/` - List all polls
- `POST /polls/` - Create a new poll
- `GET /polls/{id}/` - Get poll details
- `GET /polls/{id}/results/` - Get poll results

#### Voting
- `POST /polls/{id}/vote/` - Vote on a poll

### Interactive Documentation
- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`

### Example API Usage

#### Create a Poll
```bash
curl -X POST http://localhost:8000/api/polls/ \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your favorite programming language?",
    "description": "Choose your preferred language for web development",
    "options": ["JavaScript", "Python", "Java", "Go"]
  }'
```

#### Vote on a Poll
```bash
curl -X POST http://localhost:8000/api/polls/{poll_id}/vote/ \
  -H "Content-Type: application/json" \
  -d '{
    "option_id": "{option_id}"
  }'
```

## Database Schema

### Poll Model
- `id` (UUID) - Primary key
- `question` (CharField) - Poll question
- `description` (TextField) - Optional description
- `created_at` (DateTimeField) - Creation timestamp
- `expires_at` (DateTimeField) - Optional expiration
- `is_active` (BooleanField) - Active status

### Option Model
- `id` (UUID) - Primary key
- `poll` (ForeignKey) - Reference to poll
- `text` (CharField) - Option text
- `created_at` (DateTimeField) - Creation timestamp

### Vote Model
- `id` (UUID) - Primary key
- `option` (ForeignKey) - Reference to option
- `poll` (ForeignKey) - Reference to poll
- `voter_ip` (GenericIPAddressField) - Voter IP address
- `created_at` (DateTimeField) - Vote timestamp

## Usage

### Creating a Poll
1. Navigate to `/create`
2. Fill in poll question and description
3. Add 2-10 options
4. Optionally set an expiration date
5. Click "Create Poll"

### Voting on a Poll
1. Click on any poll from the homepage
2. Select your preferred option
3. Click "Submit Vote"
4. View live results with charts

### Viewing Results
- **Charts**: Interactive bar and pie charts
- **Detailed Breakdown**: Ranked list with percentages
- **Real-time Updates**: Results update automatically

## Development

### Running Tests
```bash
# Backend tests
cd backend/pollsystem
python manage.py test

# Frontend tests
cd frontend
npm test
```

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting for consistency
- **Django Best Practices**: Following Django conventions

### Git Workflow
```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

Use conventional commit messages:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests

## Deployment

### Backend Deployment (Heroku/Railway)
1. Set up production database
2. Configure environment variables
3. Update `ALLOWED_HOSTS` in settings
4. Set `DEBUG=False`
5. Deploy using platform-specific instructions

### Frontend Deployment (Vercel/Netlify)
1. Update `REACT_APP_API_URL` for production
2. Build the project: `npm run build`
3. Deploy using platform-specific instructions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m "feat: add feature"`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Django REST Framework for the robust API foundation
- React community for excellent documentation and tools
- Recharts for beautiful data visualizations
- PostgreSQL for reliable data storage


