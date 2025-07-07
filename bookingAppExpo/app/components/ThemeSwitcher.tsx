import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext'; // Sesuaikan path

const ThemeSwitcher: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Pressable
      style={[styles.container, { backgroundColor: isDarkMode ? '#374151' : '#ffffff' }]}
      onPress={toggleTheme}
    >
      <Text style={styles.emoji}>
        {isDarkMode ? '☀️' : '🌙'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 20,
  },
});

export default ThemeSwitcher;