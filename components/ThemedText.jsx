import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors,selectedThemeString } from '../constants/Colors'

const ThemedText = ({ style, title = false, ...props }) => {
    const theme = Colors[selectedThemeString];

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