// Firebase Configuration
// Replace these values with your Firebase project credentials
// Get these from: Firebase Console > Project Settings > Your apps > Web app

const firebaseConfig = {
    apiKey: "AIzaSyB47Qw26hMQcKr2sC4B8i772wrhTMKo8Ho",
	authDomain: "su-baby-sprinkle.firebaseapp.com",
	databaseURL: "https://su-baby-sprinkle-default-rtdb.firebaseio.com",
	projectId: "su-baby-sprinkle",
	storageBucket: "su-baby-sprinkle.firebasestorage.app",
	messagingSenderId: "442824239099",
	appId: "1:442824239099:web:b90411c9d63d96cdb8cd5e",
	measurementId: "G-TQLMQ9K64W"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Host password (change this to your desired password)
const HOST_PASSWORD = "Arya2019";
