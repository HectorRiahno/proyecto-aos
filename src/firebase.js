// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAA55UIOdrEhni5aD75_JoIV-Zpf5vJc80",
  authDomain: "proyecto-aos-2fc85.firebaseapp.com",
  projectId: "proyecto-aos-2fc85",
  storageBucket: "proyecto-aos-2fc85.firebasestorage.app",
  messagingSenderId: "611693170712",
  appId: "1:611693170712:web:052441def3ecbfcb9fb36d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// // Initialize Cloud Storage and get a reference to the service
// export const storage = getStorage(app);