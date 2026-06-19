import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ThemedView = ({style, safe=false, ...props}) => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    
    if(!safe){
        return (
    <View 
        style={[{backgroundColor:theme.background},style]}
        {...props}
    
    />
  )
    }

    const insets = useSafeAreaInsets()

    return(
        <View 
        style={[{
            backgroundColor:theme.background,
            paddingTop:insets.top,
            paddingBottom:insets.bottom

        },style]}
        {...props}
    
    />

    )
  
}

export default ThemedView

const styles = StyleSheet.create({})