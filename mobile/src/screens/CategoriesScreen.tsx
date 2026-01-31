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
import { useBudgetsStore, useCategoriesStore } from '../stores';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import type { Category, CategoryCreate } from '../types';

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#22C55E', // green
  '#EF4444', // red
  '#F59E0B', // amber
  '#A855F7', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export const CategoriesScreen: React.FC = () => {
  const { budgets, fetchBudgets } = useBudgetsStore();
  const {
    categories,
    fetchCategories,
    createCategory,
    deleteCategory,
    isLoading,
  } = useCategoriesStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<Omit<CategoryCreate, 'budget_id'>>({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
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
      fetchCategories(selectedBudgetId);
    }
  }, [selectedBudgetId, fetchCategories]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    if (selectedBudgetId) {
      await fetchCategories(selectedBudgetId);
    }
    setIsRefreshing(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim() || !selectedBudgetId) {
      Alert.alert('Erreur', 'Le nom de la catégorie est requis');
      return;
    }

    const category = await createCategory({
      ...newCategory,
      budget_id: selectedBudgetId,
    });

    if (category) {
      setIsModalVisible(false);
      setNewCategory({ name: '', description: '', color: PRESET_COLORS[0] });
    }
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      'Supprimer la catégorie',
      `Êtes-vous sûr de vouloir supprimer "${category.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteCategory(category.id),
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity onLongPress={() => handleDeleteCategory(item)}>
      <Card style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <View
            style={[
              styles.categoryColor,
              { backgroundColor: item.color || COLORS.primary },
            ]}
          />
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.categoryDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => handleDeleteCategory(item)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (budgets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Catégories</Text>
        </View>
        <EmptyState
          icon="folder-outline"
          title="Aucun budget"
          message="Créez d'abord un budget pour pouvoir ajouter des catégories"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Catégories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
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

      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
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
            <LoadingSpinner message="Chargement des catégories..." />
          ) : (
            <EmptyState
              icon="folder-outline"
              title="Aucune catégorie"
              message="Ajoutez des catégories pour organiser vos transactions"
              actionLabel="Ajouter une catégorie"
              onAction={() => setIsModalVisible(true)}
            />
          )
        }
      />

      {/* Create Category Modal */}
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
              <Text style={styles.modalTitle}>Nouvelle catégorie</Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={styles.modalForm}>
              <TextInput
                label="Nom de la catégorie"
                placeholder="Ex: Alimentation"
                value={newCategory.name}
                onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
              />

              <TextInput
                label="Description (optionnel)"
                placeholder="Ex: Courses et restaurants"
                value={newCategory.description}
                onChangeText={(text) => setNewCategory({ ...newCategory, description: text })}
                multiline
              />

              {/* Color Selection */}
              <View>
                <Text style={styles.colorLabel}>Couleur</Text>
                <View style={styles.colorGrid}>
                  {PRESET_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newCategory.color === color && styles.colorOptionActive,
                      ]}
                      onPress={() => setNewCategory({ ...newCategory, color })}
                    >
                      {newCategory.color === color && (
                        <Ionicons name="checkmark" size={20} color={COLORS.text} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button
                title="Créer la catégorie"
                onPress={handleCreateCategory}
                loading={isLoading}
                disabled={!newCategory.name.trim()}
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
  categoryCard: {
    marginBottom: SPACING.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 16,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  categoryDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
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
  colorLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: COLORS.text,
  },
});
