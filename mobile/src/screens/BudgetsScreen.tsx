import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button, TextInput, LoadingSpinner, EmptyState } from '../components';
import { useBudgetsStore } from '../stores';
import { formatCurrency, formatDate } from '../utils';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import type { Budget, BudgetCreate } from '../types';

type BudgetsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BudgetsScreen: React.FC = () => {
  const navigation = useNavigation<BudgetsNavigationProp>();
  const {
    budgets,
    fetchBudgets,
    createBudget,
    deleteBudget,
    isLoading,
  } = useBudgetsStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newBudget, setNewBudget] = useState<BudgetCreate>({
    name: '',
    description: '',
    total_amount: 0,
    currency: 'EUR',
  });

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchBudgets();
    setIsRefreshing(false);
  };

  const handleCreateBudget = async () => {
    if (!newBudget.name.trim()) {
      Alert.alert('Erreur', 'Le nom du budget est requis');
      return;
    }

    const budget = await createBudget(newBudget);
    if (budget) {
      setIsModalVisible(false);
      setNewBudget({ name: '', description: '', total_amount: 0, currency: 'EUR' });
    }
  };

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      'Supprimer le budget',
      `Êtes-vous sûr de vouloir supprimer "${budget.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteBudget(budget.id),
        },
      ]
    );
  };

  const renderBudgetItem = ({ item }: { item: Budget }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BudgetDetail', { budgetId: item.id, budgetName: item.name })}
      onLongPress={() => handleDeleteBudget(item)}
    >
      <Card style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetIcon}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.budgetDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </View>

        <View style={styles.budgetStats}>
          <View style={styles.budgetStat}>
            <Text style={styles.budgetStatLabel}>Budget total</Text>
            <Text style={styles.budgetStatValue}>
              {formatCurrency(parseFloat(item.total_amount), item.currency)}
            </Text>
          </View>
          <View style={styles.budgetStat}>
            <Text style={styles.budgetStatLabel}>Créé le</Text>
            <Text style={styles.budgetStatValue}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && budgets.length === 0) {
    return <LoadingSpinner fullScreen message="Chargement des budgets..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Budget List */}
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={renderBudgetItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title="Aucun budget"
            message="Créez votre premier budget pour commencer à suivre vos finances"
            actionLabel="Créer un budget"
            onAction={() => setIsModalVisible(true)}
          />
        }
      />

      {/* Create Budget Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalCancel}>Annuler</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Nouveau budget</Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={styles.modalForm}>
              <TextInput
                label="Nom du budget"
                placeholder="Ex: Budget mensuel"
                value={newBudget.name}
                onChangeText={(text) => setNewBudget({ ...newBudget, name: text })}
              />

              <TextInput
                label="Description (optionnel)"
                placeholder="Ex: Suivi des dépenses mensuelles"
                value={newBudget.description}
                onChangeText={(text) => setNewBudget({ ...newBudget, description: text })}
                multiline
              />

              <TextInput
                label="Montant total"
                placeholder="0"
                value={newBudget.total_amount?.toString() || ''}
                onChangeText={(text) =>
                  setNewBudget({ ...newBudget, total_amount: parseFloat(text) || 0 })
                }
                keyboardType="numeric"
              />

              <TextInput
                label="Devise"
                placeholder="EUR"
                value={newBudget.currency}
                onChangeText={(text) => setNewBudget({ ...newBudget, currency: text })}
                autoCapitalize="characters"
              />

              <Button
                title="Créer le budget"
                onPress={handleCreateBudget}
                loading={isLoading}
                disabled={!newBudget.name.trim()}
              />
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
    flexGrow: 1,
  },
  budgetCard: {
    marginBottom: SPACING.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  budgetDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  budgetStat: {},
  budgetStatLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  budgetStatValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCancel: {
    color: COLORS.primary,
    fontSize: 16,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  modalForm: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
});
