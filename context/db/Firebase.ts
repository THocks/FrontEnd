import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyC55yR5NDV9IRtiGU0xnZUrSb_1D8Zq2gg',
  authDomain: 'testefrontend-d8a69.firebaseapp.com',
  projectId: 'testefrontend-d8a69',
  storageBucket: 'testefrontend-d8a69.appspot.com',
  messagingSenderId: '1073112314189',
  appId: '1:1073112314189:web:9412b44e39055d82228704',
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

export default firebase;
