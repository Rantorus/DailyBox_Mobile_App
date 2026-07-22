import { StyleSheet, View, TouchableOpacity, Alert, Modal, Keyboard, TouchableWithoutFeedback, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedInput from '../../components/ThemedInput'
import ThemedBtn from '../../components/ThemedBtn'
import Spacer from '../../components/Spacer'
import { Colors } from '../../constants/Colors'
import { useTheme } from '../../contexts/ThemeContext'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useUserStore } from '../../store/useStore'
import { Ionicons } from '@expo/vector-icons'

const ResetPassword = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    const [otpCode, setOtpCode] = useState('');
    const [localError, setLocalError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const [isPasswordPanelVisible, setIsPasswordPanelVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const verifyOtp = useUserStore(state => state.verifyOtp);
    const verifyAndResetPassword = useUserStore(state => state.verifyAndResetPassword);

    const handleVerifyOtp = async () => {
        setLocalError('');
        if (!otpCode) {
            setLocalError('Please enter the OTP code.');
            return;
        }

        setIsVerifying(true);
        const result = await verifyOtp(email, otpCode);
        setIsVerifying(false);

        if (result.success) {
            setIsPasswordPanelVisible(true);
        } else {
            Alert.alert("Error", result.error || "Invalid code.");
        }
    };

    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        setIsResetting(true);
        const result = await verifyAndResetPassword(email, otpCode, newPassword);
        setIsResetting(false);

        if (result.success) {
            setIsPasswordPanelVisible(false);
            Alert.alert("Success", "Your password has been reset successfully. You can login with your new password.", [
                { text: "OK", onPress: () => router.replace('/') }
            ]);
        } else {
            Alert.alert("Error", result.error || "Password reset failed.");
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Spacer height={40} />

            <ThemedText title={true} style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}>
                Verify Code
            </ThemedText>

            <Spacer height={20} />

            <ThemedText style={{ textAlign: 'center', paddingHorizontal: 30, color: theme.textLight }}>
                Enter the 6-digit code sent to {email}.
            </ThemedText>

            <Spacer height={40} />

            <View style={{ width: "80%", alignSelf: 'center' }}>
                <ThemedInput
                    placeholder="6-Digit Code"
                    placeholderTextColor={theme.textLight}
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={setOtpCode}
                    value={otpCode}
                    style={{ width: "100%", marginBottom: 15, textAlign: 'center', letterSpacing: 5, fontSize: 20 }}
                />

                {localError && !isPasswordPanelVisible ? (
                    <ThemedText style={{ color: "red", fontSize: 14, marginBottom: 15, textAlign: 'center' }}>
                        {localError}
                    </ThemedText>
                ) : null}

                <ThemedBtn
                    onPress={handleVerifyOtp}
                    disabled={isVerifying}
                    style={{ opacity: isVerifying ? 0.7 : 1, alignItems: 'center' }}
                >
                    <ThemedText style={{ color: "white" }} title={true}>
                        {isVerifying ? "Verifying..." : "Verify Code"}
                    </ThemedText>
                </ThemedBtn>
            </View>

            {/* ALTTAN ÇIKAN YENİ ŞİFRE BELİRLEME PANELİ */}
            <Modal visible={isPasswordPanelVisible} transparent={true} animationType="fade">
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        activeOpacity={1}
                        onPress={() => {
                            if (!isResetting) {
                                setIsPasswordPanelVisible(false);
                                setNewPassword('');
                                setConfirmPassword('');
                                Keyboard.dismiss();
                            }
                        }}
                    />
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                                <ThemedView style={[styles.bottomSheet, { position: 'relative', bottom: 0, width: '100%' }]}>
                                    <View style={styles.sheetHeader}>
                                        <ThemedText title={true} style={{ fontSize: 20 }}>Create New Password</ThemedText>
                                        <TouchableOpacity onPress={() => {
                                            setIsPasswordPanelVisible(false);
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            Keyboard.dismiss();
                                        }}>
                                            <Ionicons name="close-circle" size={30} color={theme.textLight} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={[styles.menuDivider, { backgroundColor: theme.textLight + '50', marginHorizontal: 0, marginBottom: 20 }]} />

                                    <View style={{ gap: 15 }}>
                                        <ThemedInput
                                            placeholder="New Password"
                                            placeholderTextColor={theme.textLight}
                                            secureTextEntry
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            editable={!isResetting}
                                            autoCapitalize="none"
                                        />
                                        <ThemedInput
                                            placeholder="Confirm New Password"
                                            placeholderTextColor={theme.textLight}
                                            secureTextEntry
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            editable={!isResetting}
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.filterButton, { backgroundColor: theme.primary, marginTop: 25 }]}
                                        onPress={handlePasswordChange}
                                        disabled={isResetting}
                                    >
                                        {isResetting ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <ThemedText style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>SAVE PASSWORD</ThemedText>
                                        )}
                                    </TouchableOpacity>
                                </ThemedView>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </ThemedView>
    )
}

export default ResetPassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 998,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: "auto",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 25,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    menuDivider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 15,
    },
    filterButton: {
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
    },
})
