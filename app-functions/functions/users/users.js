const { admin, db } = require('../util/admin');

const config = require('../util/config');

const firebaseConfig = require('../util/config')

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig)

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');
const { request, response } = require('express');
const { cpuUsage } = require('process');
const { user } = require('firebase-functions/lib/providers/auth');

// Sign user up
exports.signup = (request, response) => {
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        username: request.body.username
    };

    const { errors, valid } = validateSignupData(newUser);

    if (!valid) return response.status(400).json(errors);

    const noImg = 'no-img.png';

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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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
                return response.status(500).json({ general: 'Something went wrong, please try again' });
            }
        });
};

// Log user in
exports.login = (request, response) => {

    const user = {
        email: request.body.email,
        password: request.body.password
    };

    const { errors, valid } = validateLoginData(user);

    if (!valid) return response.status(400).json(errors);

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
            // auth/wrong-password
            // auth/user-not-user
            return response.status(403).json({ general: 'Wrong credentials, please try again' });
        });
};

// Add user details
exports.addUserDetails = (request, response) => {
    let userDetails = reduceUserDetails(request.body);

    db
        .doc(`/users/${request.user.username}`)
        .update(userDetails)
        .then(() => {
            return response.json({ message: 'Details added successfully' });
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code })
        });
};

// Get own user details
exports.getAuthenticatedUser = (request, response) => {
    let userData = {};
    db
        .doc(`/users/${request.user.username}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                userData.credentials = doc.data();
                return db
                    .collection('likes')
                    .where('username', '==', request.user.username)
                    .get();
            }
        })
        .then((data) => {
            userData.likes = [];
            data.forEach((doc) => {
                userData.likes.push(doc.data());

            })
            return db
                .collection('notifications')
                .where('recipient', '==', request.user.username)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
        })
        .then((data) => {
            userData.notifications = [];
            data.forEach((doc) => {
                userData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    postId: doc.data().postId,
                    type: doc.data().type,
                    read: doc.data().read,
                    notificationId: doc.id
                })
            })
            return response.json(userData);
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code });
        })
};

// Get any user's details
exports.getUserDetails = (request, response) => {
    let userData = {};
    db
        .doc(`/users/${request.params.username}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                userData.user = doc.data();
                return db
                    .collection('posts')
                    .where('author', '==', request.params.username)
                    .orderBy('date', 'desc')
                    .get();
            } else {
                return response.status(404).json({ error: 'User not found' })
            }
        })
        .then((data) => {
            userData.posts = [];
            data.forEach((doc) => {
                userData.posts.push({
                    body: doc.data().body,
                    date: doc.data().date,
                    author: doc.data().author,
                    userImage: doc.data().userImage,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount,
                    postId: doc.id
                })
            });
            return response.json(userData);
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code });
        })

}


// Upload a profil image for user
exports.uploadImage = (request, response) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: request.headers });

    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        // Check the extension of the file to upload
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return response.status(400).json({ error: 'Wrong file type submitted' })
        }

        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random() * 10000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
        admin
            .storage()
            .bucket(config.storageBucket)
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
                return db
                    .doc(`/users/${request.user.username}`)
                    .update({ imageUrl });
            })
            .then(() => {
                return response.json({ message: 'Image uploaded successfully' });
            })
            .catch((err) => {
                console.error(err);
                return response.status(500).json({ error: err.code });
            });
    });
    busboy.end(request.rawBody);
};

exports.markNotificationsRead = (request, response) => {
    let batch = db.batch();
    request.body.forEach((notificationId) => {
        const notification = db.doc(`/notifications/${notificationId}`);
        batch.update(notification, { read: true });
    });
    batch.commit()
        .then(() => {
            return response.json({ message: 'Notifications marked read' })
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code })
        })
}



