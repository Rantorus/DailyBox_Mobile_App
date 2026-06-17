import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Colors,selectedThemeString } from '../constants/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ThemedView = ({style, safe=false, ...props}) => {
    const theme = Colors[selectedThemeString];
    

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