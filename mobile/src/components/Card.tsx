import React from 'react'
import { View, Text, StyleSheet, type ViewStyle } from 'react-native'
import { colors, borderRadius, spacing, fontSize, shadows } from '../theme'

interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  variant?: 'default' | 'glass' | 'stat'
  style?: ViewStyle
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  style,
}) => {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'default' | 'success' | 'danger' | 'warning'
  style?: ViewStyle
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'default',
  style,
}) => {
  const valueColor = {
    default: colors.neutral[100],
    success: colors.success[400],
    danger: colors.danger[400],
    warning: colors.warning[400],
  }

  return (
    <View style={[styles.card, styles.stat, style]}>
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      <Text style={[styles.statValue, { color: valueColor[color] }]}>{value}</Text>
      {(subtitle || trend) && (
        <View style={styles.statFooter}>
          {trend && (
            <Text
              style={[
                styles.trend,
                { color: trend.isPositive ? colors.success[400] : colors.danger[400] },
              ]}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </Text>
          )}
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    ...shadows.md,
  },
  default: {},
  glass: {
    backgroundColor: 'rgba(38, 38, 38, 0.8)',
    borderColor: 'rgba(64, 64, 64, 0.5)',
  },
  stat: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.neutral[100],
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statTitle: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral[100],
  },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  trend: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  statSubtitle: {
    color: colors.neutral[500],
    fontSize: fontSize.xs,
  },
})
