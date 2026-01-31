"""API views for the County Budget API."""

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import Budget, Category, Transaction
from .serializers import (
    UserCreateSerializer,
    UserUpdateSerializer,
    UserResponseSerializer,
    LoginRequestSerializer,
    TokenResponseSerializer,
    RefreshTokenRequestSerializer,
    BudgetCreateSerializer,
    BudgetUpdateSerializer,
    BudgetResponseSerializer,
    CategoryCreateSerializer,
    CategoryUpdateSerializer,
    CategoryResponseSerializer,
    TransactionCreateSerializer,
    TransactionUpdateSerializer,
    TransactionResponseSerializer,
)

User = get_user_model()


# Root endpoints
@api_view(['GET'])
@permission_classes([AllowAny])
def root(request):
    """Root endpoint."""
    return Response({
        'message': 'Welcome to County Budget API',
        'docs': '/docs'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint."""
    return Response({'status': 'healthy'})


# Authentication Views
class RegisterView(APIView):
    """User registration endpoint."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Register a new user."""
        # Check if email already exists first
        email = request.data.get('email')
        if email and User.objects.filter(email=email).exists():
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'CONFLICT',
                            'message': 'Email already registered',
                            'details': {'field': 'email', 'issue': 'already exists'}
                        }
                    }
                },
                status=status.HTTP_409_CONFLICT
            )

        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response_serializer = UserResponseSerializer(user)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class LoginView(APIView):
    """User login endpoint."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Authenticate user and return JWT tokens."""
        serializer = LoginRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {
                        'detail': {
                            'error': {
                                'code': 'UNAUTHORIZED',
                                'message': 'Invalid email or password'
                            }
                        }
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

            if not user.check_password(password):
                return Response(
                    {
                        'detail': {
                            'error': {
                                'code': 'UNAUTHORIZED',
                                'message': 'Invalid email or password'
                            }
                        }
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'token_type': 'bearer'
            })

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class RefreshView(APIView):
    """Token refresh endpoint."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Refresh access token using refresh token."""
        serializer = RefreshTokenRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                refresh = RefreshToken(serializer.validated_data['refresh_token'])
                return Response({
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'token_type': 'bearer'
                })
            except TokenError:
                return Response(
                    {
                        'detail': {
                            'error': {
                                'code': 'UNAUTHORIZED',
                                'message': 'Invalid or expired refresh token'
                            }
                        }
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class LogoutView(APIView):
    """User logout endpoint."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Logout user (client should discard tokens)."""
        return Response(status=status.HTTP_204_NO_CONTENT)


# User Views
class CurrentUserView(APIView):
    """Current user profile endpoints."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user's profile."""
        serializer = UserResponseSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        """Update current user's profile."""
        # Check email uniqueness if updating email
        if 'email' in request.data and request.data['email'] != request.user.email:
            if User.objects.filter(email=request.data['email']).exists():
                return Response(
                    {
                        'detail': {
                            'error': {
                                'code': 'CONFLICT',
                                'message': 'Email already registered',
                                'details': {'field': 'email', 'issue': 'already exists'}
                            }
                        }
                    },
                    status=status.HTTP_409_CONFLICT
                )

        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = UserResponseSerializer(request.user)
            return Response(response_serializer.data)

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def delete(self, request):
        """Delete current user's account."""
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Budget Views
class BudgetListCreateView(APIView):
    """Budget list and create endpoints."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all budgets for the current user."""
        budgets = Budget.objects.filter(user=request.user)
        serializer = BudgetResponseSerializer(budgets, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new budget."""
        serializer = BudgetCreateSerializer(data=request.data)
        if serializer.is_valid():
            budget = Budget.objects.create(
                user=request.user,
                **serializer.validated_data
            )
            response_serializer = BudgetResponseSerializer(budget)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class BudgetDetailView(APIView):
    """Budget detail endpoints."""

    permission_classes = [IsAuthenticated]

    def get_budget(self, budget_id, user):
        """Get budget if it exists and belongs to user."""
        try:
            return Budget.objects.get(id=budget_id, user=user)
        except Budget.DoesNotExist:
            return None

    def get(self, request, budget_id):
        """Get a specific budget by ID."""
        budget = self.get_budget(budget_id, request.user)
        if not budget:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BudgetResponseSerializer(budget)
        return Response(serializer.data)

    def put(self, request, budget_id):
        """Update a specific budget."""
        budget = self.get_budget(budget_id, request.user)
        if not budget:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BudgetUpdateSerializer(budget, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = BudgetResponseSerializer(budget)
            return Response(response_serializer.data)

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def delete(self, request, budget_id):
        """Delete a specific budget."""
        budget = self.get_budget(budget_id, request.user)
        if not budget:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        budget.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Category Views
def verify_budget_ownership(budget_id, user):
    """Verify that the user owns the budget."""
    try:
        return Budget.objects.get(id=budget_id, user=user)
    except Budget.DoesNotExist:
        return None


class CategoryListCreateView(APIView):
    """Category list and create endpoints."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all categories for a budget."""
        budget_id = request.query_params.get('budget_id')
        if not budget_id:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'INVALID_INPUT',
                            'message': 'budget_id is required'
                        }
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        budget = verify_budget_ownership(budget_id, request.user)
        if not budget:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        categories = Category.objects.filter(budget_id=budget_id)
        serializer = CategoryResponseSerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new category."""
        serializer = CategoryCreateSerializer(data=request.data)
        if serializer.is_valid():
            budget = verify_budget_ownership(
                serializer.validated_data['budget_id'],
                request.user
            )
            if not budget:
                return Response(
                    {
                        'detail': {
                            'error': {
                                'code': 'NOT_FOUND',
                                'message': 'Budget not found'
                            }
                        }
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            category = Category.objects.create(
                budget=budget,
                name=serializer.validated_data['name'],
                color=serializer.validated_data.get('color', '#6366f1'),
                icon=serializer.validated_data.get('icon')
            )
            response_serializer = CategoryResponseSerializer(category)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class CategoryDetailView(APIView):
    """Category detail endpoints."""

    permission_classes = [IsAuthenticated]

    def get_category(self, category_id):
        """Get category if it exists."""
        try:
            return Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return None

    def get(self, request, category_id):
        """Get a specific category by ID."""
        category = self.get_category(category_id)
        if not category:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Category not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Verify ownership
        if not verify_budget_ownership(category.budget_id, request.user):
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CategoryResponseSerializer(category)
        return Response(serializer.data)

    def put(self, request, category_id):
        """Update a specific category."""
        category = self.get_category(category_id)
        if not category:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Category not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not verify_budget_ownership(category.budget_id, request.user):
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CategoryUpdateSerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = CategoryResponseSerializer(category)
            return Response(response_serializer.data)

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def delete(self, request, category_id):
        """Delete a specific category."""
        category = self.get_category(category_id)
        if not category:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Category not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not verify_budget_ownership(category.budget_id, request.user):
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Transaction Views
def verify_category_ownership(category_id, user):
    """Verify that the user owns the category."""
    if category_id is None:
        return True, None
    try:
        category = Category.objects.get(id=category_id)
        if not verify_budget_ownership(category.budget_id, user):
            return False, None
        return True, category
    except Category.DoesNotExist:
        return False, None


class TransactionListCreateView(APIView):
    """Transaction list and create endpoints."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List transactions for a budget with pagination."""
        budget_id = request.query_params.get('budget_id')
        if not budget_id:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'INVALID_INPUT',
                            'message': 'budget_id is required'
                        }
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        budget = verify_budget_ownership(budget_id, request.user)
        if not budget:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Get pagination parameters
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 50))
        per_page = min(per_page, 100)  # Max 100 per page

        # Get total count
        total = Transaction.objects.filter(budget_id=budget_id).count()

        # Calculate pagination
        pages = (total + per_page - 1) // per_page if total > 0 else 1
        offset = (page - 1) * per_page

        # Get paginated transactions
        transactions = Transaction.objects.filter(
            budget_id=budget_id
        ).order_by('-occurred_at')[offset:offset + per_page]

        serializer = TransactionResponseSerializer(transactions, many=True)

        return Response({
            'items': serializer.data,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': pages
        })

    def post(self, request):
        """Create a new transaction."""
        serializer = TransactionCreateSerializer(data=request.data)
        if serializer.is_valid():
            budget = verify_budget_ownership(
                serializer.validated_data['budget_id'],
                request.user
            )
            if not budget:
                return Response(
                    {
                        'detail': {
                            'error': {
                                'code': 'NOT_FOUND',
                                'message': 'Budget not found'
                            }
                        }
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            category_id = serializer.validated_data.get('category_id')
            category = None
            if category_id:
                valid, category = verify_category_ownership(category_id, request.user)
                if not valid:
                    return Response(
                        {
                            'detail': {
                                'error': {
                                    'code': 'NOT_FOUND',
                                    'message': 'Category not found'
                                }
                            }
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )

            transaction = Transaction.objects.create(
                budget=budget,
                category=category,
                amount=serializer.validated_data['amount'],
                currency=serializer.validated_data.get('currency', 'EUR'),
                type=serializer.validated_data['type'],
                note=serializer.validated_data.get('note'),
                occurred_at=serializer.validated_data.get('occurred_at') or timezone.now()
            )

            # Update budget balance
            if transaction.type == 'income':
                budget.total_amount += transaction.amount
            else:  # expense
                budget.total_amount -= transaction.amount
            budget.save()

            response_serializer = TransactionResponseSerializer(transaction)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class TransactionDetailView(APIView):
    """Transaction detail endpoints."""

    permission_classes = [IsAuthenticated]

    def get_transaction(self, transaction_id):
        """Get transaction if it exists."""
        try:
            return Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return None

    def get(self, request, transaction_id):
        """Get a specific transaction by ID."""
        transaction = self.get_transaction(transaction_id)
        if not transaction:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Transaction not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not verify_budget_ownership(transaction.budget_id, request.user):
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TransactionResponseSerializer(transaction)
        return Response(serializer.data)

    def put(self, request, transaction_id):
        """Update a specific transaction."""
        transaction = self.get_transaction(transaction_id)
        if not transaction:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Transaction not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        budget = verify_budget_ownership(transaction.budget_id, request.user)
        if not budget:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Revert old transaction from budget
        if transaction.type == 'income':
            budget.total_amount -= transaction.amount
        else:  # expense
            budget.total_amount += transaction.amount

        serializer = TransactionUpdateSerializer(transaction, data=request.data, partial=True)
        if serializer.is_valid():
            # Handle category update
            if 'category_id' in serializer.validated_data:
                category_id = serializer.validated_data.pop('category_id')
                if category_id:
                    valid, category = verify_category_ownership(category_id, request.user)
                    if not valid:
                        return Response(
                            {
                                'detail': {
                                    'error': {
                                        'code': 'NOT_FOUND',
                                        'message': 'Category not found'
                                    }
                                }
                            },
                            status=status.HTTP_404_NOT_FOUND
                        )
                    transaction.category = category
                else:
                    transaction.category = None

            serializer.save()

            # Apply new transaction to budget
            if transaction.type == 'income':
                budget.total_amount += transaction.amount
            else:  # expense
                budget.total_amount -= transaction.amount
            budget.save()

            response_serializer = TransactionResponseSerializer(transaction)
            return Response(response_serializer.data)

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def delete(self, request, transaction_id):
        """Delete a specific transaction."""
        transaction = self.get_transaction(transaction_id)
        if not transaction:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Transaction not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        budget = verify_budget_ownership(transaction.budget_id, request.user)
        if not budget:
            return Response(
                {
                    'detail': {
                        'error': {
                            'code': 'NOT_FOUND',
                            'message': 'Budget not found'
                        }
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Update budget balance before deletion
        if transaction.type == 'income':
            budget.total_amount -= transaction.amount
        else:  # expense
            budget.total_amount += transaction.amount
        budget.save()

        transaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
