import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Button, TextInput } from '../components'
import { useAuthStore } from '../stores'
import { colors, spacing, fontSize, borderRadius } from '../theme'
import { isValidEmail } from '../utils'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  
  const { login, isLoading, error, clearError } = useAuthStore()

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = 'L\'email est requis'
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email invalide'
    }
    
    if (!password) {
      newErrors.password = 'Le mot de passe est requis'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    clearError()
    if (!validate()) return
    
    const success = await login({ email, password })
    if (!success && error) {
      Alert.alert('Erreur de connexion', 'Email ou mot de passe incorrect')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.neutral[950], colors.neutral[900], colors.neutral[950]]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.neutral[300]} />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[colors.primary[500], colors.primary[600]]}
                  style={styles.logoGradient}
                >
                  <Ionicons name="wallet" size={32} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>
                Accédez à votre compte pour gérer vos finances
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label="Email"
                placeholder="votre@email.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon="mail-outline"
              />

              <TextInput
                label="Mot de passe"
                placeholder="Votre mot de passe"
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                error={errors.password}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                leftIcon="lock-closed-outline"
              />

              <Button
                title="Se connecter"
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                size="lg"
                style={styles.submitButton}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Pas encore de compte ?</Text>
              <Button
                title="Créer un compte"
                variant="ghost"
                onPress={() => navigation.replace('Register')}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: colors.neutral[100],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.neutral[400],
    textAlign: 'center',
    maxWidth: '80%',
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  footerText: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
  },
})
