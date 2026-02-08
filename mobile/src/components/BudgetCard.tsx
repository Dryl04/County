import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, borderRadius, spacing, fontSize } from '../theme'
import { formatCurrency, formatPercentage } from '../utils'
import type { Budget } from '../types'

interface BudgetCardProps {
  budget: Budget
  spent?: number
  onPress?: () => void
  style?: ViewStyle
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  spent = 0,
  onPress,
  style,
}) => {
  const budgetAmount = parseFloat(budget.total_amount)
  const remaining = budgetAmount - spent
  const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
  const isOverBudget = remaining < 0

  const progressColor = isOverBudget
    ? colors.danger[500]
    : percentage > 80
    ? colors.warning[500]
    : colors.success[500]

  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {budget.name}
          </Text>
          {budget.description && (
            <Text style={styles.description} numberOfLines={1}>
              {budget.description}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral[500]} />
      </View>

      <View style={styles.amountRow}>
        <Text style={[styles.spent, { color: isOverBudget ? colors.danger[400] : colors.neutral[100] }]}>
          {formatCurrency(spent, budget.currency)}
        </Text>
        <Text style={styles.total}>/ {formatCurrency(budgetAmount, budget.currency)}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.percentage}>{formatPercentage(percentage)} utilisé</Text>
        <Text style={[styles.remaining, { color: isOverBudget ? colors.danger[400] : colors.neutral[400] }]}>
          {isOverBudget
            ? `Dépassement de ${formatCurrency(Math.abs(remaining), budget.currency)}`
            : `${formatCurrency(remaining, budget.currency)} restant`}
        </Text>
      </View>
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  name: {
    color: colors.neutral[100],
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  description: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  spent: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  total: {
    color: colors.neutral[500],
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentage: {
    color: colors.neutral[500],
    fontSize: fontSize.xs,
  },
  remaining: {
    fontSize: fontSize.xs,
  },
})
