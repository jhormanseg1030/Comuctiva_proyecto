import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

// Importar la imagen real del logo
const logoImage = require('../assets/images/logo.jpeg');

interface ComuctivaLogoProps {
  size?: 'small' | 'medium' | 'large';
}

const ComuctivaLogo: React.FC<ComuctivaLogoProps> = ({ 
  size = 'medium'
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return { width: 50, height: 50 };
      case 'large': return { width: 150, height: 150 };
      default: return { width: 100, height: 100 };
    }
  };

  const dimensions = getSize();

  // Usar la imagen real del logo
  return (
    <View style={[styles.container, { width: dimensions.width, height: dimensions.height }]}>
      <Image 
        source={logoImage} 
        style={[styles.logoImage, { 
          width: dimensions.width, 
          height: dimensions.height,
          borderRadius: dimensions.width / 2 
        }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoImage: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

export default ComuctivaLogo;