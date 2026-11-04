
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBhMcbjZ00EkYrS0OPVsxW1XD4xdlK_zQ",
  authDomain: "crud-59d10.firebaseapp.com",
  projectId: "crud-59d10",
  storageBucket: "crud-59d10.firebasestorage.app",
  messagingSenderId: "365493718666",
  appId: "1:365493718666:web:7dc242e7980130f08b6773",
  measurementId: "G-MD2YSVZ1D5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { app, db };
