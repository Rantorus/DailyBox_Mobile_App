import { Keyboard, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext'

const ThemedInput = ({ style, ...props }) => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    const [isFocused, setIsFocused] = useState(false)
    return ( 
        <TextInput
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
                {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    padding: 20,
                    borderRadius: 15,
                    borderWidth: isFocused ? 2 : 1,
                    borderColor: isFocused ? theme.primary : theme.border,
                },
                style
            ]}
            {...props}
        />
        
    )
}

export default ThemedInput

const styles = StyleSheet.create({})