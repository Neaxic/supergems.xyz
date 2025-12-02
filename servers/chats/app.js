require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const globals = require("./util/globals");
const { checkUserPermission, getAllPermissionsForRole } = require("./util/permissions");
const { setupTradeRoutes } = require("./routes/trades");
const { setupUserRoutes } = require("./routes/users");
const { setupMessageRoutes } = require("./routes/messages");
const { setupRoomRoutes } = require("./routes/room");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

app.use(express.static(__dirname + "/client"));

// Firebase setup
const firebaseApp = admin.initializeApp();
globals.db = firebaseApp.firestore();

// Socket middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (token) {
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        socket.auth = false;
        socket.user = { role: 'GUEST' };
      } else {
        socket.auth = true;
        // Fetch user data from Firebase
        const userDoc = await globals.db.doc(`users/${decoded.address.toLowerCase()}`).get();
        socket.user = { ...userDoc.data(), role: userDoc.data().role || 'MEMBER' };
      }
      next();
    });
  } else {
    socket.auth = false;
    socket.user = { role: 'GUEST' };
    next();
  }
});

// Socket connection handler
io.on("connection", (socket) => {
  // Cache user permissions
  const userRole = socket.auth ? (socket.user.role || 'USER') : 'GUEST';
  socket.userPermissions = new Set(getAllPermissionsForRole(userRole));

  // Setup route handlers with the new permission system
  setupTradeRoutes(socket, checkUserPermission);
  setupUserRoutes(socket, checkUserPermission);
  setupMessageRoutes(socket, checkUserPermission);
  setupRoomRoutes(io, socket, checkUserPermission);

  // Provide new connection with usefull data
  // Public data
  globals.users.push({ ...socket.user, socketId: socket.id });
  io.emit("connected")
  io.emit("message-history", globals.messages)

  if (socket.auth) {
    // Sensitive data only for authenticated users
    // io.emit("active-count", globals.users.length);
    // // io.emit("user-connected", socket.user);
    // io.emit("message-history", globals.messages);
  }

  // Handle disconnection
  socket.on("disconnect", () => {
    globals.users = globals.users.filter(user => user.socketId !== socket.id);
    io.emit("active-count", globals.users.length);

    // if (socket.auth) {
    //   globals.users = globals.users.filter(user => user.socketId !== socket.id);
    //   io.emit("active-count", globals.users.length);
    // }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});