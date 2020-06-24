const { db } = require('../util/admin');
const { request, response } = require('express');

exports.getAllPosts = (request, response) => {
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
};

exports.postOnePost = (request, response) => {
    if (request.body.body.trim() === '') {
        return response.status(400).json({ body: 'Must not be empty' })
    }

    const newPost = {
        author: request.user.username,
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
};

exports.getPost = (request, response) => {
    let postData = {};
    db.doc(`/posts/${request.params.postId}`).get()
        .then((doc) => {
            if (!doc.exists) {
                return response.status(404).json({ error: 'Post not found' });
            }
            postData = doc.data();
            postData.postId = doc.id;
            return db.collection('comments')
                .orderBy('createdAt', 'desc')
                .where('postId', '==', request.params.postId)
                .get();
        })
        .then((data) => {
            postData.comments = [];
            data.forEach((doc) => {
                postData.comments.push(doc.data());
            });
            return response.json(postData);
        })
        .catch((err) => {
            console.error(err);
            response.status(500).json({ error: err.code });
        })
}

exports.commentOnPost = (request, response) => {
    if (request.body.body.trim() === '') return response.status(400).json({ error: 'Must not be empty' });

    const newComment = {
        body: request.body.body,
        createdAt: new Date().toISOString(),
        postId: request.params.postId,
        username: request.user.username,
        userImage: request.user.imageUrl
    };

    db.doc(`/posts/${request.params.postId}`).get()
        .then((doc) => {
            if (!doc.exists) {
                return response.status(404).json({ error: 'Post not found' });
            }
            return db.collection('comments').add(newComment);
        })
        .then(() => {
            response.json(newComment);
        })
        .catch((err) => {
            console.error(err);
            response.status(500).json({ error: 'Something went wrong' });
        })
}