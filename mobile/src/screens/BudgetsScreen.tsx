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
import { Button, TextInput, Loading, EmptyState, BudgetCard } from '../components'
import { useBudgetsStore, useTransactionsStore, useAuthStore, selectPreferredCurrency } from '../stores'
import { colors, spacing, fontSize, borderRadius } from '../theme'
import type { Budget, BudgetCreate } from '../types'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { MainTabParamList } from '../types'

type Props = BottomTabScreenProps<MainTabParamList, 'Budgets'>

export const BudgetsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    budgets,
    isLoading,
    fetchBudgets,
    createBudget,
    deleteBudget,
  } = useBudgetsStore()
  
  const { fetchAllTransactions } = useTransactionsStore()
  const preferredCurrency = useAuthStore(selectPreferredCurrency)
  
  const [modalVisible, setModalVisible] = useState(false)
  const [newBudget, setNewBudget] = useState<BudgetCreate>({
    name: '',
    description: '',
    total_amount: 0,
    currency: preferredCurrency,
  })
  const [budgetSpent, setBudgetSpent] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<{ name?: string; total_amount?: string }>({})

  useEffect(() => {
    fetchBudgets()
  }, [])

  useEffect(() => {
    // Load spent amounts for each budget
    const loadSpentAmounts = async () => {
      const spent: Record<string, number> = {}
      for (const budget of budgets) {
        const transactions = await fetchAllTransactions(budget.id)
        spent[budget.id] = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      }
      setBudgetSpent(spent)
    }
    if (budgets.length > 0) {
      loadSpentAmounts()
    }
  }, [budgets])

  const onRefresh = useCallback(() => {
    fetchBudgets()
  }, [])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    
    if (!newBudget.name || newBudget.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }
    
    if (!newBudget.total_amount || newBudget.total_amount <= 0) {
      newErrors.total_amount = 'Le montant doit être supérieur à 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateBudget = async () => {
    if (!validate()) return
    
    const success = await createBudget({
      ...newBudget,
      name: newBudget.name.trim(),
    })
    
    if (success) {
      setModalVisible(false)
      setNewBudget({ name: '', description: '', total_amount: 0, currency: preferredCurrency })
      setErrors({})
    } else {
      Alert.alert('Erreur', 'Impossible de créer le budget')
    }
  }

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      'Supprimer le budget',
      `Êtes-vous sûr de vouloir supprimer "${budget.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteBudget(budget.id)
            if (!success) {
              Alert.alert('Erreur', 'Impossible de supprimer le budget')
            }
          },
        },
      ]
    )
  }

  const renderBudgetItem = ({ item }: { item: Budget }) => (
    <BudgetCard
      budget={item}
      spent={budgetSpent[item.id] || 0}
      onPress={() => {
        // Could navigate to budget detail screen
      }}
      style={styles.budgetCard}
    />
  )

  if (isLoading && budgets.length === 0) {
    return <Loading fullScreen text="Chargement des budgets..." />
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mes Budgets</Text>
          <Text style={styles.subtitle}>{budgets.length} budget{budgets.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Budget List */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="wallet-outline" size={64} color={colors.neutral[600]} />}
          title="Aucun budget"
          description="Créez votre premier budget pour commencer à suivre vos dépenses"
          action={
            <Button
              title="Créer un budget"
              onPress={() => setModalVisible(true)}
            />
          }
          style={styles.emptyState}
        />
      ) : (
        <FlatList
          data={budgets}
          renderItem={renderBudgetItem}
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

      {/* Create Budget Modal */}
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
            <Text style={styles.modalTitle}>Nouveau Budget</Text>
            <TouchableOpacity onPress={handleCreateBudget}>
              <Text style={styles.saveText}>Créer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              label="Nom du budget"
              placeholder="ex: Budget mensuel"
              value={newBudget.name}
              onChangeText={(text) => {
                setNewBudget({ ...newBudget, name: text })
                if (errors.name) setErrors({ ...errors, name: undefined })
              }}
              error={errors.name}
              leftIcon="wallet-outline"
            />

            <TextInput
              label="Description (optionnel)"
              placeholder="ex: Dépenses courantes"
              value={newBudget.description}
              onChangeText={(text) => setNewBudget({ ...newBudget, description: text })}
              leftIcon="document-text-outline"
            />

            <TextInput
              label="Montant total"
              placeholder="0.00"
              value={newBudget.total_amount ? newBudget.total_amount.toString() : ''}
              onChangeText={(text) => {
                const amount = parseFloat(text) || 0
                setNewBudget({ ...newBudget, total_amount: amount })
                if (errors.total_amount) setErrors({ ...errors, total_amount: undefined })
              }}
              error={errors.total_amount}
              keyboardType="decimal-pad"
              leftIcon="cash-outline"
            />

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
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  budgetCard: {
    marginBottom: 0,
  },
  separator: {
    height: spacing.md,
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
