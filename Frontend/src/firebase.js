// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { RecaptchaVerifier } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-yZp4mhpylkXCTHlGN5FQNYeAcu0_l7Y",
  authDomain: "campus-exchange-f756f.firebaseapp.com",
  projectId: "campus-exchange-f756f",
  storageBucket: "campus-exchange-f756f.firebasestorage.app",
  messagingSenderId: "1070246427271",
  appId: "1:1070246427271:web:5b13b513f6877a425a5622",
  measurementId: "G-7V67X5T32Q"
};

export const setupRecaptcha = (containerId) => {
  return new RecaptchaVerifier(auth, containerId, {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved
      console.log('reCAPTCHA verified');
    }
  });
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;