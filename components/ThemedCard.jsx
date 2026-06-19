import { View, useColorScheme, StyleSheet } from 'react-native'
import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext'


const ThemedCard = ({ style, ...props }) => {

  const { themeName } = useTheme();
  const theme = Colors[themeName];

  return (
    <View
      style={[{ backgroundColor: theme.card }, styles.card, style]}
      {...props}
    />


  )
}

export default ThemedCard

const styles = StyleSheet.create({
  card: {
    borderRadius: 5,
    padding: 20
  }
})