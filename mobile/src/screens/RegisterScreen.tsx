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
import { isValidEmail, isValidPassword } from '../utils'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types'

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  
  const { register, isLoading, error, clearError } = useAuthStore()

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    
    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = 'Le nom doit contenir au moins 2 caractères'
    }
    
    if (!email) {
      newErrors.email = 'L\'email est requis'
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email invalide'
    }
    
    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    clearError()
    if (!validate()) return
    
    const success = await register({ email, full_name: fullName.trim(), password })
    if (!success && error) {
      Alert.alert('Erreur d\'inscription', error)
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
              <Text style={styles.title}>Créer un compte</Text>
              <Text style={styles.subtitle}>
                Rejoignez County pour gérer vos finances
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label="Nom complet"
                placeholder="Votre nom"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text)
                  if (errors.fullName) setErrors({ ...errors, fullName: undefined })
                }}
                error={errors.fullName}
                autoCapitalize="words"
                autoComplete="name"
                leftIcon="person-outline"
              />

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
                placeholder="Minimum 8 caractères"
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                error={errors.password}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                leftIcon="lock-closed-outline"
              />

              <TextInput
                label="Confirmer le mot de passe"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text)
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
                }}
                error={errors.confirmPassword}
                secureTextEntry
                autoCapitalize="none"
                leftIcon="lock-closed-outline"
              />

              <Button
                title="Créer mon compte"
                onPress={handleRegister}
                loading={isLoading}
                fullWidth
                size="lg"
                style={styles.submitButton}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>
              <Button
                title="Se connecter"
                variant="ghost"
                onPress={() => navigation.replace('Login')}
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
    marginBottom: spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    marginBottom: spacing.lg,
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
