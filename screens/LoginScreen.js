// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Basic validation (replace with real authentication)
    if (username === 'user' && password === 'password') {
      await AsyncStorage.setItem('userLoginInfo', JSON.stringify({ username }));
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Login Page</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ marginVertical: 10, borderBottomWidth: 1 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginVertical: 10, borderBottomWidth: 1 }}
      />
      <Button title="Submit" onPress={handleLogin} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

export default LoginScreen;
