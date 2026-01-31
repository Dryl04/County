import React, { useEffect, useState } from 'react';
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
import { Card, Button, TextInput, LoadingSpinner, EmptyState } from '../components';
import { useBudgetsStore, useCategoriesStore, useTransactionsStore } from '../stores';
import { formatCurrency, formatDate } from '../utils';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import type { Transaction, TransactionCreate } from '../types';

export const TransactionsScreen: React.FC = () => {
  const { budgets, fetchBudgets } = useBudgetsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const {
    transactions,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
    isLoading,
    total,
  } = useTransactionsStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState<TransactionCreate>({
    amount: 0,
    type: 'expense',
    note: '',
    budget_id: '',
    category_id: undefined,
  });

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  useEffect(() => {
    if (budgets.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(budgets[0].id);
    }
  }, [budgets, selectedBudgetId]);

  useEffect(() => {
    if (selectedBudgetId) {
      fetchTransactions(selectedBudgetId);
      fetchCategories(selectedBudgetId);
    }
  }, [selectedBudgetId, fetchTransactions, fetchCategories]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    if (selectedBudgetId) {
      await fetchTransactions(selectedBudgetId);
    }
    setIsRefreshing(false);
  };

  const handleCreateTransaction = async () => {
    if (newTransaction.amount <= 0 || !selectedBudgetId) {
      Alert.alert('Erreur', 'Le montant doit être supérieur à 0');
      return;
    }

    const transaction = await createTransaction({
      ...newTransaction,
      budget_id: selectedBudgetId,
    });

    if (transaction) {
      setIsModalVisible(false);
      setNewTransaction({
        amount: 0,
        type: 'expense',
        note: '',
        budget_id: selectedBudgetId,
        category_id: undefined,
      });
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Supprimer la transaction',
      'Êtes-vous sûr de vouloir supprimer cette transaction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteTransaction(transaction.id),
        },
      ]
    );
  };

  const openCreateModal = () => {
    if (selectedBudgetId) {
      setNewTransaction({
        ...newTransaction,
        budget_id: selectedBudgetId,
      });
      setIsModalVisible(true);
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const category = categories.find((c) => c.id === item.category_id);

    return (
      <TouchableOpacity onLongPress={() => handleDeleteTransaction(item)}>
        <Card style={styles.transactionCard}>
          <View style={styles.transactionHeader}>
            <View
              style={[
                styles.transactionIcon,
                {
                  backgroundColor:
                    item.type === 'income'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                },
              ]}
            >
              <Ionicons
                name={item.type === 'income' ? 'arrow-up' : 'arrow-down'}
                size={20}
                color={item.type === 'income' ? COLORS.success : COLORS.error}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionNote}>{item.note || 'Transaction'}</Text>
              <View style={styles.transactionMeta}>
                <Text style={styles.transactionDate}>{formatDate(item.occurred_at)}</Text>
                {category && (
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: category.color ? `${category.color}30` : undefined },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        { color: category.color || COLORS.textSecondary },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.type === 'income' ? COLORS.success : COLORS.error },
              ]}
            >
              {item.type === 'income' ? '+' : '-'}
              {formatCurrency(parseFloat(item.amount), item.currency)}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (budgets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
        </View>
        <EmptyState
          icon="receipt-outline"
          title="Aucun budget"
          message="Créez d'abord un budget pour pouvoir ajouter des transactions"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transactions</Text>
          <Text style={styles.subtitle}>{total} transaction(s)</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Budget Selector */}
      <View style={styles.budgetSelector}>
        <FlatList
          horizontal
          data={budgets}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.budgetSelectorContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.budgetChip,
                selectedBudgetId === item.id && styles.budgetChipActive,
              ]}
              onPress={() => setSelectedBudgetId(item.id)}
            >
              <Text
                style={[
                  styles.budgetChipText,
                  selectedBudgetId === item.id && styles.budgetChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingSpinner message="Chargement des transactions..." />
          ) : (
            <EmptyState
              icon="receipt-outline"
              title="Aucune transaction"
              message="Ajoutez votre première transaction"
              actionLabel="Ajouter une transaction"
              onAction={openCreateModal}
            />
          )
        }
      />

      {/* Create Transaction Modal */}
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
              <Text style={styles.modalTitle}>Nouvelle transaction</Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={styles.modalForm}>
              {/* Transaction Type Toggle */}
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newTransaction.type === 'expense' && styles.typeButtonActive,
                    newTransaction.type === 'expense' && { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
                  ]}
                  onPress={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                >
                  <Ionicons
                    name="arrow-down"
                    size={20}
                    color={newTransaction.type === 'expense' ? COLORS.error : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: newTransaction.type === 'expense' ? COLORS.error : COLORS.textMuted },
                    ]}
                  >
                    Dépense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newTransaction.type === 'income' && styles.typeButtonActive,
                    newTransaction.type === 'income' && { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
                  ]}
                  onPress={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={newTransaction.type === 'income' ? COLORS.success : COLORS.textMuted}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: newTransaction.type === 'income' ? COLORS.success : COLORS.textMuted },
                    ]}
                  >
                    Revenu
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                label="Montant"
                placeholder="0.00"
                value={newTransaction.amount ? newTransaction.amount.toString() : ''}
                onChangeText={(text) =>
                  setNewTransaction({ ...newTransaction, amount: parseFloat(text) || 0 })
                }
                keyboardType="numeric"
                leftIcon="cash-outline"
              />

              <TextInput
                label="Note (optionnel)"
                placeholder="Ex: Courses supermarché"
                value={newTransaction.note}
                onChangeText={(text) => setNewTransaction({ ...newTransaction, note: text })}
                leftIcon="document-text-outline"
              />

              {/* Category Selection */}
              {categories.length > 0 && (
                <View>
                  <Text style={styles.categoryLabel}>Catégorie (optionnel)</Text>
                  <View style={styles.categoryGrid}>
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        !newTransaction.category_id && styles.categoryChipActive,
                      ]}
                      onPress={() => setNewTransaction({ ...newTransaction, category_id: undefined })}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          !newTransaction.category_id && styles.categoryChipTextActive,
                        ]}
                      >
                        Aucune
                      </Text>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          newTransaction.category_id === cat.id && styles.categoryChipActive,
                          cat.color && newTransaction.category_id === cat.id && { backgroundColor: cat.color },
                        ]}
                        onPress={() => setNewTransaction({ ...newTransaction, category_id: cat.id })}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            newTransaction.category_id === cat.id && styles.categoryChipTextActive,
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <Button
                title="Créer la transaction"
                onPress={handleCreateTransaction}
                loading={isLoading}
                disabled={newTransaction.amount <= 0}
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
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetSelector: {
    marginBottom: SPACING.md,
  },
  budgetSelectorContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  budgetChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  budgetChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  budgetChipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  budgetChipTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
    flexGrow: 1,
  },
  transactionCard: {
    marginBottom: SPACING.sm,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 4,
  },
  transactionDate: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  categoryBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
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
  typeToggle: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    borderColor: 'transparent',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },
});
