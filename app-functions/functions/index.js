const firebase = require('firebase')
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const serviceAccount = require("../key/serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-media-5cf15.firebaseio.com"
});

// admin.initializeApp();

const firebaseConfig = {
    apiKey: "AIzaSyA7x5_c9EFGgIcK75uolGz_FYlUkFL6s-U",
    authDomain: "social-media-5cf15.firebaseapp.com",
    databaseURL: "https://social-media-5cf15.firebaseio.com",
    projectId: "social-media-5cf15",
    storageBucket: "social-media-5cf15.appspot.com",
    messagingSenderId: "715337846775",
    appId: "1:715337846775:web:87d492f513197016f0e8f2"
};

const app = express();
let db = admin.firestore();

firebase.initializeApp(firebaseConfig)

// getPosts WITH express
app.get('/posts', (request, response) => {
    db
        .collection('posts')
        .orderBy('date', 'desc')
        .get()
        .then((snapshot) => {
            let posts = [];
            snapshot.forEach((doc) => {
                posts.push({
                    postId: doc.id,
                    author: doc.data().author,
                    body: doc.data().body,
                    date: doc.data().date
                });
            });
            return response.json(posts)
        })
        .catch((err) => console.error(err));
});

// createPost WITH express
app.post('/post', (request, response) => {
    const newPost = {
        author: request.body.author,
        body: request.body.body,
        date: new Date().toISOString()
    };

    db
        .collection('posts')
        .add(newPost)
        .then((doc) => {
            response.json({ message: `document ${doc.id} created successfully` });
        })
        .catch((err) => {
            response.status(500).json({ error: 'error when trying to create new post!' });
            console.error(err);
        });
});

// Signup route
app.post('/signup', (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        username: request.body.username
    };

    // TODO: validate data

    firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
            return response.status(201).json({ message: `user ${data.user.uid} signed up successfully` });
        })
        .catch(err => {
            console.error(err);
            return response.status(500).json({ error: err.code })
        });
});

// Function to deploy in Firebase Functions
exports.api = functions.region('europe-west1').https.onRequest(app);
