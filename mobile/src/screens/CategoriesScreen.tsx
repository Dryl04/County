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
import { Button, TextInput, Loading, EmptyState, CategoryItem } from '../components'
import { useCategoriesStore, useBudgetsStore, useTransactionsStore } from '../stores'
import { colors, spacing, fontSize, borderRadius } from '../theme'
import { generateRandomColor } from '../utils'
import type { Category, CategoryCreate } from '../types'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { MainTabParamList } from '../types'

type Props = BottomTabScreenProps<MainTabParamList, 'Categories'>

const colorOptions = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#6366f1',
  '#0ea5e9', '#f43f5e', '#84cc16', '#a855f7',
]

export const CategoriesScreen: React.FC<Props> = () => {
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesStore()
  
  const { budgets, fetchBudgets } = useBudgetsStore()
  const { fetchAllTransactions } = useTransactionsStore()
  
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<Partial<CategoryCreate>>({
    name: '',
    description: '',
    color: generateRandomColor(),
  })
  const [categoryTransactionCounts, setCategoryTransactionCounts] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<{ name?: string }>({})

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
      fetchCategories(selectedBudgetId)
      loadTransactionCounts()
    }
  }, [selectedBudgetId])

  const loadTransactionCounts = async () => {
    if (!selectedBudgetId) return
    
    const transactions = await fetchAllTransactions(selectedBudgetId)
    const counts: Record<string, number> = {}
    
    transactions.forEach((t) => {
      if (t.category_id) {
        counts[t.category_id] = (counts[t.category_id] || 0) + 1
      }
    })
    
    setCategoryTransactionCounts(counts)
  }

  const onRefresh = useCallback(() => {
    if (selectedBudgetId) {
      fetchCategories(selectedBudgetId)
      loadTransactionCounts()
    }
  }, [selectedBudgetId])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    
    if (!newCategory.name || newCategory.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setNewCategory({
        name: category.name,
        description: category.description,
        color: category.color || generateRandomColor(),
      })
    } else {
      setEditingCategory(null)
      setNewCategory({
        name: '',
        description: '',
        color: generateRandomColor(),
      })
    }
    setErrors({})
    setModalVisible(true)
  }

  const handleSaveCategory = async () => {
    if (!validate()) return
    
    let success: boolean
    
    if (editingCategory) {
      success = await updateCategory(editingCategory.id, {
        name: newCategory.name?.trim(),
        description: newCategory.description,
        color: newCategory.color,
      })
    } else {
      success = await createCategory({
        ...newCategory,
        name: newCategory.name?.trim() || '',
        budget_id: selectedBudgetId,
      } as CategoryCreate)
    }
    
    if (success) {
      setModalVisible(false)
      setEditingCategory(null)
      setNewCategory({ name: '', description: '', color: generateRandomColor() })
      setErrors({})
    } else {
      Alert.alert('Erreur', `Impossible de ${editingCategory ? 'modifier' : 'créer'} la catégorie`)
    }
  }

  const handleDeleteCategory = (category: Category) => {
    const count = categoryTransactionCounts[category.id] || 0
    
    Alert.alert(
      'Supprimer la catégorie',
      count > 0
        ? `Cette catégorie contient ${count} transaction${count > 1 ? 's' : ''}. Les transactions seront conservées sans catégorie.`
        : `Êtes-vous sûr de vouloir supprimer "${category.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCategory(category.id)
            if (!success) {
              Alert.alert('Erreur', 'Impossible de supprimer la catégorie')
            }
          },
        },
      ]
    )
  }

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <CategoryItem
      category={item}
      onEdit={() => handleOpenModal(item)}
      onDelete={() => handleDeleteCategory(item)}
      transactionCount={categoryTransactionCounts[item.id]}
      style={styles.categoryItem}
    />
  )

  if (isLoading && categories.length === 0 && budgets.length === 0) {
    return <Loading fullScreen text="Chargement..." />
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Catégories</Text>
          <Text style={styles.subtitle}>{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleOpenModal()}
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

      {/* Category List */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="wallet-outline" size={64} color={colors.neutral[600]} />}
          title="Aucun budget"
          description="Créez d'abord un budget pour ajouter des catégories"
          style={styles.emptyState}
        />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="pricetag-outline" size={64} color={colors.neutral[600]} />}
          title="Aucune catégorie"
          description="Ajoutez des catégories pour organiser vos transactions"
          action={
            <Button
              title="Ajouter une catégorie"
              onPress={() => handleOpenModal()}
            />
          }
          style={styles.emptyState}
        />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
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

      {/* Create/Edit Category Modal */}
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
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Modifier' : 'Nouvelle'} Catégorie
            </Text>
            <TouchableOpacity onPress={handleSaveCategory}>
              <Text style={styles.saveText}>{editingCategory ? 'Modifier' : 'Créer'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              label="Nom de la catégorie"
              placeholder="ex: Alimentation"
              value={newCategory.name}
              onChangeText={(text) => {
                setNewCategory({ ...newCategory, name: text })
                if (errors.name) setErrors({ ...errors, name: undefined })
              }}
              error={errors.name}
              leftIcon="pricetag-outline"
            />

            <TextInput
              label="Description (optionnel)"
              placeholder="ex: Courses et restaurants"
              value={newCategory.description}
              onChangeText={(text) => setNewCategory({ ...newCategory, description: text })}
              leftIcon="document-text-outline"
            />

            {/* Color Selector */}
            <View style={styles.colorSection}>
              <Text style={styles.inputLabel}>Couleur</Text>
              <View style={styles.colorGrid}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newCategory.color === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setNewCategory({ ...newCategory, color })}
                  >
                    {newCategory.color === color && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.inputLabel}>Aperçu</Text>
              <CategoryItem
                category={{
                  id: 'preview',
                  name: newCategory.name || 'Nom de la catégorie',
                  description: newCategory.description,
                  color: newCategory.color,
                  budget_id: selectedBudgetId,
                  created_at: new Date().toISOString(),
                }}
              />
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
  categoryItem: {
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
  colorSection: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: colors.neutral[300],
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.neutral[100],
  },
  previewSection: {
    marginTop: spacing.md,
  },
})
