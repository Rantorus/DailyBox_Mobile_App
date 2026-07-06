import { useEffect } from "react"
import { useUserStore } from "../store/useStore"
import { useRouter } from "expo-router"
import { ActivityIndicator } from "react-native"
import ThemedView from "../components/ThemedView"
import { useTheme } from "../contexts/ThemeContext"
import { Colors } from "../constants/Colors"

const GuestOnly = ({children}) => {
    const { themeName } = useTheme();
    const theme = Colors[themeName];
    
    const isAuthChecking = useUserStore(state => state.isAuthChecking)
    const activeUser = useUserStore(state => state.activeUser)
    const router = useRouter()

    useEffect(() => {
        if (!isAuthChecking && activeUser !== null) {
            router.replace("/(dashboard)/CalendarPage")
        }
    }, [activeUser, isAuthChecking])

    if (isAuthChecking || activeUser) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ThemedView>
        )
    }

    return children
}

export default GuestOnly
