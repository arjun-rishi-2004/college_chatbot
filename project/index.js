// index.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, get } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCJ-MsXLRSleXj6fQjs7nbYwrPAdcH4L34",
  authDomain: "jobhub2k24.firebaseapp.com",
  databaseURL: "https://jobhub2k24-default-rtdb.firebaseio.com",
  projectId: "jobhub2k24",
  storageBucket: "jobhub2k24.appspot.com",
  messagingSenderId: "475451161212",
  appId: "1:475451161212:web:3894adf0b1a12acc3ca7f9",
  measurementId: "G-PY9GB3Y1SR"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const seekerCredsRef = ref(database, 'seekerCreds');
get(seekerCredsRef).then(snapshot => {
  if (!snapshot.exists()) {
    set(seekerCredsRef, {});
  }
});

export const storeJobSeekerInfo = async (email, password, name, profession, description, location, contactNumber) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    if (user) {
      const jobSeekersRef = ref(database, 'jobSeekers');
      const newJobSeekerRef = push(jobSeekersRef);

      set(newJobSeekerRef, {
        uid: user.uid,
        name,
        profession,
        description,
        location,
        contactNumber
      });
    }
  } catch (error) {
    console.error("Error creating user:", error.message);
  }
};

const databaseRef = ref(database, 'ko');

export {
  app,
  auth,
  database,
  getDatabase,
  databaseRef
};