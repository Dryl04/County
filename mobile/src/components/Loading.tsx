import React from 'react'
import { View, ActivityIndicator, StyleSheet, Text, type ViewStyle } from 'react-native'
import { colors, fontSize, spacing } from '../theme'

interface LoadingProps {
  size?: 'small' | 'large'
  color?: string
  text?: string
  fullScreen?: boolean
  style?: ViewStyle
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = colors.primary[500],
  text,
  fullScreen = false,
  style,
}) => {
  const containerStyle: ViewStyle[] = [
    styles.container,
    ...(fullScreen ? [styles.fullScreen] : []),
    ...(style ? [style] : []),
  ]

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  style?: ViewStyle
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  style,
}) => {
  return (
    <View style={[styles.emptyContainer, style]}>
      {icon && <View style={styles.emptyIcon}>{icon}</View>}
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDescription}>{description}</Text>}
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.neutral[950],
  },
  text: {
    color: colors.neutral[400],
    fontSize: fontSize.base,
    marginTop: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.neutral[100],
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    color: colors.neutral[400],
    fontSize: fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyAction: {
    marginTop: spacing.md,
  },
})
