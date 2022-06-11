// loading the environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");

const port = 3000;

// initializing the passport
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => {
    users.find((user) => user.email === email);
  },
  (id) => {
    users.find((user) => user.id === id);
  }
);

// local variable for storing
const users = [];

// set ejs engine template
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.set(expressLayouts);
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// static files and directory
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));

// routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/welcome", checkAuth, (req, res) => {
  res.render("welcome");
});

app.get("/login", checkNotAuth, (req, res) => {
  res.render("sign-in");
});

app.get("/register", checkNotAuth, (req, res) => {
  res.render("sign-up");
});

// post-mrthods
app.post(
  "/login",
  checkNotAuth,
  passport.authenticate("local", {
    successRedirect: "/welcome",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", checkNotAuth, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
});

// user logout
app.delete("/logout", (req, res) => {
  req.logOut();
  req.redirect("/login");
});

// checking authenticate
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuth(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/welcome");
  }
  next();
}

// running in the port
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
