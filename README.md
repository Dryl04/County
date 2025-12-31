# County - Budget Management Application

A secure REST API for personal budget management built with FastAPI, SQLAlchemy, and PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with access/refresh tokens
- **User Management**: Registration, login, profile management
- **Budgets**: Create and manage multiple budgets
- **Categories**: Organize transactions with customizable categories
- **Transactions**: Track income and expenses with pagination support
- **Audit Logging**: Track sensitive actions for compliance
- **Rate Limiting**: Protect API from abuse
- **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

- **Backend**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose) + bcrypt
- **Testing**: pytest

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Dryl04/County.git
cd County

# Start services
docker-compose up -d

# API will be available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Manual Setup

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

## API Endpoints

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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET_KEY` | Secret key for JWT signing | Required |
| `JWT_ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | 30 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | 7 |
| `RATE_LIMIT_PER_MINUTE` | API rate limit | 300 |
| `DEBUG` | Enable debug mode | false |

## Running Tests

```bash
cd backend
pytest app/tests -v
```

## Security Notes

- Never commit `.env` files with real secrets
- Use strong `JWT_SECRET_KEY` in production (generate with `openssl rand -hex 32`)
- Enable HTTPS in production
- Configure proper CORS origins
- Passwords are hashed using bcrypt

## License

MIT
