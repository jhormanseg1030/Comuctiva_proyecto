// @ts-nocheck
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateProductScreen from './src/screens/CreateProductScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import PublishProductScreen from './src/screens/PublishProductScreen';
import PublishedProductsScreen from './src/screens/PublishedProductsScreen';
import SalesReportScreen from './src/screens/SalesReportScreen';
import SaleDetailScreen from './src/screens/SaleDetailScreen';
import PurchasesScreen from './src/screens/PurchasesScreen';
import PurchaseDetailScreen from './src/screens/PurchaseDetailScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
          <Stack.Screen name="ProductList" component={ProductListScreen} />
          <Stack.Screen name="PublishProduct" component={PublishProductScreen} />
          <Stack.Screen name="PublishedProducts" component={PublishedProductsScreen} />
          <Stack.Screen name="SalesReport" component={SalesReportScreen} />
          <Stack.Screen name="SaleDetail" component={SaleDetailScreen} />
          <Stack.Screen name="Purchases" component={PurchasesScreen} />
          <Stack.Screen name="PurchaseDetail" component={PurchaseDetailScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
