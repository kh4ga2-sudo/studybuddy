// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-8BhGLQOYpMLwp7IPjOywqJItt451nB0",
  authDomain: "studybuddy-new.firebaseapp.com",
  projectId: "studybuddy-new",
  storageBucket: "studybuddy-new.firebasestorage.app",
  messagingSenderId: "544218679722",
  appId: "1:544218679722:web:61626329fca668947c43d3",
  measurementId: "G-4GCSRZNCM7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);