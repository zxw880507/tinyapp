// server setup
const express = require('express');
const bcrypt = require('bcrypt');
const {
  getUserByEmail,
  generateRandomString,
  emptyInput,
  urlsForUser,
  Client,
  ShortURL
} = require('./helpers');
const app = express();
const PORT = 8080;
// ------------------------------------------------------------

// middlewire setup
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['some-secret-key', 'a-very-long-secret-key']
}));
app.set('view engine', "ejs");
// ------------------------------------------------------------


// url database template
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// users data template
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// router
// get to main page
app.get(`/`, (req, res) => {
  const sessID = req.session.userID;
  users[sessID] ? res.redirect('/urls') : res.redirect('/login');
});

// get request for register/login page
app.get(`/register`, (req, res) => {
  const sessID = req.session.userID;
  const templateVars = { user: users[sessID] };
  templateVars.user ? res.redirect('/urls') : res.render('urls_register', templateVars);

});
app.get(`/login`, (req, res) => {
  const sessID = req.session.userID;
  const templateVars = { user: users[sessID] };
  templateVars.user ? res.redirect('/urls') : res.render('urls_login', templateVars);
});
// post request for login
app.post(`/login`, (req, res) => {
  const { email, password } = req.body;
  const findUser = getUserByEmail(email, users);
  if (findUser) {
    const hashed = users[findUser].hashedPassword;
    const verifyPassword = bcrypt.compareSync(password, hashed);
    if (verifyPassword) {
      req.session.userID = findUser;
      res.redirect(`/urls`);
    } else {
      res.status(403).send('Password is incorrect!');
    }
  } else {
    res.status(403).send('Email does not exist!');
  }
});
// post request for register
app.post('/register', (req, res) => {
  const emptyKey = emptyInput(req.body);
  const { email, password } = req.body;
  if (emptyKey.length) {
    res.status(400).send(`${emptyKey.join(' & ')} can not be empty!`);
  } else {
    const findUser = getUserByEmail(email, users);
    if (findUser) {
      res.status(400).send('Email has been registered');
    } else {
      const id = generateRandomString();
      const client = new Client(id, email, password);
      users[id] = client;
      req.session.userID = client.id;
      res.redirect('/urls');
    }
  }
});
// get to the url list page
app.get('/urls', (req, res) => {
  const sessID = req.session.userID;
  if (sessID in users) {
    const idData = urlsForUser(urlDatabase, sessID);
    const templateVars = { idData, user: users[sessID] };
    res.render('urls_index', templateVars);
  } else {
    res.send('Please login first!');
  }

});
// get to new url page
app.get("/urls/new", (req, res) => {
  const sessID = req.session.userID;
  if (sessID in users) {
    const templateVars = { user: users[sessID] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }

});
// post request to create a shortURL
app.post('/urls', (req, res) => {
  const sessID = req.session.userID;
  if (sessID in users) {
    const shortURL = generateRandomString();
    const newURL = new ShortURL(req.body.longURL, sessID);
    urlDatabase[shortURL] = newURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send('Please login first!');
  }
});
// redirect to a short-related longURL
app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  if (urlDatabase[shortURL]) {
    const urlInfo = urlDatabase[shortURL];
    const longURL = urlInfo.longURL;
    urlInfo.addNumberOfVisits().addUniVisits(req.ip);
    res.redirect(longURL);
  } else {
    res.status(403).send('The shortURL you\'re attempting to visit doesn\'t exist!!!');
  }
});
// get to shortURL detail page
app.get('/urls/:shortURL', (req, res) => {
  const sessID = req.session.userID;
  const { shortURL } = req.params;
  if (!users[sessID]) {
    res.status(403).send('Please login first');
  } else if (!urlDatabase[shortURL]) {
    res.status(403).send('The shortURL you\'re attempting to visit doesn\'t exist!!!');
  } else if (sessID !== urlDatabase[shortURL].userID) {
    res.status(403).send('Error! Access without permission!');
  } else {
    const idData = urlsForUser(urlDatabase, sessID);
    const info = idData[shortURL];
    const user = users[sessID];
    const templateVars = { shortURL, info, user };
    res.render('urls_show', templateVars);
  }

});
// post request to modify a longURL
app.post('/urls/:shortURL', (req, res) => {
  const sessID = req.session.userID;
  const { shortURL } = req.params;
  if (!users[sessID]) {
    res.status(403).send('Please login first');
  } else if (!urlDatabase[shortURL] || sessID !== urlDatabase[shortURL].userID) {
    res.status(403).send('You are not allowed to change the URL without permission!');
  } else {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  }
});
// post request to delete a shortURL
app.post(`/urls/:shortURL/delete`, (req, res) => {
  const sessID = req.session.userID;
  const { shortURL } = req.params;
  if (!users[sessID]) {
    res.status(403).send('Please login first');
  } else if (!urlDatabase[shortURL] || sessID !== urlDatabase[shortURL].userID) {
    res.status(403).send('You are not allowed to delete this URL without permission!');
  } else {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  }
});
//back to logout
app.post(`/logout`, (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});
// port listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});