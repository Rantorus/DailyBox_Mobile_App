import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext'

const ThemedBtn = ({ style, ...props }) => {
  const { themeName } = useTheme();
  const theme = Colors[themeName]
  return (
    <Pressable style={({ pressed }) => [{ backgroundColor: theme.buttonBackground }, styles.btn, pressed && styles.pressed,
      style]}
      {...props}

    />
  )
}

export default ThemedBtn

const styles = StyleSheet.create({
  btn: {
    padding: 20,
    borderRadius: 7
  },
  pressed: {
    opacity: 0.8
  }
})