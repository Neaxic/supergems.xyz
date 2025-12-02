const push = require("web-push");
const admin = require("firebase-admin");

let vapidKeys = {
  publicKey:
    "REDACTED",
  privateKey: "REDACTED",
};

push.setVapidDetails(
  "mailto:noone@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

async function findPushKey(address) {
  const notificationDocs = admin.firestore().collection("notifications");
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
  const notificationDocs = admin.firestore().collection("notifications");
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
  push
    .sendNotification(
      pushData,
      JSON.stringify({
        body: message,
        title: title,
        url: url,
        image:
          "https://i.imgur.com/3YhQ3QZ.pnhttps://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Solid_red.svg/2048px-Solid_red.svg.png",
      }),
    )
    .catch(async (err) => {
      console.log("Invalid push key, doc deleting.");
      await deleteNotiDoc(address);
      console.log("Deleted")
    });
}

// Predefined notits

async function recivedProposalOffer(reciverAddress, hash) {
  const pushData = await findPushKey(reciverAddress);
  console.log(pushData);
  if (pushData !== null) {
    const title = `You recived a trade offer 👋`;
    const message = `A trade offer has been sent directly to you. Check it out!`;
    sendNotification(
      title,
      message,
      pushData,
      `https://supergems.xyz/trade/${hash}`,
    );
  }
}

async function tradeAccepted(senderAddress, hash) {
  const pushData = await findPushKey(senderAddress);
  if (pushData !== null) {
    const title = `Your trade was accepted 👋`;
    const message = `Your trade offer has been accepted. Check out your new stuff!`;
    sendNotification(
      title,
      message,
      pushData,
      `https://supergems.xyz/trade/${hash}`,
    );
  }
}

async function switchDonationSuccessfull(address, donation) {
  const pushData = await findPushKey(address);
  if (pushData !== null) {
    const title = `Your donation was successfull 👋`;
    const message = `Your donation was deposited successfully. Share it to get som switches!`;
    sendNotification(
      title,
      message,
      pushData,
      `https://supergems.xyz/trade/${hash}`,
    );
  }
}

async function switchSomebodySwitched(address, donation) {
  const pushData = await findPushKey(address);
  if (pushData !== null) {
    const title = `Somebody switched your NFT! 👋`;
    const message = `You just earned $$ from your NFT. Check it out!`;
    sendNotification(
      title,
      message,
      pushData,
      `https://supergems.xyz/trade/${hash}`,
    );
  }
}

async function switchSuccessfullSwitch(address, donation) {
  const pushData = await findPushKey(address);
  if (pushData !== null) {
    const title = `Switch was successfull! 👋`;
    const message = `Congratulations! Your switch was successfull!`;
    sendNotification(
      title,
      message,
      pushData,
      `https://supergems.xyz/trade/${hash}`,
    );
  }
}

async function switchSuccessfulllWithdraw(address, donation) {
  const pushData = await findPushKey(address);
  if (pushData !== null) {
    const title = `Switch withdrawal was successfull!`;
    const message = `Your items are successfully back in your wallet`;
    sendNotification(
      title,
      message,
      pushData,
      `https://beta.supergems.xyz/d/portfolio`,
    );
  }
}



module.exports = {
  recivedProposalOffer,
  tradeAccepted,
  switchDonationSuccessfull,
  switchSomebodySwitched,
  switchSuccessfullSwitch,
};
