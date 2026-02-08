import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button, TextInput, Card } from '../components'
import { useAuthStore, selectUserName, selectPreferredCurrency } from '../stores'
import { colors, spacing, fontSize, borderRadius } from '../theme'
import { formatDate } from '../utils'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { MainTabParamList } from '../types'

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>

export const ProfileScreen: React.FC<Props> = () => {
  const { user, logout, updateProfile, deleteAccount, isLoading } = useAuthStore()
  const userName = useAuthStore(selectUserName)
  const preferredCurrency = useAuthStore(selectPreferredCurrency)
  
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [errors, setErrors] = useState<{ fullName?: string }>({})

  const handleSaveProfile = async () => {
    if (!fullName || fullName.trim().length < 2) {
      setErrors({ fullName: 'Le nom doit contenir au moins 2 caractères' })
      return
    }
    
    const success = await updateProfile({ full_name: fullName.trim() })
    if (success) {
      setIsEditing(false)
      setErrors({})
    } else {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil')
    }
  }

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          onPress: () => logout(),
        },
      ]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmation',
              'Êtes-vous vraiment sûr de vouloir supprimer votre compte ?',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Confirmer la suppression',
                  style: 'destructive',
                  onPress: async () => {
                    const success = await deleteAccount()
                    if (!success) {
                      Alert.alert('Erreur', 'Impossible de supprimer le compte')
                    }
                  },
                },
              ]
            )
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mon Profil</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                label="Nom complet"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text)
                  if (errors.fullName) setErrors({})
                }}
                error={errors.fullName}
                leftIcon="person-outline"
              />
              
              <View style={styles.editButtons}>
                <Button
                  title="Annuler"
                  variant="outline"
                  onPress={() => {
                    setIsEditing(false)
                    setFullName(user?.full_name || '')
                    setErrors({})
                  }}
                  style={styles.editButton}
                />
                <Button
                  title="Enregistrer"
                  onPress={handleSaveProfile}
                  loading={isLoading}
                  style={styles.editButton}
                />
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil-outline" size={16} color={colors.primary[400]} />
                <Text style={styles.editProfileText}>Modifier le profil</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Account Info */}
        <Card title="Informations du compte" style={styles.section}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color={colors.neutral[400]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="cash-outline" size={20} color={colors.neutral[400]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Devise préférée</Text>
              <Text style={styles.infoValue}>{preferredCurrency}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.neutral[400]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Rôle</Text>
              <Text style={styles.infoValue}>{user?.role || 'Utilisateur'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color={colors.neutral[400]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>
                {user?.created_at ? formatDate(user.created_at) : '-'}
              </Text>
            </View>
          </View>
        </Card>

        {/* App Info */}
        <Card title="Application" style={styles.section}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.neutral[400]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="code-slash-outline" size={20} color={colors.neutral[400]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Framework</Text>
              <Text style={styles.infoValue}>React Native avec Expo</Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Se déconnecter"
            variant="outline"
            onPress={handleLogout}
            icon={<Ionicons name="log-out-outline" size={20} color={colors.neutral[300]} />}
            fullWidth
          />

          <Button
            title="Supprimer mon compte"
            variant="danger"
            onPress={handleDeleteAccount}
            icon={<Ionicons name="trash-outline" size={20} color="#fff" />}
            fullWidth
          />
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
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.neutral[100],
    fontSize: fontSize['2xl'],
    fontWeight: '700',
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize['3xl'],
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    color: colors.neutral[100],
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userEmail: {
    color: colors.neutral[400],
    fontSize: fontSize.base,
    marginBottom: spacing.md,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  editProfileText: {
    color: colors.primary[400],
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  editForm: {
    width: '100%',
    paddingTop: spacing.md,
  },
  editButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  editButton: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.neutral[500],
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  infoValue: {
    color: colors.neutral[100],
    fontSize: fontSize.base,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[800],
    marginVertical: spacing.xs,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
})
