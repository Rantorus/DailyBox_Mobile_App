import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import ThemedInput from '../components/ThemedInput'
import ThemedBtn from '../components/ThemedBtn.jsx'
import Spacer from '../components/Spacer.jsx'

import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useRouter } from 'expo-router'
import { dummyUsers } from '../fetchUser/userInfo.js'

const index = () => {
    const router = useRouter();

    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const [email, setEmail] = useState(dummyUsers[0].email)
    const [password, setPassword] = useState(dummyUsers[0].password)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(false); // 5 saniye sonra hatayı sil
            }, 2500);

            // Temizlik fonksiyonu: Bellek sızıntılarını önler
            return () => clearTimeout(timer);
        }
    }, [error]);

    function handleLogin() {
        setIsLoading(true)
        setTimeout(() => {
            const matchedUser = dummyUsers.find(
                (user) => user.email.toLowerCase() == email.toLowerCase().trim() &&
                    user.password == password.trim()
            )

            if (matchedUser) {
                router.replace("CalendarPage");
            }
            else {
                setError(true)
                setIsLoading(false)
            }



        }, 50)

    }


    if (isLoading) {
        return (
            <ThemedView style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>

                <ActivityIndicator size="large" />
            </ThemedView>
        )
    }


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container}>

                <Spacer height={40} />
                <ThemedText title={true} style={styles.title}>
                    Login to Your Account
                </ThemedText>

                <Spacer height={150} />

                <ThemedInput
                    style={{ width: "80%", marginBottom: 20 }}
                    placeholder="Email"
                    placeholderTextColor={theme.textLight}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                />

                <ThemedInput
                    style={{ width: "80%", marginBottom: 20 }}
                    placeholder="Password"
                    placeholderTextColor={theme.textLight}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                />


                {error && (
                    <>
                        <Spacer height={10} />
                        <ThemedText style={{ color: "red", fontSize: 16 }}>
                            E-posta veya şifre hatalı!
                        </ThemedText>
                        <Spacer height={15} />
                    </>
                )}


                <ThemedBtn onPress={() => handleLogin()}>
                    <ThemedText style={{ color: "white" }} title={true} >Login</ThemedText>
                </ThemedBtn>

            </ThemedView>
        </TouchableWithoutFeedback>

    )
}

export default index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',

    },
    titleText: {
        fontSize: 24,
    },
    title: {
        textAlign: "center",
        fontSize: 18,
        marginBottom: 30
    },
})