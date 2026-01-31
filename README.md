# County - Budget Management Application

> A full-stack personal budget management application with a secure REST API backend and modern Vue.js frontend.

County helps you take control of your finances by providing an intuitive interface to track income, expenses, and manage multiple budgets. Built with modern technologies and security best practices.

## ✨ Features

- **🔐 Authentication**: JWT-based authentication with access/refresh tokens
- **👤 User Management**: Registration, login, and customizable profile settings
- **💰 Multi-Budget Support**: Create and manage multiple budgets with different currencies
- **📊 Categories**: Organize transactions with customizable categories
- **💸 Transaction Tracking**: Track income and expenses with pagination and automatic balance calculation
- **🌍 Multi-Currency Support**: Support for 8 major currencies (EUR, USD, GBP, XOF, CAD, CHF, JPY, CNY)
- **📝 Audit Logging**: Track sensitive actions for compliance and security
- **🛡️ Rate Limiting**: Built-in API protection against abuse
- **🚀 Docker Support**: Easy deployment with Docker Compose
- **📱 Modern UI**: Responsive Vue.js frontend with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose) + bcrypt
- **Testing**: pytest

### Frontend
- **Framework**: Vue.js 3 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Testing**: Vitest + Playwright

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15 (Alpine)

## 📁 Project Structure

```
County/
├── backend/           # FastAPI backend application
│   ├── alembic/      # Database migrations
│   ├── app/          # Application code
│   │   ├── api/      # API endpoints
│   │   ├── core/     # Core configurations
│   │   ├── db/       # Database setup
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── tests/    # Backend tests
│   └── requirements.txt
├── frontend/          # Vue.js frontend application
│   ├── src/          # Source code
│   ├── e2e/          # E2E tests
│   └── package.json
├── docker-compose.yml # Docker orchestration
├── CHANGELOG.md      # Version history and updates
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 15+ (if not using Docker)
- Docker & Docker Compose (recommended)

### Using Docker (Recommended)

The easiest way to get started is with Docker Compose, which sets up both the backend and database:

```bash
# Clone the repository
git clone https://github.com/Dryl04/County.git
cd County

# Start backend and database services
docker-compose up -d

# Backend API will be available at http://localhost:8000
# API Documentation at http://localhost:8000/docs
```

### Frontend Setup

The frontend needs to be run separately:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will be available at http://localhost:5174
```

### Manual Backend Setup (Without Docker)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

### Access Points

After setup, you can access:

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Database**: localhost:5433 (Docker) or localhost:5432 (local)

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout (client-side) |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user profile |
| PUT | `/api/v1/users/me` | Update current user |
| DELETE | `/api/v1/users/me` | Delete current user |

### Budgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/budgets` | List all budgets |
| POST | `/api/v1/budgets` | Create budget |
| GET | `/api/v1/budgets/{id}` | Get budget by ID |
| PUT | `/api/v1/budgets/{id}` | Update budget |
| DELETE | `/api/v1/budgets/{id}` | Delete budget |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories?budget_id={id}` | List categories |
| POST | `/api/v1/categories` | Create category |
| GET | `/api/v1/categories/{id}` | Get category by ID |
| PUT | `/api/v1/categories/{id}` | Update category |
| DELETE | `/api/v1/categories/{id}` | Delete category |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions?budget_id={id}&page=1&per_page=50` | List with pagination |
| POST | `/api/v1/transactions` | Create transaction |
| GET | `/api/v1/transactions/{id}` | Get transaction by ID |
| PUT | `/api/v1/transactions/{id}` | Update transaction |
| DELETE | `/api/v1/transactions/{id}` | Delete transaction |

## Error Response Format

All errors follow a standardized format:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Description of the error",
    "details": { "field": "name", "issue": "too short" }
  }
}
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET_KEY` | Secret key for JWT signing | Required |
| `JWT_ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | 30 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | 7 |
| `RATE_LIMIT_PER_MINUTE` | API rate limit | 300 |
| `DEBUG` | Enable debug mode | false |

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests with pytest
pytest app/tests -v

# Run with coverage
pytest app/tests --cov=app --cov-report=html
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm run test:unit

# Run E2E tests
npx playwright install  # First time only
npm run test:e2e

# Run linting
npm run lint
```

## 🔒 Security Notes

- Never commit `.env` files with real secrets
- Use strong `JWT_SECRET_KEY` in production (generate with `openssl rand -hex 32`)
- Enable HTTPS in production
- Configure proper CORS origins
- Passwords are hashed using bcrypt with salt rounds
- Implement rate limiting on sensitive endpoints
- Regular security audits recommended

## 🐛 Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart database service
docker-compose restart db
```

### Frontend Build Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Migration Issues

```bash
# Check current migration status
cd backend
alembic current

# Rollback one migration
alembic downgrade -1

# Upgrade to latest
alembic upgrade head
```

## 📝 Recent Updates

Check the [CHANGELOG.md](CHANGELOG.md) for detailed information about recent features and improvements, including:

- ✅ Automatic budget balance calculation
- ✅ User-configurable preferred currency
- ✅ Support for 8 major currencies
- ✅ Improved transaction management

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📄 License

MIT
