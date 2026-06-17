import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import React from 'react'
import { Slot, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Colors,selectedThemeString } from '../constants/Colors'

const RootLayout = () => {

    const theme = Colors[selectedThemeString]

    return (
        <>
            <StatusBar style={theme.statusBarStyle} backgroundColor={theme.headerBackground} />
            <Stack screenOptions={{
                headerStyle: { backgroundColor: theme.headerBackground },
                headerTintColor: theme.text
            }}>
                <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ title: "Daily Box" }} />
            </Stack>
        </>

    )
}

export default RootLayout

const styles = StyleSheet.create({})