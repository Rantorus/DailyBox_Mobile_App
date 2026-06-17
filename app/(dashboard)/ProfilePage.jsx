import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedBtn from '../../components/ThemedBtn'
import { useRouter } from 'expo-router'


const ProfilePage = () => {

  const router = useRouter()
  return (
    <ThemedView safe={true} style={styles.container}>
      <ThemedBtn onPress={() => router.replace("/")}>
        <ThemedText style={{ color: "white" }} title={true} >Logout</ThemedText>
      </ThemedBtn>

    </ThemedView>

  )
}

export default ProfilePage

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  titleText: {
    fontSize: 24,
  }
})