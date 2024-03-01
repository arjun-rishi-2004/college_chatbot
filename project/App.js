// App.js
import React, { useState,useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Button, StyleSheet,ScrollView } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { storeJobSeekerInfo, app, auth,database, getDatabase, databaseRef } from './index';
// Assuming your Firestore is initialized in index.js
import { getFirestore, collection, addDoc, getDocs,setDoc,getDoc,updateDoc,doc,query,where} from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isJobSeekerModalVisible, setJobSeekerModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New state
  const [isHomePageVisible, setIsHomePageVisible] = useState(false);

  const [isDetailsModalVisible, setDetailsModalVisible] = useState(false);

  const [isEditing, setIsEditing] = useState(false); // New state

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isJobProviderSearchModalVisible, setJobProviderSearchModalVisible] = useState(false);


  // Add a new state
const [editDetails, setEditDetails] = useState({
  name: '',
  preferredProfessions: '',
  contactNumber: '',
  location: '',
});


  const openDetailsModal = () => {
    setDetailsModalVisible(true);
    setIsEditingDetails(false);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setIsEditingDetails(false); 
  };

  const handleBackPress = () => {
    if (isEditingDetails) {
      // If editing details, go back to details view
      setIsEditingDetails(false);
    } else {
      // If not editing, close the modal or handle other navigation logic
      setJobSeekerModalVisible(false);  // Close the modal
      setIsEditing(false); // Reset the editing state
    }
  };
  

  const handleBackButton = () => {
    if (isEditingDetails) {
      // If editing details, go back to details view
      setIsEditingDetails(false);
    } else {
      // If not editing, handle back button based on the current view
      if (isJobSeekerModalVisible) {
        // If job seeker modal is visible, close it and reset states
        setJobSeekerModalVisible(false);
        setIsEditing(false);
      } else if (isHomePageVisible) {
        // If home page is visible, handle back button logic for home page
        // For example, navigate back or close the app
        // You can add your navigation or app closing logic here
      } else {
        // Handle back button for other views or navigate back
        // For example, you might have a navigation stack and pop from it.
      }
    }
  };

  useEffect(() => {
    // Check if the user is logged in
    if (user) {
      setIsLoggedIn(true);
      setIsHomePageVisible(true);
    } else {
      setIsLoggedIn(false);
      setIsHomePageVisible(false);
    }
  }, [user]);

  const db = getFirestore(app);
  let seekerCredsSnapshot;


  const [isJobProviderModalVisible, setJobProviderModalVisible] = useState(false);

  // Add new state variables for Job Provider search
  const [jobProviderSearchQuery, setJobProviderSearchQuery] = useState('');
  const [jobProviderSearchResults, setJobProviderSearchResults] = useState([]);
  
  // Function to handle Job Provider modal click
  const handleJobProviderClick = () => {
    setJobProviderModalVisible(true);
  };



  const handleJobProviderSearch = async () => {
    try {
      console.log('Searching for:', jobProviderSearchQuery);
  
      // Your Firebase query to fetch all user details
      const seekerCredsCollection = 'seekerCreds'; // Replace with your actual collection path
      const querySnapshot = await getDocs(collection(db, seekerCredsCollection));
  
      // Populate the search results array with details
      const results = [];
      querySnapshot.forEach((doc) => {
        const userDetails = doc.data();
        // Check if any profession contains the search query
        if (userDetails.preferredProfessions.includes(jobProviderSearchQuery)) {
          results.push({
            id: doc.id,
            email: userDetails.email,
            name: userDetails.name,
            contactNumber: userDetails.contactNumber,
            location: userDetails.location,
            preferredProfessions: userDetails.preferredProfessions,
            // Include other details as needed
          });
        }
      });
  
      console.log('Search results:', results);
  
      // Update the state with the search results
      setJobProviderSearchResults(results);
    } catch (error) {
      console.error('Error in handleJobProviderSearch:', error);
    }
  };
  
  


  const handleSaveDetails = async () => {
    try {
      console.log('handleSaveDetails called');
  
      // Fetch the user's document
      const seekerCredsCollection = 'seekerCreds'; // Replace with your actual collection path
      const q = query(collection(db, seekerCredsCollection), where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Assuming there is only one document with the provided email
        const userDetailsDoc = querySnapshot.docs[0];
        console.log('User details document:', userDetailsDoc.data());
  
        // Update the fields of the document
        await updateDoc(userDetailsDoc.ref, {
          name: editDetails.name,
          preferredProfessions: editDetails.preferredProfessions,
          contactNumber: editDetails.contactNumber,
          location: editDetails.location,
          // Add more fields as needed
        });
  
        // Display success message
        toast.success('Details updated successfully!');
      }
    } catch (error) {
      // Display error message
      toast.error('Failed to update details. Please try again.');
      console.error('Error in handleSaveDetails:', error);
    }
  };
  
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
      const q = query(seekerCredsCollection, where('email', '==', email));
      const existingUserSnapshot = await getDocs(q);
  
      if (existingUserSnapshot.size > 0) {
        toast.error('User already exists. Please log in.');
        setIsSignUp(false); // Switch to login view
        console.log('User already exists');
        return;
      }
  
      // Collect additional details from the user
      const name = prompt('Enter your name:');
      const preferredProfessions = prompt('Enter your preferred professions (comma-separated):');
      const contactNumber = prompt('Enter your contact number:');
      const location = prompt('Enter your location:');
  
      // Validate collected details
      if (!name || !preferredProfessions || !contactNumber || !location) {
        toast.error('Please provide all required details.');
        console.log('Incomplete details');
        return;
      }
  
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
  
      // Store user credentials and additional details in the "seekerCreds" collection
      await addDoc(seekerCredsCollection, {
        email,
        password,
        name,
        preferredProfessions,
        contactNumber,
        location,
      });
  
      // Set the user state with the fetched details
      setUser({
        uid: newUser.uid,
        email,
        name,
        preferredProfessions,
        contactNumber,
        location,
        // Add more details as needed
      });
  
      // Reset error and clear the input fields
      setError('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
  
      // Display success message or navigate to another screen if needed
      toast.success('Successfully registered!');
  
      // Open the modal for the newly signed up user
      setJobSeekerModalVisible(true);
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
      const seekerCredsCollection = 'seekerCreds'; // Replace with your actual collection path
  
      // Query the document with the matching email
      const q = query(collection(db, seekerCredsCollection), where('email', '==', email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Assuming there is only one document with the provided email
        const userDetailsDoc = querySnapshot.docs[0];
        const userDetails = userDetailsDoc.data();
  
        // Set the user state with all the fetched details
        setUser({
          uid: loggedInUser.uid,
          email,
          name: userDetails.name || '',
          preferredProfessions: userDetails.preferredProfessions || '',
          contactNumber: userDetails.contactNumber || '',
          location: userDetails.location || '',
          // Add more details as needed
        });
  
        // Set the edit details state
        setEditDetails({
          name: userDetails.name || '',
          preferredProfessions: userDetails.preferredProfessions || '',
          contactNumber: userDetails.contactNumber || '',
          location: userDetails.location || '',
        });
  
        // Reset error and clear the input fields
        setError('');
        setEmail('');
        setPassword('');
        setIsSignUp(false);
  
        // Display success message
        toast.success(`Successfully logged in: ${loggedInUser.uid}`);
      } else {
        // If no matching document is found, set user state with basic details
        setUser({
          uid: loggedInUser.uid,
          email,
          name: '',
          preferredProfessions: '',
          contactNumber: '',
          location: '',
        });
  
        // Set the edit details state with default values
        setEditDetails({
          name: '',
          preferredProfessions: '',
          contactNumber: '',
          location: '',
        });
  
        // Reset error and clear the input fields
        setError('');
        setEmail('');
        setPassword('');
        setIsSignUp(false);
  
        // Display success message
        toast.success(`Successfully logged in: ${loggedInUser.uid}`);
      }
    } catch (error) {
      // Display error message
      toast.error('Invalid email or password. Please try again.');
      console.error('Error in handleLogin:', error);
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


        <TouchableOpacity style={styles.button} onPress={handleJobProviderClick}>
          <Text style={styles.buttonText}>Job Provider</Text>
        </TouchableOpacity>














      {isJobProviderModalVisible && (
      <>
        <TextInput
          style={styles.input}
          placeholder="Search by email or name"
          value={jobProviderSearchQuery}
          onChangeText={(text) => setJobProviderSearchQuery(text)}
        />
        <Button title="Search" onPress={handleJobProviderSearch} />

        <ScrollView horizontal style={styles.horizontalScrollView}>


        {/* Display search results for Job Provider */}
        {jobProviderSearchResults.map((result) => (
          <View key={result.id} style={styles.searchResult}>
            {/* Display user details, customize based on your UI */}
            <Text>Email: {result.email}</Text>
            <Text>Name: {result.name}</Text>
            <Text>contactNumber: {result.contactNumber}</Text>

            <Text>location: {result.location}</Text>
            <Text>preferredProfessions: {result.preferredProfessions}</Text>
          </View>

        ))}
        </ScrollView>

      </>
    )}



<Modal visible={isJobProviderSearchModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search profession"
            value={jobProviderSearchQuery}
            onChangeText={(text) => setJobProviderSearchQuery(text)}
          />
          <Button title="Search" onPress={handleJobProviderSearch} />


          <ScrollView horizontal style={styles.horizontalScrollView}>

          {/* Display search results for Job Provider */}
          {jobProviderSearchResults.map((result) => (
            <View key={result.id} style={styles.searchResult}>
              {/* Display user details, customize based on your UI */}
              <Text>Email: {result.email}</Text>
              <Text>Name: {result.name}</Text>
              <Text>contactNumber: {result.contactNumber}</Text>

              <Text>location: {result.location}</Text>
              <Text>preferredProfessions: {result.preferredProfessions}</Text>



              {/* ... Other user details */}
            </View>
          ))}
          </ScrollView>


          {/* Add any additional UI components for Job Provider search modal */}
        </View>
      </Modal>
















      {/* Modal for Job Seeker */}
      <Modal  visible={isJobSeekerModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          {/* Your existing UI components */}
          {/* ... */}
          <TouchableOpacity onPress={handleBackButton} style={{
    backgroundColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    top:450,
    alignItems: 'center',
    justifyContent: 'center',
  }}>

      <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold'}}>
        Back
      </Text>
    </TouchableOpacity>

          {user ? (
          /* Display user details with edit access */
          <>
          
            {isEditing ? (
              /* Display input fields for editing details */
              <>
              
                <Text style={styles.h1}>Edit User Details:</Text>
                <Text style={styles.h1}>Name: </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={editDetails.name}
                  onChangeText={(text) => setEditDetails({ ...editDetails, name: text })}
                />
                <Text style={styles.h1}>Preferred Professions: </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Preferred Professions"
                  value={editDetails.preferredProfessions}
                  onChangeText={(text) => setEditDetails({ ...editDetails, preferredProfessions: text })}
                />
                <Text style={styles.h1}>Contact Number: </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contact Number"
                  value={editDetails.contactNumber}
                  onChangeText={(text) => setEditDetails({ ...editDetails, contactNumber: text })}
                />
                <Text style={styles.h1}>Location: </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Location"
                  value={editDetails.location}
                  onChangeText={(text) => setEditDetails({ ...editDetails, location: text })}
                />

                

                <TouchableOpacity onPress={handleSaveDetails} style={styles.saveButton}>
                  <Text style={styles.saveButtonText} >Save</Text>
                </TouchableOpacity>

                {/* Back button
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity> */}
              </>
            ) : (
              /* Display user details with edit button */
              <>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>User Details:</Text>
               <View style={styles.userDetailsContainer}>
                
                {/* {console.log('User Details:', user)}
                {user.email && <Text>Email: {user.email}</Text>}
                {user.name && <Text>Name: {user.name}</Text>}
                {user.preferredProfessions && (
                  <Text>Preferred Professions: {user.preferredProfessions}</Text>
                )}
                {user.contactNumber && <Text>Contact Number: {user.contactNumber}</Text>}
                {user.location && <Text>Location: {user.location}</Text>} */}


              <Text style={styles.userDetailsText}>Email: {user.email}</Text>
                  <Text style={styles.userDetailsText}>Name: {user.name}</Text>
                  <Text style={styles.userDetailsText}>
                    Preferred Professions: {user.preferredProfessions}
                  </Text>
                  <Text style={styles.userDetailsText}>Contact Number: {user.contactNumber}</Text>
                  <Text style={styles.userDetailsText}>Location: {user.location}</Text>

                  </View>

                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>Edit Details</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>Logout</Text>
                </TouchableOpacity>
              </>
            )}
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
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
    width:'30%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#BDC3C7',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    width: '50%',
  },
  errorText: {
    color: '#E74C3C',
    marginBottom: 15,
    textAlign: 'center',
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    width: '10%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#BDC3C7',
    borderRadius: 8,
    padding: 15,
    marginTop: 50,
    width: '80%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },

  userDetailsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#3498db',
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  userDetailsText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchResult: {
    top:20,
    backgroundColor: '#fff', // Set your desired background color
    padding: 10,
    marginBottom: 10, // Add margin between each result
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    left:10,
    height:150,
  },
  horizontalScrollView: {
    flexDirection: 'row', // Arrange children horizontally
  },
  
  
});



