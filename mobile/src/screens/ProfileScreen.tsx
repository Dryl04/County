import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, TextInput, ErrorMessage } from '../components';
import { useAuthStore } from '../stores';
import { formatDate, getInitials } from '../utils';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';

export const ProfileScreen: React.FC = () => {
  const { user, updateProfile, deleteAccount, logout, isLoading, error, clearError } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferred_currency || 'EUR');

  const handleSaveProfile = async () => {
    clearError();
    const success = await updateProfile({
      full_name: fullName,
      preferred_currency: preferredCurrency,
    });

    if (success) {
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAccount();
            if (success) {
              Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          onPress: logout,
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.full_name)}</Text>
          </View>
          <Text style={styles.userName}>{user.full_name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Profile Info */}
        {isEditing ? (
          <Card style={styles.editCard}>
            <Text style={styles.sectionTitle}>Modifier le profil</Text>

            <TextInput
              label="Nom complet"
              value={fullName}
              onChangeText={setFullName}
              leftIcon="person-outline"
            />

            <TextInput
              label="Devise préférée"
              value={preferredCurrency}
              onChangeText={setPreferredCurrency}
              leftIcon="cash-outline"
              autoCapitalize="characters"
            />

            <View style={styles.editActions}>
              <Button
                title="Annuler"
                variant="secondary"
                onPress={() => {
                  setIsEditing(false);
                  setFullName(user.full_name);
                  setPreferredCurrency(user.preferred_currency);
                }}
                style={{ flex: 1 }}
              />
              <Button
                title="Enregistrer"
                onPress={handleSaveProfile}
                loading={isLoading}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        ) : (
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nom complet</Text>
                <Text style={styles.infoValue}>{user.full_name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Devise préférée</Text>
                <Text style={styles.infoValue}>{user.preferred_currency}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Membre depuis</Text>
                <Text style={styles.infoValue}>{formatDate(user.created_at)}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <View style={styles.actionIcon}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.warning} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Déconnexion</Text>
              <Text style={styles.actionDescription}>Se déconnecter de l'application</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: COLORS.error }]}>
                Supprimer le compte
              </Text>
              <Text style={styles.actionDescription}>
                Supprime définitivement votre compte et vos données
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>County Mobile v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 County. Tous droits réservés.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  userEmail: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  editCard: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  infoCard: {
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  actions: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  actionDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
  },
  appVersion: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  appCopyright: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
