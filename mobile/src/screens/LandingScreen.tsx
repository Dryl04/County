import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '../components'
import { colors, spacing, fontSize, borderRadius } from '../theme'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>

const { width, height } = Dimensions.get('window')

export const LandingScreen: React.FC<Props> = ({ navigation }) => {
  const features = [
    {
      icon: 'wallet-outline' as const,
      title: 'Gérez vos budgets',
      description: 'Créez et suivez plusieurs budgets facilement',
    },
    {
      icon: 'pie-chart-outline' as const,
      title: 'Catégorisez vos dépenses',
      description: 'Organisez vos transactions par catégorie',
    },
    {
      icon: 'trending-up-outline' as const,
      title: 'Analysez vos finances',
      description: 'Visualisez vos revenus et dépenses',
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: 'Sécurisé',
      description: 'Vos données sont protégées',
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.neutral[950], colors.neutral[900], colors.neutral[950]]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                style={styles.logoGradient}
              >
                <Ionicons name="wallet" size={48} color="#fff" />
              </LinearGradient>
            </View>
            
            <Text style={styles.title}>County</Text>
            <Text style={styles.subtitle}>
              Gérez votre budget personnel avec simplicité et efficacité
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={24} color={colors.primary[400]} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Button
              title="Commencer"
              onPress={() => navigation.navigate('Register')}
              fullWidth
              size="lg"
            />
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Vous avez déjà un compte ?</Text>
              <Button
                title="Se connecter"
                variant="ghost"
                onPress={() => navigation.navigate('Login')}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[950],
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.neutral[100],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.neutral[400],
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 28,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  featureCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: 'rgba(38, 38, 38, 0.5)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[800],
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[100],
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    lineHeight: 18,
  },
  ctaSection: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  loginText: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
  },
})
