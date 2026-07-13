import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';

export default function AuthLayout() {
    const { themeName } = useTheme();
    const theme = Colors[themeName];

    return (
        <Stack screenOptions={{
            headerStyle: { backgroundColor: theme.headerBackground },
            headerTintColor: theme.text,
            contentStyle: { backgroundColor: theme.background },
            headerShadowVisible: false,
        }}>
            <Stack.Screen name="ForgotPassword" options={{ title: 'Forgot Password' }} />
            <Stack.Screen name="ResetPassword" options={{ title: 'Reset Password' }} />
        </Stack>
    );
}
