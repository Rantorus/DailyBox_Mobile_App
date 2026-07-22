import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedInput from '../../components/ThemedInput'
import ThemedBtn from '../../components/ThemedBtn'
import Spacer from '../../components/Spacer'
import { Colors } from '../../constants/Colors'
import { useTheme } from '../../contexts/ThemeContext'
import { useRouter } from 'expo-router'
import { useUserStore } from '../../store/useStore'
import { Ionicons } from '@expo/vector-icons'

const ForgotPassword = () => {
    const router = useRouter();
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const requestPasswordReset = useUserStore(state => state.requestPasswordReset);

    const handleRequestOtp = async () => {
        setLocalError('');
        if (!email) {
            setLocalError('Please enter your email address.');
            return;
        }

        setIsSending(true);
        const result = await requestPasswordReset(email);
        setIsSending(false);

        if (result.success) {
            // Başarılıysa ResetPassword sayfasına email'i taşıyarak yönlendir
            router.push({
                pathname: '/(auth)/ResetPassword',
                params: { email }
            });
        } else {
            setLocalError(result.error);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Spacer height={40} />
            
            <ThemedText title={true} style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>
                Forgot Password
            </ThemedText>
            
            <Spacer height={20} />
            
            <ThemedText style={{ textAlign: 'center', paddingHorizontal: 30, color: theme.textLight }}>
                Enter your email address. We will send you a 6-digit password reset code.
            </ThemedText>

            <Spacer height={40} />

            <View style={{ width: "80%", alignSelf: 'center' }}>
                <ThemedInput
                    placeholder="Email address"
                    placeholderTextColor={theme.textLight}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    value={email}
                    autoCapitalize="none"
                    style={{ width: "100%", marginBottom: 15 }}
                />

                {localError ? (
                    <ThemedText style={{ color: "red", fontSize: 14, marginBottom: 15, textAlign: 'center' }}>
                        {localError}
                    </ThemedText>
                ) : null}

                <ThemedBtn 
                    onPress={handleRequestOtp}
                    disabled={isSending}
                    style={{ opacity: isSending ? 0.7 : 1, alignItems: 'center' }}
                >
                    <ThemedText style={{ color: "white" }} title={true}>
                        {isSending ? "Sending..." : "Send Code"}
                    </ThemedText>
                </ThemedBtn>
            </View>
        </ThemedView>
    )
}

export default ForgotPassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
