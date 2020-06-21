const functions = require('firebase-functions');
const express = require('express');
const app = express();

const FBAuth = require('./util/fbAuth');

const { getAllPosts, postOnePost, getPost } = require('./users/posts');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./users/users')

// Posts routes
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, postOnePost);
app.get('/post/:postId', getPost);
// TODO: delete post
// TODO: like a post
// TODO: unlike a post
// TODO: comment a post

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

// Function to deploy in Firebase Functions
exports.api = functions.region('europe-west1').https.onRequest(app);
