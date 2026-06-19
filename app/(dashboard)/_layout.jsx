import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { StatusBar } from 'expo-status-bar'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../contexts/ThemeContext";

const ICON_SIZE = 24;

const DashboardLayout = () => {

    const { themeName } = useTheme();
    const theme = Colors[themeName]

    return (
        
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: theme.tabBarBackground,
                        paddingTop: 10,
                        height: 80
                    },
                    tabBarActiveTintColor: theme.tabBarIconActive,
                    tabBarInactiveTintColor: theme.tabBarIconInactive,

                }}
            >

                <Tabs.Screen name="CalendarPage" options={{
                    title: "Calendar",
                    tabBarIcon: ({ focused }) => (
                        <Ionicons size={ICON_SIZE} name={focused ? "calendar" : "calendar-outline"}
                            color={focused ? theme.tabBarIconActive : theme.tabBarIconInactive}
                        />
                    )
                }} />

                <Tabs.Screen name="BoxesPage" options={{
                    title: "Boxes",
                    tabBarIcon: ({ focused }) => (
                        <MaterialCommunityIcons name={focused ? "package-variant" : "package-variant-closed"} size={ICON_SIZE} color="black"
                            color={focused ? theme.tabBarIconActive : theme.tabBarIconInactive}
                        />

                    )
                }} />

                <Tabs.Screen name="ChaptersPage" options={{
                    title: "Chapters",
                    tabBarIcon: ({ focused }) => (
                        <MaterialCommunityIcons name={focused ? "inbox-multiple" : "inbox-multiple-outline"} size={ICON_SIZE} color="black"
                            color={focused ? theme.tabBarIconActive : theme.tabBarIconInactive}
                        />
                    )
                }} />

                <Tabs.Screen name="ProfilePage" options={{
                    title: "Profile",
                    tabBarIcon: ({ focused }) => (
                        <Ionicons size={ICON_SIZE} name={focused ? "person-circle" : "person-circle-outline"}
                            color={focused ? theme.tabBarIconActive : theme.tabBarIconInactive}
                        />
                    )
                }} />

            </Tabs>

    )
}

export default DashboardLayout
