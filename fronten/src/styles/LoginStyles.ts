import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Border, Shadows } from './GlobalStyles';

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfdf5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: Spacing.lg,
  },
  
  // Header con logo/título
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#22c55e',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#16a34a',
    ...Shadows.large,
    position: 'relative',
  },
  logoTopText: {
    position: 'absolute',
    top: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    letterSpacing: 1,
  },
  logoBottomText: {
    position: 'absolute',
    bottom: 6,
    fontSize: 8,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  innerLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  complexLogo: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing1: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  logoRing2: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  logoLetter: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#22c55e',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textShadowColor: '#16a34a',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'System',
  },
  appSubtitle: {
    fontSize: Typography.fontSize.base,
    color: '#16a34a',
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Formulario
  formContainer: {
    backgroundColor: '#e6f7ed',
    borderRadius: Border.radius.xl,
    padding: Spacing.xl,
    ...Shadows.large,
  },
  formTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  formSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  
  // Campos de entrada
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.gray[700],
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderWidth: Border.width.thin,
    borderColor: Colors.gray[300],
    borderRadius: Border.radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: '#16a34a',
    borderWidth: Border.width.medium,
    backgroundColor: Colors.white,
  },
  inputIcon: {
    fontSize: Typography.fontSize.lg,
    color: Colors.gray[400],
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.black,
    paddingVertical: Spacing.sm,
  },
  
  // Botones
  buttonContainer: {
    marginTop: Spacing.lg,
  },
  loginButton: {
    backgroundColor: '#16a34a',
    borderRadius: Border.radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.medium,
  },
  loginButtonPressed: {
    backgroundColor: '#15803d',
    transform: [{ scale: 0.98 }],
  },
  loginButtonDisabled: {
    backgroundColor: Colors.gray[400],
    opacity: 0.6,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  
  // Estados de carga y error
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  loadingText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    marginLeft: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  errorContainer: {
    backgroundColor: Colors.error,
    borderRadius: Border.radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    marginRight: Spacing.sm,
  },
  errorText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    flex: 1,
    fontWeight: Typography.fontWeight.medium,
  },
  
  // // Footer
  // footerContainer: {
  //   marginTop: Spacing.xl,
  //   alignItems: 'center',
  // },
  // footerText: {
  //   color: 'rgba(255, 255, 255, 0.7)',
  //   fontSize: Typography.fontSize.sm,
  //   textAlign: 'center',
  // },
  
  // // Credenciales de prueba
  // credentialsContainer: {
  //   backgroundColor: 'rgba(255, 255, 255, 0.1)',
  //   borderRadius: Border.radius.lg,
  //   padding: Spacing.md,
  //   marginTop: Spacing.lg,
  // },
  // credentialsTitle: {
  //   color: Colors.white,
  //   fontSize: Typography.fontSize.sm,
  //   fontWeight: Typography.fontWeight.bold,
  //   textAlign: 'center',
  //   marginBottom: Spacing.sm,
  // },
  // credentialsText: {
  //   color: 'rgba(255, 255, 255, 0.8)',
  //   fontSize: Typography.fontSize.sm,
  //   textAlign: 'center',
  //   lineHeight: 20,
  // },
});