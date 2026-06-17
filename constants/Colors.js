export const Colors = {
    // 1. LIGHT THEME 
    lightTheme: {
        primary: "#0F172A",          // Modern dark navy/black for buttons and highlights
        background: "#F8FAFC",       // Very light gray/white background, easy on the eyes
        card: "#FFFFFF",             // Pure white for Box backgrounds
        headerBackground: "#FFFFFF", // Top navigation bar background
        tabBarBackground: "#FFFFFF", // Bottom tab bar background
        tabBarIconActive: "#0F172A", // Color for the active (focused) tab icon
        tabBarIconInactive: "#94A3B8",// Color for inactive tab icons
        text: "#0F172A",             // Primary text color (Black)
        textLight: "#64748B",        // Muted/secondary text color (timestamps, placeholders)
        border: "#E2E8F0",           // Thin divider lines
        white: "#FFFFFF",            // Pure white fallback
        shadow: "rgba(0, 0, 0, 0.05)",// Very subtle, elegant drop shadow
    },

    // 2. DARK THEME 
    darkTheme: {
        primary: "#8B593E",          // Copper / Leather brown accent color
        background: "#1C1917",       // Warm and very dark gray background
        card: "#292524",             // Box/Card background (elevation level 1)
        headerBackground: "#221E1C", // Top navigation bar background
        tabBarBackground: "#221E1C", // Bottom tab bar background
        tabBarIconActive: "#8B593E", // Color for the active (focused) tab icon
        tabBarIconInactive: "#A8A29E",// Color for inactive tab icons
        text: "#F5F5F4",             // Primary text color (Off-white)
        textLight: "#A8A29E",        // Muted/secondary text color
        border: "#44403C",           // Thin divider lines
        white: "#FFFFFF",            // Pure white fallback
        shadow: "rgba(0, 0, 0, 0.4)",// More pronounced and deep drop shadow
    },

    // 3. CUSTOM: COFFEE 
    coffeeTheme: {
        primary: "#8B593E",          // Coffee brown accent
        background: "#FFF8F3",       // Warm cream background
        card: "#FFFFFF",             // Pure white cards
        headerBackground: "#FFF8F3", // Matches main background
        tabBarBackground: "#FFFFFF", // White tab bar for contrast
        tabBarIconActive: "#8B593E", // Active icon color
        tabBarIconInactive: "#D5C4B9",// Inactive icon color
        text: "#4A3428",             // Dark brown text
        textLight: "#9A8478",        // Light brown muted text
        border: "#E5D3B7",           // Warm beige borders
        white: "#FFFFFF",
        shadow: "rgba(139, 89, 62, 0.1)", // Brown-tinted shadow
    },

    // 4. CUSTOM: OCEAN 
    oceanTheme: {
        primary: "#0277BD",          // Ocean blue accent
        background: "#F0F9FF",       // Very light sky blue background
        card: "#FFFFFF",             // Pure white cards
        headerBackground: "#F0F9FF", // Matches main background
        tabBarBackground: "#FFFFFF", // White tab bar
        tabBarIconActive: "#0277BD", // Active icon color
        tabBarIconInactive: "#7DD3FC",// Inactive icon color
        text: "#01579B",             // Deep blue text
        textLight: "#0284C7",        // Muted blue text
        border: "#BAE6FD",           // Light blue borders
        white: "#FFFFFF",
        shadow: "rgba(2, 119, 189, 0.1)", // Blue-tinted shadow
    },

    // 5. CUSTOM: FOREST
    forestTheme: {
        primary: "#2E7D32",          // Forest green accent
        background: "#F0FDF4",       // Very light mint/green background
        card: "#FFFFFF",             // Pure white cards
        headerBackground: "#F0FDF4", // Matches main background
        tabBarBackground: "#FFFFFF", // White tab bar
        tabBarIconActive: "#2E7D32", // Active icon color
        tabBarIconInactive: "#86EFAC",// Inactive icon color
        text: "#14532D",             // Deep green text
        textLight: "#22C55E",        // Muted green text
        border: "#BBF7D0",           // Light green borders
        white: "#FFFFFF",
        shadow: "rgba(46, 125, 50, 0.1)", // Green-tinted shadow
    },
};