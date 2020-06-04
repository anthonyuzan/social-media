const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const serviceAccount = require("../key/serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-media-5cf15.firebaseio.com"
});

// admin.initializeApp();

const app = express();
let db = admin.firestore();

// getPosts WITHOUT express
// exports.getPosts = functions.https.onRequest((request, response) => {
//     db.collection('posts').get().then((snapshot) => {
//         let posts = [];
//         snapshot.forEach((doc) => {
//             posts.push(doc.data());
//         });
//         return response.json(posts)
//     })
//     .catch((err) => console.error(err));
// });

// createPost WITHOUT express
// exports.createPost = functions.https.onRequest((request, response) => {
//     if(request.method !== 'POST'){
//         return response.status(400).json({ error: 'Method not allowed' });
//     }
//     const newPost = {
//         author: request.body.author,
//         body: request.body.body,
//         date: admin.firestore.Timestamp.fromDate(new Date())
//     };

//     db.collection('posts').add(newPost).then((doc) => {
//         response.json({ message: `document ${doc.id} created successfully` });
//     })
//     .catch((err) => {
//         response.status(500).json({ error: 'error when trying to create new post!' });
//         console.error(err);
//     });
// });

// getPosts WITH express
app.get('/posts', (request, response) => {
    db.collection('posts').orderBy('date', 'desc').get().then((snapshot) => {
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

    db.collection('posts').add(newPost).then((doc) => {
        response.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
        response.status(500).json({ error: 'error when trying to create new post!' });
        console.error(err);
    });
});

// endpoint in Firebase Functions
exports.api = functions.region('europe-west1').https.onRequest(app);
