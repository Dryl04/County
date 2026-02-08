import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, borderRadius, spacing, fontSize } from '../theme'
import type { Category } from '../types'

interface CategoryItemProps {
  category: Category
  onPress?: () => void
  onEdit?: () => void
  onDelete?: () => void
  transactionCount?: number
  style?: ViewStyle
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  onPress,
  onEdit,
  onDelete,
  transactionCount,
  style,
}) => {
  const categoryColor = category.color || colors.primary[500]

  const content = (
    <View style={[styles.container, style]}>
      <View style={[styles.colorIndicator, { backgroundColor: categoryColor }]} />
      
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>
        {category.description && (
          <Text style={styles.description} numberOfLines={1}>
            {category.description}
          </Text>
        )}
        {transactionCount !== undefined && (
          <Text style={styles.count}>
            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Ionicons name="pencil-outline" size={18} color={colors.neutral[400]} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={18} color={colors.danger[400]} />
          </TouchableOpacity>
        )}
        {onPress && !onEdit && !onDelete && (
          <Ionicons name="chevron-forward" size={20} color={colors.neutral[500]} />
        )}
      </View>
    </View>
  )

  if (onPress && !onEdit && !onDelete) {
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
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[700],
    gap: spacing.md,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: borderRadius.full,
  },
  details: {
    flex: 1,
  },
  name: {
    color: colors.neutral[100],
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  description: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  count: {
    color: colors.neutral[500],
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
  },
})
