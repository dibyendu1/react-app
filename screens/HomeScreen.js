// screens/HomeScreen.js
import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    // Remove login info from AsyncStorage
    await AsyncStorage.removeItem('userLoginInfo');
    // Reset navigation to Login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleHapticFeedback = (type) => {
    ReactNativeHapticFeedback.trigger(type, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };

  return (
    <View style={styles.container}>
      <Text>Welcome to the Home Page!</Text>
      <Button title="Logout" onPress={handleLogout} />

      {/* Haptic Feedback Buttons */}
      <TouchableOpacity
        style={styles.hapticButton}
        onPress={() => handleHapticFeedback('impactLight')}
      >
        <Text style={styles.buttonText}>Light Feedback</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.hapticButton}
        onPress={() => handleHapticFeedback('impactMedium')}
      >
        <Text style={styles.buttonText}>Medium Feedback</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.hapticButton}
        onPress={() => handleHapticFeedback('impactHeavy')}
      >
        <Text style={styles.buttonText}>Heavy Feedback</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  hapticButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
