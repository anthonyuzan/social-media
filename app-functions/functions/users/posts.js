const { db } = require('../util/admin');

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