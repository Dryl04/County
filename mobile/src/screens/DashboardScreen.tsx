import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, LoadingSpinner, EmptyState } from '../components';
import { useAuthStore, useBudgetsStore, useTransactionsStore, useCategoriesStore } from '../stores';
import { transactionService } from '../services';
import { formatCurrency, formatDate } from '../utils';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import type { MainTabParamList } from '../navigation/types';
import type { Transaction, TransactionSummary, BudgetUtilization } from '../types';

type DashboardNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Dashboard'>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { user } = useAuthStore();
  const { budgets, fetchBudgets, isLoading: budgetsLoading } = useBudgetsStore();
  const { fetchCategories } = useCategoriesStore();
  const { fetchAllTransactions } = useTransactionsStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
    incomeCount: 0,
    expenseCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgetUtilization, setBudgetUtilization] = useState<BudgetUtilization[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    await fetchBudgets();

    let allTransactions: Transaction[] = [];
    const utilization: BudgetUtilization[] = [];

    for (const budget of budgets) {
      const transactions = await fetchAllTransactions(budget.id);
      allTransactions = [...allTransactions, ...transactions];

      const budgetAmount = parseFloat(budget.total_amount);
      const expenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      utilization.push({
        id: budget.id,
        name: budget.name,
        budgetAmount,
        spent: expenses,
        remaining: budgetAmount - expenses,
        percentage: budgetAmount > 0 ? (expenses / budgetAmount) * 100 : 0,
        isOverBudget: expenses > budgetAmount,
      });
    }

    // Calculate summary
    const summary = transactionService.calculateSummary(allTransactions);
    setStats(summary);

    // Get recent transactions
    const sorted = [...allTransactions].sort(
      (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );
    setRecentTransactions(sorted.slice(0, 5));

    setBudgetUtilization(utilization);
    setIsLoadingData(false);
  }, [fetchBudgets, fetchAllTransactions, budgets]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (budgets.length > 0 && !isRefreshing) {
      loadDashboardData();
    }
  }, [budgets.length]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  if (isLoadingData && !isRefreshing) {
    return <LoadingSpinner fullScreen message="Chargement du tableau de bord..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Dashboard</Text>
            <Text style={styles.userName}>Bienvenue, {user?.full_name?.split(' ')[0]}!</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={isRefreshing}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* KPI Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Total Budgets</Text>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Ionicons name="wallet-outline" size={16} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.statValue}>{budgets.length}</Text>
            <Text style={styles.statSubtext}>{stats.transactionCount} transactions</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Solde Total</Text>
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor:
                      stats.balance >= 0
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)',
                  },
                ]}
              >
                <Ionicons
                  name="cash-outline"
                  size={16}
                  color={stats.balance >= 0 ? COLORS.success : COLORS.error}
                />
              </View>
            </View>
            <Text
              style={[
                styles.statValue,
                { color: stats.balance >= 0 ? COLORS.success : COLORS.error },
              ]}
            >
              {formatCurrency(stats.balance, user?.preferred_currency)}
            </Text>
            <Text style={styles.statSubtext}>Solde net</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Revenus</Text>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                <Ionicons name="arrow-up" size={16} color={COLORS.success} />
              </View>
            </View>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {formatCurrency(stats.totalIncome, user?.preferred_currency)}
            </Text>
            <Text style={styles.statSubtext}>{stats.incomeCount} entrées</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Dépenses</Text>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <Ionicons name="arrow-down" size={16} color={COLORS.error} />
              </View>
            </View>
            <Text style={[styles.statValue, { color: COLORS.error }]}>
              {formatCurrency(stats.totalExpenses, user?.preferred_currency)}
            </Text>
            <Text style={styles.statSubtext}>{stats.expenseCount} sorties</Text>
          </Card>
        </View>

        {/* Budget Utilization */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Utilisation des budgets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Budgets' as never)}>
              <Text style={styles.sectionLink}>Voir tout →</Text>
            </TouchableOpacity>
          </View>

          {budgetUtilization.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              title="Aucun budget"
              message="Créez votre premier budget pour commencer"
              actionLabel="Créer un budget"
              onAction={() => navigation.navigate('Budgets' as never)}
            />
          ) : (
            <View style={styles.utilizationList}>
              {budgetUtilization.map((budget) => (
                <View key={budget.id} style={styles.utilizationItem}>
                  <View style={styles.utilizationHeader}>
                    <Text style={styles.utilizationName}>{budget.name}</Text>
                    <Text
                      style={[
                        styles.utilizationAmount,
                        { color: budget.isOverBudget ? COLORS.error : COLORS.success },
                      ]}
                    >
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.budgetAmount)}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(budget.percentage, 100)}%`,
                          backgroundColor: budget.isOverBudget
                            ? COLORS.error
                            : budget.percentage > 80
                            ? COLORS.warning
                            : COLORS.success,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.utilizationFooter}>
                    <Text style={styles.utilizationPercent}>
                      {budget.percentage.toFixed(1)}% utilisé
                    </Text>
                    <Text
                      style={[
                        styles.utilizationRemaining,
                        { color: budget.isOverBudget ? COLORS.error : COLORS.textMuted },
                      ]}
                    >
                      {budget.isOverBudget
                        ? `Dépassé de ${formatCurrency(Math.abs(budget.remaining))}`
                        : `${formatCurrency(budget.remaining)} restant`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions' as never)}>
              <Text style={styles.sectionLink}>Voir tout →</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="Aucune transaction"
              message="Ajoutez votre première transaction"
            />
          ) : (
            <View style={styles.transactionList}>
              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          transaction.type === 'income'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}
                      size={16}
                      color={transaction.type === 'income' ? COLORS.success : COLORS.error}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionNote}>
                      {transaction.note || 'Transaction'}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.occurred_at)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === 'income' ? COLORS.success : COLORS.error,
                      },
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(parseFloat(transaction.amount), transaction.currency)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statSubtext: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: SPACING.xs,
  },
  sectionCard: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLink: {
    color: COLORS.primary,
    fontSize: 14,
  },
  utilizationList: {
    gap: SPACING.md,
  },
  utilizationItem: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(38, 38, 38, 0.5)',
    borderRadius: BORDER_RADIUS.md,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  utilizationName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  utilizationAmount: {
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  utilizationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  utilizationPercent: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  utilizationRemaining: {
    fontSize: 11,
  },
  transactionList: {
    gap: SPACING.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: 'rgba(38, 38, 38, 0.3)',
    borderRadius: BORDER_RADIUS.md,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    color: COLORS.text,
    fontSize: 14,
  },
  transactionDate: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
