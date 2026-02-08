import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { Button, TextInput, Loading, EmptyState, TransactionItem } from '../components'
import {
  useTransactionsStore,
  useBudgetsStore,
  useCategoriesStore,
  useAuthStore,
  selectPreferredCurrency,
} from '../stores'
import { colors, spacing, fontSize, borderRadius } from '../theme'
import { formatDateISO } from '../utils'
import type { Transaction, TransactionCreate, TransactionType } from '../types'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { MainTabParamList } from '../types'

type Props = BottomTabScreenProps<MainTabParamList, 'Transactions'>

export const TransactionsScreen: React.FC<Props> = () => {
  const {
    transactions,
    paginationInfo,
    isLoading,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
  } = useTransactionsStore()
  
  const { budgets, fetchBudgets } = useBudgetsStore()
  const { categories, fetchCategories } = useCategoriesStore()
  const preferredCurrency = useAuthStore(selectPreferredCurrency)
  
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('')
  const [newTransaction, setNewTransaction] = useState<Partial<TransactionCreate>>({
    amount: 0,
    type: 'expense',
    note: '',
    currency: preferredCurrency,
    occurred_at: formatDateISO(new Date()),
  })
  const [errors, setErrors] = useState<{ amount?: string; budget_id?: string }>({})

  useEffect(() => {
    fetchBudgets()
  }, [])

  useEffect(() => {
    if (budgets.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(budgets[0].id)
    }
  }, [budgets])

  useEffect(() => {
    if (selectedBudgetId) {
      fetchTransactions(selectedBudgetId)
      fetchCategories(selectedBudgetId)
    }
  }, [selectedBudgetId])

  const onRefresh = useCallback(() => {
    if (selectedBudgetId) {
      fetchTransactions(selectedBudgetId)
    }
  }, [selectedBudgetId])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    
    if (!newTransaction.amount || newTransaction.amount <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0'
    }
    
    if (!selectedBudgetId) {
      newErrors.budget_id = 'Veuillez sélectionner un budget'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateTransaction = async () => {
    if (!validate()) return
    
    const success = await createTransaction({
      ...newTransaction,
      budget_id: selectedBudgetId,
      amount: newTransaction.amount || 0,
      type: newTransaction.type || 'expense',
    } as TransactionCreate)
    
    if (success) {
      setModalVisible(false)
      setNewTransaction({
        amount: 0,
        type: 'expense',
        note: '',
        currency: preferredCurrency,
        occurred_at: formatDateISO(new Date()),
      })
      setErrors({})
      fetchTransactions(selectedBudgetId)
    } else {
      Alert.alert('Erreur', 'Impossible de créer la transaction')
    }
  }

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Supprimer la transaction',
      'Êtes-vous sûr de vouloir supprimer cette transaction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteTransaction(transaction.id)
            if (!success) {
              Alert.alert('Erreur', 'Impossible de supprimer la transaction')
            }
          },
        },
      ]
    )
  }

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={() => handleDeleteTransaction(item)}
      style={styles.transactionItem}
    />
  )

  if (isLoading && transactions.length === 0 && budgets.length === 0) {
    return <Loading fullScreen text="Chargement..." />
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Transactions</Text>
          <Text style={styles.subtitle}>{paginationInfo.total} transaction{paginationInfo.total !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          disabled={budgets.length === 0}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Budget Selector */}
      {budgets.length > 0 && (
        <View style={styles.budgetSelector}>
          <Text style={styles.selectorLabel}>Budget :</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedBudgetId}
              onValueChange={setSelectedBudgetId}
              style={styles.picker}
              dropdownIconColor={colors.neutral[400]}
            >
              {budgets.map((budget) => (
                <Picker.Item
                  key={budget.id}
                  label={budget.name}
                  value={budget.id}
                  color={colors.neutral[100]}
                />
              ))}
            </Picker>
          </View>
        </View>
      )}

      {/* Transaction List */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="wallet-outline" size={64} color={colors.neutral[600]} />}
          title="Aucun budget"
          description="Créez d'abord un budget pour ajouter des transactions"
          style={styles.emptyState}
        />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="receipt-outline" size={64} color={colors.neutral[600]} />}
          title="Aucune transaction"
          description="Ajoutez votre première transaction"
          action={
            <Button
              title="Ajouter une transaction"
              onPress={() => setModalVisible(true)}
            />
          }
          style={styles.emptyState}
        />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              tintColor={colors.primary[500]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Create Transaction Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nouvelle Transaction</Text>
            <TouchableOpacity onPress={handleCreateTransaction}>
              <Text style={styles.saveText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Transaction Type */}
            <View style={styles.typeSelector}>
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
                  color={newTransaction.type === 'expense' ? colors.danger[400] : colors.neutral[500]}
                />
                <Text
                  style={[
                    styles.typeText,
                    newTransaction.type === 'expense' && { color: colors.danger[400] },
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
                  color={newTransaction.type === 'income' ? colors.success[400] : colors.neutral[500]}
                />
                <Text
                  style={[
                    styles.typeText,
                    newTransaction.type === 'income' && { color: colors.success[400] },
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
              onChangeText={(text) => {
                const amount = parseFloat(text) || 0
                setNewTransaction({ ...newTransaction, amount })
                if (errors.amount) setErrors({ ...errors, amount: undefined })
              }}
              error={errors.amount}
              keyboardType="decimal-pad"
              leftIcon="cash-outline"
            />

            <TextInput
              label="Note (optionnel)"
              placeholder="ex: Courses supermarché"
              value={newTransaction.note}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, note: text })}
              leftIcon="document-text-outline"
            />

            {/* Category Selector */}
            {categories.length > 0 && (
              <View style={styles.categorySection}>
                <Text style={styles.inputLabel}>Catégorie (optionnel)</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newTransaction.category_id || ''}
                    onValueChange={(value) =>
                      setNewTransaction({ ...newTransaction, category_id: value || undefined })
                    }
                    style={styles.picker}
                    dropdownIconColor={colors.neutral[400]}
                  >
                    <Picker.Item label="Sans catégorie" value="" color={colors.neutral[400]} />
                    {categories.map((category) => (
                      <Picker.Item
                        key={category.id}
                        label={category.name}
                        value={category.id}
                        color={colors.neutral[100]}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            <View style={styles.currencyInfo}>
              <Ionicons name="information-circle-outline" size={16} color={colors.neutral[500]} />
              <Text style={styles.currencyText}>
                Devise : {preferredCurrency}
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[950],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.neutral[100],
    fontSize: fontSize['2xl'],
    fontWeight: '700',
  },
  subtitle: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  selectorLabel: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  picker: {
    color: colors.neutral[100],
    height: 44,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  transactionItem: {
    marginBottom: 0,
  },
  separator: {
    height: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[800],
  },
  modalTitle: {
    color: colors.neutral[100],
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  cancelText: {
    color: colors.neutral[400],
    fontSize: fontSize.base,
  },
  saveText: {
    color: colors.primary[400],
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  modalContent: {
    padding: spacing.lg,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[800],
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  typeButtonActive: {
    borderColor: 'transparent',
  },
  typeText: {
    color: colors.neutral[500],
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  categorySection: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    color: colors.neutral[300],
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  currencyText: {
    color: colors.neutral[500],
    fontSize: fontSize.sm,
  },
})
