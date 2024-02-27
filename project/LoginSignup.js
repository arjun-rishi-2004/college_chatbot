// LoginSignup.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from './index';

export default function LoginSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuthentication = async () => {
    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Signup
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      // Handle authentication errors
      console.error(error.message);
    }
  };

  return (
    <View>
      <Text>{isLogin ? 'Login' : 'Signup'}</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={isLogin ? 'Login' : 'Signup'} onPress={handleAuthentication} />
      <Text onPress={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Switch to Signup' : 'Switch to Login'}
      </Text>
    </View>
  );
}
