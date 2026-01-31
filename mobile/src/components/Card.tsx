import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants';

interface CardProps extends ViewProps {
  variant?: 'default' | 'stat' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  style,
  children,
  ...props
}) => {
  return (
    <View style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
  },
  default: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stat: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  glass: {
    backgroundColor: 'rgba(38, 38, 38, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(64, 64, 64, 0.5)',
  },
});
