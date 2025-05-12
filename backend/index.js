const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB=require('./db/config.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./modals/user.js');
const http = require('http');
const { connectRabbitMQ } = require("./rabbit.js");
const ngrok=require('@ngrok/ngrok')
// const {setNgrokUrl}=require('./ngrokConfig.js')


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(cors({ origin: "*", credentials: true }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//  MongoDB session store setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'ASDFGHJKL',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    ttl: 14 * 24 * 60 * 60, 
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    sameSite: 'lax'
  }
}));
connectRabbitMQ();
// Routes
app.use("/api/v1/auth", require("./routes/userRoutes.js"));
app.use("/api/v1/customer", require("./routes/customerRoutes.js"));
app.use("/api/v1/order", require("./routes/orderRoutes.js"));
app.use("/api/v1/test",require("./routes/testRoutes.js"));
app.use("/api/v1/campaign",require("./routes/campaignRoutes.js"));

//  admin exists function
(async () => {
  try {
    await User.ensureAdminExists();
    console.log("Admin account verified/created.");
  } catch (err) {
    console.error("Error ensuring admin account:", err);
  }
})();

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Node Server Running On Port ${PORT}`);
});
// ngork connection for localenv 
// ngrok.connect({ addr: 8080, authtoken_from_env: true })
//   .then(listener => {
//     const url = listener.url();
//     setNgrokUrl(url); 
//     console.log(`🔗 ngrok tunnel started at: ${url}`);
//   });
