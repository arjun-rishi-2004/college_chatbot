// App.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Button, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { storeJobSeekerInfo, app, auth, database, getDatabase, databaseRef } from './index';
// Assuming your Firestore is initialized in index.js
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const [isLoggedIn, setIsLoggedIn] = useState(false); // New state




export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isJobSeekerModalVisible, setJobSeekerModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const db = getFirestore(app);
  
  const handleSignUp = async () => {
    try {
      // Validate input
      if (!email || !password || !confirmPassword || password !== confirmPassword) {
        toast.error('Please enter valid email and matching passwords.');
        console.log('Invalid input');
        return;
      }
  
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address.');
        console.log('Invalid email format');
        return;
      }
  
      // Validate password length
      if (password.length < 6) {
        toast.error('Password should be at least 6 characters.');
        console.log('Weak password error');
        return;
      }
  
      // Check if the user already exists in "seekerCreds" collection
      const seekerCredsCollection = collection(db, 'seekerCreds');
      const seekerCredsSnapshot = await getDocs(seekerCredsCollection);
  
      if (seekerCredsSnapshot.size > 0) {
        // Check if email already exists
        const existingUser = seekerCredsSnapshot.docs.find(doc => doc.id === email);
        if (existingUser) {
          toast.error('User already exists. Please log in.');
          setIsSignUp(false); // Switch to login view
          console.log('User already exists');
          return;
        }
      }
  
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
  
      // Store user credentials in the "seekerCreds" collection
      await addDoc(seekerCredsCollection, {
        email,
        password,  // You can add more details if needed
      });
  
      // Set the user state with the fetched details
      setUser({
        uid: newUser.uid,
        email,
        // Add more details as needed
      });
  
      // Reset error and clear the input fields
      setError('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
  
      // Display success message or navigate to another screen if needed
      toast.success('Successfully registered!');
    } catch (error) {
      toast.error('Error in handleSignUp');
      console.error('Error in handleSignUp:', error.message);

      if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('User already exists. Please log in.');
      } else {
        toast.error('Failed to sign up. Please try again.');
      }
    }
  };
  
  
  
  

  const handleLogin = async () => {
    try {
      // Validate input
      if (!email || !password) {
        toast.error('Email and password are required.');
        console.error('Email and password are required.');
        return;
      }
  
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;
  
      // Fetch additional details from the "seeker creds" database
      // You can replace this with your implementation
      // const userDetails = await fetchUserDetails(loggedInUser.uid);
  
      // Set the user state with the fetched details
      setUser({
        uid: loggedInUser.uid,
        email,
        // Add more details as needed
      });
  
      // Reset error and clear the input fields
      setError('');
      setEmail('');
      setPassword('');
      setIsSignUp(false);
  
      toast.success('Successfully logged in:', loggedInUser.uid);
    } catch (error) {
      toast.error('Invalid email or password. Please try again.');
      console.error('Error in handleLogin:', error.message);
    }
  };
  

  const handleLogout = async () => {
    try {
      // Sign out the user
      await signOut(auth);

      // Reset the user state
      setUser(null);
    } catch (error) {
      setError('Failed to log out. Please try again.');
    }
  };

  const handleJobSeekerClick = () => {
    setJobSeekerModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Job Board!</Text>
      <TouchableOpacity style={styles.button} onPress={handleJobSeekerClick}>
        <Text style={styles.buttonText}>Job Seeker</Text>
      </TouchableOpacity>

      {/* Modal for Job Seeker */}
      <Modal visible={isJobSeekerModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          {/* Your existing UI components */}
          {/* ... */}

          {user ? (
            /* Display user details with edit access */
            <>
              <Text>User Details:</Text>
              <Text>Email: {user.email}</Text>
              {/* Add more details as needed */}
              <TouchableOpacity onPress={handleLogout}>
                <Text>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* Display signup or login options based on the state */
            <>
              {isSignUp ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                  <Button title="Sign Up" onPress={handleSignUp} />
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  <Button title="Login" onPress={handleLogin} />
                </>
              )}

              {/* Toggle between login and signup */}
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text>{isSignUp ? 'Switch to Login' : 'Switch to Sign Up'}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Toast container */}
          <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar={false} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: "60%",
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
