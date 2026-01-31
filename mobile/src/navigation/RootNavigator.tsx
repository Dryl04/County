import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { BudgetDetailScreen } from '../screens';
import { useAuthStore } from '../stores';
import { setLogoutCallback } from '../services';
import { LoadingSpinner } from '../components';
import { COLORS } from '../constants';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, checkAuth, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    initAuth();

    // Set up logout callback for token expiration
    setLogoutCallback(() => {
      logout();
    });
  }, [checkAuth, logout]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Chargement..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BudgetDetail"
              component={BudgetDetailScreen}
              options={({ route }) => ({
                title: route.params.budgetName,
                headerBackTitle: 'Retour',
              })}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
