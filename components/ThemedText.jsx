import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext'

const ThemedText = ({ style, title = false, ...props }) => {

    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const textColor = title ? theme.text : theme.textLight

    return (

        <Text
            style={[{color:textColor},style]}
            {...props}
        />

    )
}

export default ThemedText

const styles = StyleSheet.create({})