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
        userImage: request.user.imageUrl,
        date: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };

    db
        .collection('posts')
        .add(newPost)
        .then((doc) => {
            const resPost = newPost;
            resPost.postId = doc.id;
            response.json(resPost);
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
            return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
        })
        .then(() => {
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

exports.likePost = (request, response) => {
    const likeDocument = db.collection('likes').where('username', '==', request.user.username)
        .where('postId', '==', request.params.postId).limit(1);

    const postDocument = db.doc(`/posts/${request.params.postId}`);

    let postData = {};

    postDocument.get()
        .then((doc) => {
            if (doc.exists) {
                postData = doc.data();
                postData.postId = doc.id;
                return likeDocument.get();
            } else {
                return response.status(404).json({ error: 'Post not found' });
            }
        })
        .then((data) => {
            if (data.empty) {
                return db.collection('likes').add({
                    postId: request.params.postId,
                    username: request.user.username
                })
                    .then(() => {
                        postData.likeCount++;
                        return postDocument.update({ likeCount: postData.likeCount })
                    })
                    .then(() => {
                        return response.json(postData)
                    })
            } else {
                return response.status(400).json({ error: 'Post already liked' })
            }
        })
        .catch((err) => {
            console.error(err);
            response.status(500).json({ error: err.code });
        })
}

exports.unlikePost = (request, response) => {
    const likeDocument = db.collection('likes').where('username', '==', request.user.username)
        .where('postId', '==', request.params.postId).limit(1);

    const postDocument = db.doc(`/posts/${request.params.postId}`);

    let postData = {};

    postDocument.get()
        .then((doc) => {
            if (doc.exists) {
                postData = doc.data();
                postData.postId = doc.id;
                return likeDocument.get();
            } else {
                return response.status(404).json({ error: 'Post not found' });
            }
        })
        .then((data) => {
            if (data.empty) {
                return response.status(400).json({ error: 'Post not liked' })
            } else {
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                    .then(() => {
                        postData.likeCount--;
                        return postDocument.update({ likeCount: postData.likeCount });
                    })
                    .then(() => {
                        response.json(postData);
                    })
            }
        })
        .catch((err) => {
            console.error(err);
            response.status(500).json({ error: err.code });
        })
}

exports.deletePost = (request, response) => {
    const document = db.doc(`/posts/${request.params.postId}`);
    document.get()
        .then((doc) => {
            if (!doc.exists) {
                return response.status(404).json({ error: 'Post not found' })
            }
            if (doc.data().author !== request.user.username) {
                return response.status(403).json({ error: 'Unauthorized' })
            }
            else {
                return document.delete();
            }
        })
        .then(() => {
            response.json({ message: 'Post deleted successfully' })
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code })
        })

}