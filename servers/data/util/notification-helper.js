const push = require("../pushHelper");
const db = require("../firebaseHelper");

async function findPushKey(address) {
  const notificationDocs = db.collection("notifications");
  if (notificationDocs) {
    return await notificationDocs
      .doc(address)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return JSON.parse(doc.data().push);
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  } else {
    return null;
  }
}

async function deleteNotiDoc(address) {
  const notificationDocs = db.collection("notifications");
  if (notificationDocs) {
    return await notificationDocs
      .doc(address)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return doc.ref.delete();
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.log("Error deleting document:", error);
      });
  } else {
    return null;
  }
}

function sendNotification(title, message, pushData, url, address) {
  push.sendNotification(
    pushData,
    JSON.stringify({
      body: message,
      title: title,
      url: url,
    }),
  )
    .catch(async (err) => {
      console.log("Invalid push key, doc deleting.", err);
      await deleteNotiDoc(address);
    });
}

async function prepareNotification(title, message, url, address) {
  const pushData = await findPushKey(address);
  if (pushData !== null) {
    sendNotification(title, message, pushData, url, address);
  }
}

async function sendNotificationToUser(title, message, url, address) {
  prepareNotification(title, message, url, address);
}

module.exports = {
  sendNotificationToUser,
};