const functions = require('firebase-functions');
const admin = require('firebase-admin');

const serviceAccount = require("../key/serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://social-media-5cf15.firebaseio.com"
});

let db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

exports.getPosts = functions.https.onRequest((request, response) => {
    db.collection('posts').get().then((snapshot) => {
        let posts = [];
        snapshot.forEach((doc) => {
            posts.push(doc.data());
        });
        return response.json(posts)
    })
    .catch((err) => console.error(err));
});

exports.createPost = functions.https.onRequest((request, response) => {
    const newPost = {
        author: request.body.author,
        body: request.body.body,
        date: admin.firestore.Timestamp.fromDate(new Date())
    };

    db.collection('posts').add(newPost).then((doc) => {
        response.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
        response.status(500).json({ error: 'error when trying to create new post!' });
        console.error(err);
    });
});