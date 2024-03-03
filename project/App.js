// App.js
import React, { useState,useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Button, StyleSheet,ScrollView,Alert  } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut ,updateProfile,onAuthStateChanged  } from 'firebase/auth';
import { app, auth } from './index';
// Assuming your Firestore is initialized in index.js
import { getFirestore, collection, addDoc,setDoc, doc,getDocs,updateDoc,query,where} from 'firebase/firestore';
// import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from 'react-native-toast-message';


export default function App() {
  const [isJobSeekerModalVisible, setJobSeekerModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [preferredProfessions, setPreferredProfessions] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [location, setLocation] = useState('');


  
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
      console.log('Searching for:', jobProviderSearchQuery.toLowerCase());
  
      // Your Firebase query to fetch all user details
      const seekerCredsCollection = 'seekerCreds'; // Replace with your actual collection path
      const querySnapshot = await getDocs(collection(db, seekerCredsCollection));
  
      // Populate the search results array with details
      const results = [];
      querySnapshot.forEach((doc) => {
        const userDetails = doc.data();

           // Convert data to lowercase for case-insensitive comparison
      const userDetailsLowerCase = {
        email: userDetails.email.toLowerCase(),
        name: userDetails.name.toLowerCase(),
        contactNumber: userDetails.contactNumber.toLowerCase(),
        location: userDetails.location.toLowerCase(),
        preferredProfessions: userDetails.preferredProfessions.toLowerCase(),
        // Include other details as needed
      };


      // Convert search query to lowercase
      const searchQueryLowerCase = jobProviderSearchQuery.toLowerCase();

        // Check if any profession contains the search query
        if (userDetails.preferredProfessions.includes(searchQueryLowerCase)) {
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

        if (userDetails.name.includes(searchQueryLowerCase)) {
          results.push({
            id: doc.id,
            email: userDetails.email,
            name: userDetails.name,
            contactNumber: userDetails.contactNumber,
            location: userDetails.location,
            preferredProfessions: userDetails.preferredProfessions,
          });
          
        }

        if (userDetails.location.includes(searchQueryLowerCase)) {
          results.push({
            id: doc.id,
            email: userDetails.email,
            name: userDetails.name,
            contactNumber: userDetails.contactNumber,
            location: userDetails.location,
            preferredProfessions: userDetails.preferredProfessions,
          });
          
        }

        if (userDetails.email.includes(searchQueryLowerCase)) {
          results.push({
            id: doc.id,
            email: userDetails.email,
            name: userDetails.name,
            contactNumber: userDetails.contactNumber,
            location: userDetails.location,
            preferredProfessions: userDetails.preferredProfessions,
          });
          
        }
      });
  
      console.log('Search results:', results);
  
      // Update the state with the search results or indicate no results
      setJobProviderSearchResults(results.length > 0 ? results : null);
  
      // Show alert if no results found
      if (results.length === 0) {
        Alert.alert(
          'Match not found',
          'No results found for the provided search query.',
        );    
    }
    } catch (error) {
      console.error('Error in handleJobProviderSearch:', error);
    }
  };
  
  
  const handleSignUp = async () => {
    try {
      // Validate input
      if (!email || !password || !confirmPassword || password !== confirmPassword) {
        Alert.alert(
          'Match not found',
          'Please enter valid email and matching passwords.',
        );  
        console.log('Invalid input');
        return;
      }

      const lowercaseEmail = email.toLowerCase();
  
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(lowercaseEmail)) {
        Alert.alert(
          'Invalid EmailID',
          'Please enter a valid email address.',
        );  
        console.log('Invalid email format');
        return;
      }
  
      // Validate password length
      if (password.length < 6) {
        Alert.alert(
          'Warning',
          'Password should be at least 6 characters.',
        );  
        console.log('Weak password error');
        return;
      }
  
      // Check if the user already exists in "seekerCreds" collection
      const seekerCredsCollection = collection(db, 'seekerCreds');
      const q = query(seekerCredsCollection, where('email', '==', lowercaseEmail));
      const existingUserSnapshot = await getDocs(q);
  
      if (existingUserSnapshot.size > 0) {
        Alert.alert(
          'User  Already Exists',
          'A user with this email is already registered.\nPlease login instead of registering.',
        );  
        setIsSignUp(false); // Switch to login view
        console.log('User already exists');
        return;
      }
  
      // Sign up the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, lowercaseEmail, password);
      const newUser = userCredential.user;
  
      // Add user details to Firestore
      const seekerCredsDocRef = doc(seekerCredsCollection, newUser.uid);
  
      await setDoc(seekerCredsDocRef, {
        email,
        password,
        name: '',  // Add default or empty values for other fields
        preferredProfessions: '',
        contactNumber: '',
        location: '',
        // Add more fields as needed
      });
  
      // Show modal to collect additional details
      setModalVisible(true);
    } catch (error) {
      Alert.alert(
        'Error',
        'Error in handleSignUp',
      );
      console.error('Error in handleSignUp:', error.message);
    }
  };
  
  
  const handleLogin = async () => {
    try {
      // Validate input
      if (!email || !password) {
        Alert.alert(
          'Warning',
          'Email and password are required.',
        );  
        console.error('Email and password are required.');
        return;
      }

      const lowercaseEmail = email.toLowerCase();

  
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, lowercaseEmail, password);
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
        Alert.alert(
          'Success',
          'Successfully logged in!',
        );  
  
        // Update the existing document with the fetched details
        await updateDoc(userDetailsDoc.ref, {
          name: userDetails.name || '',
          preferredProfessions: userDetails.preferredProfessions || '',
          contactNumber: userDetails.contactNumber || '',
          location: userDetails.location || '',
          // Add more fields as needed
        });
  
        console.log('User details updated after login!');
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
        Alert.alert(
          'Success',
          'Successfully logged in. No additional details found.',
        );  
      }
    } catch (error) {
      // Display error message
      Alert.alert(
        'Warning',
        'Invalid email or password. Please try again.',
      );  
      console.error('Error in handleLogin:', error);
    }
  };
  
  const handleSaveDetails = async () => {
    try {
      // Validate collected details
      if (!editDetails.name || !editDetails.preferredProfessions || !editDetails.contactNumber || !editDetails.location) {
        Alert.alert(
          'Warning',
          'Please provide all required details.',
        );  
        console.log('Incomplete details');
        return;
      }
  
      // Get the currently logged-in user
      let user = auth.currentUser;
  
      if (!user) {
        // If the user is not logged in, handle this case (e.g., sign in)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      }
  
      // Now user should be authenticated
      if (user) {
        // Reference to the seekerCreds collection
        const seekerCredsCollection = collection(db, 'seekerCreds');
  
        // Query for the existing user details using the user's email
        const userQuery = query(seekerCredsCollection, where('email', '==', user.email));
        const userQuerySnapshot = await getDocs(userQuery);
  
        if (userQuerySnapshot.size > 0) {
          // If user details already exist, update the existing document
          const userDoc = userQuerySnapshot.docs[0];
          console.log('Found existing document:', userDoc.data());
  
          await updateDoc(userDoc.ref, {
            name: editDetails.name,
            preferredProfessions: editDetails.preferredProfessions,
            contactNumber: editDetails.contactNumber,
            location: editDetails.location,
            // Add more fields as needed
          });
  
          console.log('Document updated!');
        } else {
          // If user details do not exist, create a new document
          await addDoc(seekerCredsCollection, {
            email: user.email,
            name: editDetails.name,
            preferredProfessions: editDetails.preferredProfessions,
            contactNumber: editDetails.contactNumber,
            location: editDetails.location,
            // Add more fields as needed
          });
  
          console.log('New document added!');
        }
  
        // Display success message
        Alert.alert(
          'Success',
          'Details saved successfully.',
        );  
  
        // Reset states
        setModalVisible(false);
        setEditDetails({
          name: '',
          preferredProfessions: '',
          contactNumber: '',
          location: '',
        });
      }
    } catch (error) {
      // Display error message
      Alert.alert(
        'Error',
        'Error in handleSaveDetails.',
      );  
      console.error('Error in handleSaveDetails:', error.message);
    }
  };
  

  
  const handleLogout = async () => {
    try {
      // Sign out the user
      await signOut(auth);

      Alert.alert(
        'Success',
        'Logout successful! Goodbye.',
      );    
      setUser(null);
    } catch (error) {
      setError('Failed to log out. Please try again.');
    }
  };

  const handleJobSeekerClick = () => {
    setJobSeekerModalVisible(true);
  };

  const handleCloseModal = () => {
    // Close the modal without saving details
    setModalVisible(false);
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
          style={styles.input2}
          placeholder="Name or Profession..."
          value={jobProviderSearchQuery}
          onChangeText={(text) => setJobProviderSearchQuery(text)}
        />
        <Button title="Search" onPress={handleJobProviderSearch} />

        <ScrollView horizontal style={styles.horizontalScrollView}>


        {/* Display search results for Job Provider */}
        {jobProviderSearchResults !== null ? (
        <ScrollView horizontal style={styles.horizontalScrollView}>
          {jobProviderSearchResults.map((result) => (
            <View key={result.id} style={styles.searchResult}>
              {/* Display user details, customize based on your UI */}
              <Text>Email: {result.email}</Text>
              <Text>Name: {result.name}</Text>
              <Text>Contact Number: {result.contactNumber}</Text>
              <Text>Location: {result.location}</Text>
              <Text>Preferred Professions: {result.preferredProfessions}</Text>
              {/* ... Other user details */}
            </View>
          ))}
        </ScrollView>
        ) : (
          <Text>No results found</Text>
        )}
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


          {jobProviderSearchResults !== null ? (
        <ScrollView horizontal style={styles.horizontalScrollView}>
          {jobProviderSearchResults.map((result) => (
            <View key={result.id} style={styles.searchResult}>
              {/* Display user details, customize based on your UI */}
              <Text>Email: {result.email}</Text>
              <Text>Name: {result.name}</Text>
              <Text>Contact Number: {result.contactNumber}</Text>
              <Text>Location: {result.location}</Text>
              <Text>Preferred Professions: {result.preferredProfessions}</Text>
              {/* ... Other user details */}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>No results found</Text>
    )}
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
            marginTop: -200,
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
                <Text style={styles.h2}>Name: </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={editDetails.name}
                  onChangeText={(text) => setEditDetails({ ...editDetails, name: text })}
                />
                <Text style={styles.h2}>Preferred Professions: </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Preferred Professions"
                  value={editDetails.preferredProfessions}
                  onChangeText={(text) => setEditDetails({ ...editDetails, preferredProfessions: text })}
                />
                <Text style={styles.h2}>Contact Number: </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contact Number"
                  value={editDetails.contactNumber}
                  onChangeText={(text) => setEditDetails({ ...editDetails, contactNumber: text })}
                />
                <Text style={styles.h2}>Location: </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Location"
                  value={editDetails.location}
                  onChangeText={(text) => setEditDetails({ ...editDetails, location: text })}
                />

                

                <TouchableOpacity onPress={handleSaveDetails} style={styles.saveButton}>
                  <Text style={styles.saveButtonText} >Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Display user details with edit button */
              <>
              <Text style={{ fontSize: 25, marginBottom: 10, color: '#333' }}>User Details:</Text>
               <View style={styles.userDetailsContainer}>
                
              <Text style={styles.userDetailsText}>Email: {user.email}</Text>
                  <Text style={styles.userDetailsText}>Name: {user.name}</Text>
                  <Text style={styles.userDetailsText}>
                    Preferred Professions: {user.preferredProfessions}
                  </Text>
                  <Text style={styles.userDetailsText}>Contact Number: {user.contactNumber}</Text>
                  <Text style={styles.userDetailsText}>Location: {user.location}</Text>

                  </View>

                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={{ fontSize: 20, marginBottom: 10, color: '#333' }}>Edit Details</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout}>
                  <Text style={{ fontSize: 20, marginBottom: 10, color: '#333' }}>Logout</Text>
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
        {/* <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar={false} /> */}
      </View>
    </Modal>


    <Modal visible={isModalVisible} animationType="slide">
    <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalText}>Enter Additional Details:</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Name"
                        value={name}
                        onChangeText={(text) => setName(text)}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Preferred Professions"
                        value={preferredProfessions}
                        onChangeText={(text) => setPreferredProfessions(text)}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Contact Number"
                        value={contactNumber}
                        onChangeText={(text) => setContactNumber(text)}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Location"
                        value={location}
                        onChangeText={(text) => setLocation(text)}
                    />


                    <View style={styles.buttonContainer}>
                        <Button style={styles.button} title="Save Details" onPress={handleSaveDetails} />
                        <Button style={styles.button} title="Close" onPress={handleCloseModal} />
                    </View>
                </View>
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
    textAlign:'center',
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
    width: '70%',
  },

  input2:{
    marginTop:100,
    height: 40,
    borderColor: '#BDC3C7',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    width: '70%',
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
  h2: {
    fontSize: 19,
    fontWeight: 'light',
    marginBottom: 15,
    color: '#333',
    textAlign:'left',
  },
  saveButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    padding: 5,
    marginTop: 70,
    width: 55,
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
    marginTop: 35,
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
    textAlign:'center',
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



