require("dotenv").config();
const auth = require("./routes/auth");

const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const NodeCache = require("node-cache");

const cache = new NodeCache(); // Initialize without TTL, we'll set it dynamically

const PORT = process.env.PORT || 4002;
app.use(
  cors({
    origin: process.env.CORS_URL || "*", // Or an array of allowed origins
    methods: ["GET", "PUT", "POST", "DELETE"], // Or 'PUT', 'DELETE', etc.
    allowedHeaders: ["Content-Type", "Authorization"], // Or 'X-Requested-With', etc.
  }),
);
app.use(express.json());

// Authentication middleware
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/auth")) {
    return next();
  }
  if (req.originalUrl.startsWith("/api/o")) {
    return next();
  }
  return auth.authenticateToken(req, res, next);
});

// Caching middleware
function cacheMiddleware(defaultTTL) {
  return (req, res, next) => {
    // Exclude /api/auth endpoint from caching
    if (req.originalUrl.startsWith("/api/auth")) {
      return next();
    }

    // Extract user-specific data from the JWT
    const userId = req.user ? req.user.address : 'guest';
    const cacheKey = `${userId}-${req.originalUrl}`;
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      // console.log(`Cache hit for key: ${cacheKey}`);
      return res.json(cachedResponse);
    } else {
      // console.log(`Cache miss for key: ${cacheKey}`);
      res.sendResponse = res.json;
      res.json = (body) => {
        const ttl = req.customTTL || defaultTTL;
        cache.set(cacheKey, body, ttl);
        // console.log(`Cache set for key: ${cacheKey} with TTL: ${ttl} seconds`);
        res.sendResponse(body);
      };
      next();
    }
  };
}

// Apply caching middleware to all routes with default TTL of 5 hours
app.use(cacheMiddleware(300));

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});

// Routes
const openRouter = express.Router();
const collection = require("./routes/o/collection");
const open_broadcast = require("./routes/o/broadcast");
const open_proposal = require("./routes/o/proposal");
const open_marketRoutes = require("./routes/o/market");
collection(openRouter);
open_broadcast(openRouter);
open_proposal(openRouter);
open_marketRoutes(openRouter);

const authRoutes = require("./routes/auth");
const protectedRouter = express.Router();
protectedRouter.use(auth.authenticateToken);
const adminRouter = express.Router();
adminRouter.use(auth.authenticateAdmin);

// p routes
const proposalRoutes = require("./routes/p/proposal");
const userRoutes = require("./routes/p/user");
const streetRoutes = require("./routes/p/street");
const collectionRoutes = require("./routes/p/collection");
const leaderboardRoutes = require("./routes/p/leaderboard");
const switchRoutes = require("./routes/p/switch");
const notificationRoutes = require("./routes/p/notifications");
const protected_broadcast = require("./routes/p/broadcast");
proposalRoutes(protectedRouter);
userRoutes(protectedRouter);
streetRoutes(protectedRouter);
collectionRoutes(protectedRouter);
leaderboardRoutes(protectedRouter);
switchRoutes(protectedRouter);
notificationRoutes(protectedRouter);
protected_broadcast(protectedRouter);

// Admin routes /api/p/a
const adminUserRoutes = require("./routes/p/a/user");
adminUserRoutes(adminRouter);
const adminStatisticsRoutes = require("./routes/p/a/statistics");
adminStatisticsRoutes(adminRouter);

app.use("/api/o", openRouter); // Open routes - no auth
app.use("/api/auth", authRoutes);
app.use("/api/p", protectedRouter);
app.use("/api/p/a", adminRouter);

app.get("/status", (request, response) => {
  const status = {
    Status: "Running",
  };

  response.send(status);
});

app.get("/get_alchemy_token", (req, res) => {
  // endpoint to retrieve Alchemy JWT
  // read private key
  const privateKey = fs.readFileSync(__dirname + "/private_key.pem");

  // Create payload and JWT
  var token = jwt.sign({}, privateKey, {
    algorithm: "RS256", // algo used to create JWT, change to ES256 if necessary
    expiresIn: "2d", // set a 2 day expiration
  });

  return res.json({ token: token }); // return an object containing the signed JWT
});