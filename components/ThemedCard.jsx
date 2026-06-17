import { View, useColorScheme, StyleSheet} from 'react-native'
import { Colors, selectedThemeString } from '../constants/Colors'


const ThemedCard = ({style, ...props}) => {
    
    const theme = Colors[selectedThemeString] 

  return (
    <View 
    style = {[{backgroundColor:theme.card},styles.card, style ]}
    {...props}
    />
      
    
  )
}

export default ThemedCard

const styles = StyleSheet.create({
    card:{
        borderRadius: 5,
        padding: 20
    }
})