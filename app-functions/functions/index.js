const firebase = require('firebase')
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const serviceAccount = require("../key/serviceAccount.json");
const { request, response } = require('express');

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

const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) return true;
    else return false;
}

const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}

// Signup route
app.post('/signup', (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        username: request.body.username
    };

    // Validation security
    let errors = {};

    // Email validation
    if (isEmpty(newUser.email)) {
        errors.email = 'Must not be empty';
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address';
    }

    // Password validation
    if (isEmpty(newUser.password)) {
        errors.password = 'Must not be empty';
    }
    if (newUser.password !== newUser.confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    }

    // Username validation
    if (isEmpty(newUser.username)) {
        errors.username = 'Must note be empty';
    }

    // Check the Object "errors"
    if (Object.keys(errors).length > 0) {
        return response.status(400).json(errors);
    }

    let token, userId;
    db
        .doc(`/users/${newUser.username}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return response.status(400).json({ username: 'this username is already taken' });
            }
            else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            token = idToken;
            const userCredentials = {
                username: newUser.username,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId: userId
            };
            return db
                .doc(`/users/${newUser.username}`)
                .set(userCredentials);
        })
        .then(() => {
            return response.status(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return response.status(400).json({ email: 'Email is already in use' });
            }
            else {
                return response.status(500).json({ error: err.code });
            }
        });
});

// Login route
app.post('/login', (request, response) => {

    const user = {
        email: request.body.email,
        password: request.body.password
    };

    let errors = {};

    if (isEmpty(user.email)) errors.email = 'Must not be empty';
    if (isEmpty(user.password)) errors.password = 'Must not be empty';

    if (Object.keys(errors).length > 0) return response.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            return data.user.getIdToken();
        })
        .then((token) => {
            return response.json({ token });
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code });
        });
});

// Function to deploy in Firebase Functions
exports.api = functions.region('europe-west1').https.onRequest(app);
