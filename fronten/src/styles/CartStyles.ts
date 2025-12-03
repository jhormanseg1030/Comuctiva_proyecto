import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, Border, Shadows } from './GlobalStyles';

const { width } = Dimensions.get('window');

export const cartStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfdf5',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    ...Shadows.small,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: Border.radius.full,
    backgroundColor: '#f0fdf4',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  clearButton: {
    padding: Spacing.sm,
    borderRadius: Border.radius.full,
    backgroundColor: '#fef2f2',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.gray[700],
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Border.radius.lg,
    ...Shadows.medium,
  },
  shopButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Items List
  itemsList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  itemsHeader: {
    paddingVertical: Spacing.md,
  },
  itemsCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[600],
    fontWeight: Typography.fontWeight.medium,
  },

  // Cart Item
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Border.radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: Border.radius.md,
    backgroundColor: Colors.gray[100],
  },
  productInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  productName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  productPrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#16a34a',
    marginBottom: Spacing.xs,
  },
  productDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[600],
    lineHeight: 18,
  },

  // Quantity Controls
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: Border.radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginRight: Spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: Border.radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  quantityText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.black,
    marginHorizontal: Spacing.md,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: Spacing.sm,
    borderRadius: Border.radius.full,
    backgroundColor: '#fef2f2',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  removeButtonText: {
    fontSize: 18,
  },
  backButtonText: {
    fontSize: 24,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  clearButtonText: {
    fontSize: 20,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },

  // Summary
  summary: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    ...Shadows.large,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.black,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.black,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#16a34a',
  },
  checkoutButton: {
    backgroundColor: '#16a34a',
    paddingVertical: Spacing.lg,
    borderRadius: Border.radius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    ...Shadows.medium,
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    marginTop: Spacing.md,
  },
});