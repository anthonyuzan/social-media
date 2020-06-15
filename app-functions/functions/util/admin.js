const admin = require('firebase-admin');

const serviceAccount = require("../../key/serviceAccount.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://social-media-5cf15.firebaseio.com"
});

// admin.initializeApp();

let db = admin.firestore();

module.exports = { admin, db }
