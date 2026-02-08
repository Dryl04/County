import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, borderRadius, spacing, fontSize } from '../theme'
import { formatCurrency, formatDate } from '../utils'
import type { Transaction } from '../types'

interface TransactionItemProps {
  transaction: Transaction
  onPress?: () => void
  showDate?: boolean
  style?: ViewStyle
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  showDate = true,
  style,
}) => {
  const isIncome = transaction.type === 'income'
  const iconName = isIncome ? 'arrow-up' : 'arrow-down'
  const amountColor = isIncome ? colors.success[400] : colors.danger[400]
  const bgColor = isIncome ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
  const prefix = isIncome ? '+' : '-'

  const content = (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName} size={16} color={amountColor} />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.note} numberOfLines={1}>
          {transaction.note || 'Transaction'}
        </Text>
        {showDate && (
          <Text style={styles.date}>{formatDate(transaction.occurred_at)}</Text>
        )}
      </View>
      
      <Text style={[styles.amount, { color: amountColor }]}>
        {prefix}{formatCurrency(parseFloat(transaction.amount), transaction.currency)}
      </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(38, 38, 38, 0.3)',
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  note: {
    color: colors.neutral[100],
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  date: {
    color: colors.neutral[500],
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  amount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
})
