import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import ComuctivaLogo from '../components/ComuctivaLogo';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  navigation: any;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000); // 3 segundos de splash

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Logo de Comuctiva */}
        <ComuctivaLogo size="large" />
        
        <Text style={styles.appTitle}>COMUCTIVA</Text>
        <Text style={styles.subtitle}>Tu comercio local digital</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.loadingText}>Cargando...</Text>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },

  appTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#22c55e',
    letterSpacing: 4,
    textShadowColor: '#16a34a',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    marginBottom: 12,
    textTransform: 'uppercase',
    textAlign: 'center',
    // Simular gradiente con múltiples sombras
    textDecorationLine: 'none',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
  indicator: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 4,
  },
  dot1: {
    // Animación se puede agregar después
  },
  dot2: {
    // Animación se puede agregar después
  },
  dot3: {
    // Animación se puede agregar después
  },
});

export default SplashScreen;