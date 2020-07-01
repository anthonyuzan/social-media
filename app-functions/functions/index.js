const functions = require('firebase-functions');
const express = require('express');
const app = express();

const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const { getAllPosts, postOnePost, getPost, commentOnPost, likePost, unlikePost, deletePost } = require('./users/posts');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./users/users')

// Posts routes
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, postOnePost);
app.get('/post/:postId', getPost);
app.delete('/post/:postId', FBAuth, deletePost);
app.get('/post/:postId/like', FBAuth, likePost);
app.get('/post/:postId/unlike', FBAuth, unlikePost);
app.post('/post/:postId/comment', FBAuth, commentOnPost);
// TODO: get notification
// TODO: create notification

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

// Function to deploy in Firebase Functions
exports.api = functions.region('europe-west1').https.onRequest(app);

exports.createNotificationOnLike = functions
    .region('europe-west1')
    .firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        return db
            .doc(`/posts/${snapshot.data().postId}`)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().author,
                        sender: snapshot.data().username,
                        type: 'like',
                        read: false,
                        postId: doc.id
                    });
                }
            })
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
                return;
            });
    });

exports.deleteNotificationOnUnlike = functions
    .region('europe-west1')
    .firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db
            .doc(`/notifications/${snapshot.id}`)
            .delete()
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
                return;
            })
    });

exports.createNotificationOnComment = functions
    .region('europe-west1')
    .firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        return db
            .doc(`/posts/${snapshot.data().postId}`).get()
            .then((doc) => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().author,
                        sender: snapshot.data().username,
                        type: 'comment',
                        read: false,
                        postId: doc.id
                    });
                }
            })
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
                return;
            });
    });
