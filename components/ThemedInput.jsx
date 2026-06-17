import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { Colors,selectedThemeString } from '../constants/Colors'

const ThemedInput = ({ style, ...props }) => {
    const theme = Colors[selectedThemeString];
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