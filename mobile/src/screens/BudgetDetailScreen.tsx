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
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Card, Button, TextInput, LoadingSpinner, EmptyState, ErrorMessage } from '../components';
import { useBudgetsStore, useCategoriesStore, useTransactionsStore } from '../stores';
import { transactionService } from '../services';
import { formatCurrency, formatDate } from '../utils';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import type { RootStackParamList } from '../navigation/types';
import type { Transaction, TransactionCreate, TransactionSummary, Category } from '../types';

type BudgetDetailRouteProp = RouteProp<RootStackParamList, 'BudgetDetail'>;

export const BudgetDetailScreen: React.FC = () => {
  const route = useRoute<BudgetDetailRouteProp>();
  const navigation = useNavigation();
  const { budgetId, budgetName } = route.params;

  const { selectedBudget, fetchBudget, isLoading: budgetLoading } = useBudgetsStore();
  const { categories, fetchCategories, isLoading: categoriesLoading } = useCategoriesStore();
  const {
    transactions,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
    isLoading: transactionsLoading,
    total,
    page,
    pages,
  } = useTransactionsStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
    incomeCount: 0,
    expenseCount: 0,
  });
  const [newTransaction, setNewTransaction] = useState<TransactionCreate>({
    amount: 0,
    type: 'expense',
    note: '',
    budget_id: budgetId,
    category_id: undefined,
  });

  useEffect(() => {
    navigation.setOptions({ title: budgetName });
  }, [navigation, budgetName]);

  useEffect(() => {
    loadData();
  }, [budgetId]);

  useEffect(() => {
    // Calculate summary when transactions change
    const calculatedSummary = transactionService.calculateSummary(transactions);
    setSummary(calculatedSummary);
  }, [transactions]);

  const loadData = async () => {
    await Promise.all([
      fetchBudget(budgetId),
      fetchCategories(budgetId),
      fetchTransactions(budgetId),
    ]);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleCreateTransaction = async () => {
    if (newTransaction.amount <= 0) {
      Alert.alert('Erreur', 'Le montant doit être supérieur à 0');
      return;
    }

    const transaction = await createTransaction({
      ...newTransaction,
      budget_id: budgetId,
    });

    if (transaction) {
      setIsModalVisible(false);
      setNewTransaction({
        amount: 0,
        type: 'expense',
        note: '',
        budget_id: budgetId,
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

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const category = categories.find((c) => c.id === item.category_id);

    return (
      <TouchableOpacity onLongPress={() => handleDeleteTransaction(item)}>
        <View style={styles.transactionItem}>
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
              size={16}
              color={item.type === 'income' ? COLORS.success : COLORS.error}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionNote}>{item.note || 'Transaction'}</Text>
            <View style={styles.transactionMeta}>
              <Text style={styles.transactionDate}>{formatDate(item.occurred_at)}</Text>
              {category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{category.name}</Text>
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
      </TouchableOpacity>
    );
  };

  const isLoading = budgetLoading || categoriesLoading || transactionsLoading;

  if (isLoading && transactions.length === 0) {
    return <LoadingSpinner fullScreen message="Chargement du budget..." />;
  }

  const budgetAmount = selectedBudget ? parseFloat(selectedBudget.total_amount) : 0;
  const utilization = budgetAmount > 0 ? (summary.totalExpenses / budgetAmount) * 100 : 0;
  const isOverBudget = summary.totalExpenses > budgetAmount;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
        ListHeaderComponent={
          <>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Revenus</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                  {formatCurrency(summary.totalIncome)}
                </Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Dépenses</Text>
                <Text style={[styles.summaryValue, { color: COLORS.error }]}>
                  {formatCurrency(summary.totalExpenses)}
                </Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Solde</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: summary.balance >= 0 ? COLORS.success : COLORS.error },
                  ]}
                >
                  {formatCurrency(summary.balance)}
                </Text>
              </Card>
            </View>

            {/* Budget Progress */}
            {budgetAmount > 0 && (
              <Card style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Utilisation du budget</Text>
                  <Text
                    style={[
                      styles.progressPercent,
                      { color: isOverBudget ? COLORS.error : COLORS.success },
                    ]}
                  >
                    {utilization.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(utilization, 100)}%`,
                        backgroundColor: isOverBudget
                          ? COLORS.error
                          : utilization > 80
                          ? COLORS.warning
                          : COLORS.success,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {formatCurrency(summary.totalExpenses)} sur {formatCurrency(budgetAmount)}
                </Text>
              </Card>
            )}

            {/* Transactions Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transactions ({total})</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Aucune transaction"
            message="Ajoutez votre première transaction"
            actionLabel="Ajouter une transaction"
            onAction={() => setIsModalVisible(true)}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={28} color={COLORS.text} />
      </TouchableOpacity>

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
                loading={transactionsLoading}
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
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressCard: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
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
    marginTop: 2,
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
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
