import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card, StatCard, Loading, EmptyState, TransactionItem, Button } from '../components'
import { useDashboardStore, useAuthStore, selectUserName, selectPreferredCurrency } from '../stores'
import { colors, spacing, fontSize, borderRadius } from '../theme'
import { formatCurrency, formatPercentage } from '../utils'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { MainTabParamList } from '../types'

type Props = BottomTabScreenProps<MainTabParamList, 'Dashboard'>

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const {
    stats,
    budgetUtilization,
    recentTransactions,
    isLoading,
    fetchDashboardData,
    lastUpdated,
  } = useDashboardStore()
  
  const userName = useAuthStore(selectUserName)
  const preferredCurrency = useAuthStore(selectPreferredCurrency)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const onRefresh = useCallback(() => {
    fetchDashboardData()
  }, [])

  const hasData = stats.totalBudgets > 0 || lastUpdated !== null

  if (isLoading && !hasData) {
    return <Loading fullScreen text="Chargement du tableau de bord..." />
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bienvenue</Text>
            <Text style={styles.userName}>{userName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={isLoading}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={colors.neutral[300]}
            />
          </TouchableOpacity>
        </View>

        {/* Main Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Budgets"
            value={stats.totalBudgets.toString()}
            subtitle={`${stats.totalTransactions} transactions`}
            icon={<Ionicons name="wallet-outline" size={16} color={colors.primary[400]} />}
            style={styles.statCard}
          />
          <StatCard
            title="Balance"
            value={formatCurrency(stats.totalBalance, preferredCurrency)}
            subtitle="Solde net"
            color={stats.totalBalance >= 0 ? 'success' : 'danger'}
            icon={
              <Ionicons
                name="cash-outline"
                size={16}
                color={stats.totalBalance >= 0 ? colors.success[400] : colors.danger[400]}
              />
            }
            style={styles.statCard}
          />
          <StatCard
            title="Revenus"
            value={formatCurrency(stats.totalIncome, preferredCurrency)}
            subtitle="Total"
            color="success"
            icon={<Ionicons name="arrow-up" size={16} color={colors.success[400]} />}
            style={styles.statCard}
          />
          <StatCard
            title="Dépenses"
            value={formatCurrency(stats.totalExpenses, preferredCurrency)}
            subtitle="Total"
            color="danger"
            icon={<Ionicons name="arrow-down" size={16} color={colors.danger[400]} />}
            style={styles.statCard}
          />
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiRow}>
          <Card variant="glass" style={styles.kpiCard}>
            <View style={styles.kpiContent}>
              <View style={[styles.kpiIcon, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                <Ionicons name="trending-up-outline" size={24} color={colors.purple[400]} />
              </View>
              <View>
                <Text style={styles.kpiLabel}>Taux d'épargne</Text>
                <Text style={styles.kpiValue}>{formatPercentage(stats.savingsRate)}</Text>
              </View>
            </View>
          </Card>

          <Card variant="glass" style={styles.kpiCard}>
            <View style={styles.kpiContent}>
              <View style={[styles.kpiIcon, { backgroundColor: 'rgba(249, 115, 22, 0.2)' }]}>
                <Ionicons name="stats-chart-outline" size={24} color={colors.orange[400]} />
              </View>
              <View>
                <Text style={styles.kpiLabel}>Moy. Transaction</Text>
                <Text style={styles.kpiValue}>
                  {formatCurrency(stats.averageTransactionAmount, preferredCurrency)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Budget Utilization */}
        <Card title="Utilisation des budgets" style={styles.section}>
          {budgetUtilization.length === 0 ? (
            <EmptyState
              icon={<Ionicons name="wallet-outline" size={48} color={colors.neutral[600]} />}
              title="Aucun budget"
              description="Créez votre premier budget pour commencer"
              action={
                <Button
                  title="Créer un budget"
                  onPress={() => navigation.navigate('Budgets')}
                  size="sm"
                />
              }
            />
          ) : (
            <View style={styles.budgetList}>
              {budgetUtilization.slice(0, 3).map((budget) => (
                <View key={budget.id} style={styles.budgetItem}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetName} numberOfLines={1}>
                      {budget.name}
                    </Text>
                    <Text
                      style={[
                        styles.budgetAmount,
                        { color: budget.isOverBudget ? colors.danger[400] : colors.success[400] },
                      ]}
                    >
                      {formatCurrency(budget.spent, preferredCurrency)} /{' '}
                      {formatCurrency(budget.budgetAmount, preferredCurrency)}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(budget.percentage, 100)}%`,
                          backgroundColor: budget.isOverBudget
                            ? colors.danger[500]
                            : budget.percentage > 80
                            ? colors.warning[500]
                            : colors.success[500],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.budgetPercentage}>
                    {formatPercentage(budget.percentage)} utilisé
                  </Text>
                </View>
              ))}
              {budgetUtilization.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('Budgets')}
                >
                  <Text style={styles.viewAllText}>Voir tous les budgets</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primary[400]} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card title="Transactions récentes" style={styles.section}>
          {recentTransactions.length === 0 ? (
            <EmptyState
              icon={<Ionicons name="receipt-outline" size={48} color={colors.neutral[600]} />}
              title="Aucune transaction"
              description="Ajoutez votre première transaction"
              action={
                <Button
                  title="Ajouter"
                  onPress={() => navigation.navigate('Transactions')}
                  size="sm"
                />
              }
            />
          ) : (
            <View style={styles.transactionList}>
              {recentTransactions.slice(0, 5).map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
              {recentTransactions.length > 5 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('Transactions')}
                >
                  <Text style={styles.viewAllText}>Voir toutes les transactions</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primary[400]} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Transactions')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Ionicons name="add" size={24} color={colors.primary[400]} />
            </View>
            <Text style={styles.quickActionTitle}>Transaction</Text>
            <Text style={styles.quickActionSubtitle}>Ajouter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Categories')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
              <Ionicons name="pricetag-outline" size={24} color={colors.purple[400]} />
            </View>
            <Text style={styles.quickActionTitle}>Catégories</Text>
            <Text style={styles.quickActionSubtitle}>Gérer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
              <Ionicons name="person-outline" size={24} color={colors.success[400]} />
            </View>
            <Text style={styles.quickActionTitle}>Profil</Text>
            <Text style={styles.quickActionSubtitle}>Paramètres</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[950],
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeText: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
  },
  userName: {
    color: colors.neutral[100],
    fontSize: fontSize['2xl'],
    fontWeight: '700',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    flex: 1,
    padding: spacing.md,
  },
  kpiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  kpiIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    color: colors.neutral[400],
    fontSize: fontSize.xs,
    fontFamily: 'monospace',
  },
  kpiValue: {
    color: colors.neutral[100],
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  budgetList: {
    gap: spacing.md,
  },
  budgetItem: {
    padding: spacing.md,
    backgroundColor: 'rgba(38, 38, 38, 0.5)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  budgetName: {
    color: colors.neutral[100],
    fontSize: fontSize.base,
    fontWeight: '500',
    flex: 1,
    marginRight: spacing.sm,
  },
  budgetAmount: {
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  budgetPercentage: {
    color: colors.neutral[500],
    fontSize: fontSize.xs,
  },
  transactionList: {
    gap: spacing.sm,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  viewAllText: {
    color: colors.primary[400],
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: 'rgba(38, 38, 38, 0.5)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[800],
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    color: colors.neutral[100],
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  quickActionSubtitle: {
    color: colors.neutral[500],
    fontSize: fontSize.xs,
  },
})
