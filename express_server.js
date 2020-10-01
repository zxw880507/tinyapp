// Server Setup
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
// ------------------------------------------------------------

// middlewire import
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', "ejs");
// ------------------------------------------------------------

// function generates six Alpha-numerical digits
const generateRandomString = () => {
    const randomChar = () => {
        return String.fromCharCode(Math.floor(Math.random() * 75) + 48);
    };
    let str = '';
    for (let index = 0; index < 6; index++) {
        let newChar = randomChar();
        /[0-9a-z]/i.test(newChar) ? str += newChar : index--;
    }
    return str;
};
// ------------------------------------------------------------

// helper function to test if users' email has already beeen registered
const getUserByEmail = (email, userData) => {
    return Object.keys(userData).filter(user => userData[user].email === email)[0];
};
// ------------------------------------------------------------

// helper to test if either email or password is empty
const emptyInput = (object) => {
    let emptykey = [];
    for (let key in object) {
        if (object[key] === "") {
            emptykey.push(key);
        }
    }
    return emptykey;
};
// ------------------------------------------------------------

//urlsForUser(id)
const urlsForUser = (id) => {
    let matchURL = {};
    Object.keys(urlDatabase).forEach(key => {
        if (urlDatabase[key].userID === id) {
            matchURL[key] = urlDatabase[key];
        }
    });
    return matchURL;
};
// url database
const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
// ------------------------------------------------------------

// Create users data
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
// ------------------------------------------------------------
class Client {
    constructor(id, email, password) {
        this._id = id;
        this._email = email;
        this._hashedPassword = bcrypt.hashSync(password, 10);
    }
    get id() {
        return this._id;
    }
    get email() {
        return this._email;
    }
    get hashedPassword() {
        return this._hashedPassword;
    }
}
// ------------------------------------------------------------
class ShortURL {
    constructor(longURL, userID) {
        this._longURL = longURL;
        this._userID = userID;
        this._numOfVisits = 0;
        this._createDate = new Date();
        this._uniVisits = [];
    }
    get longURL() {
        return this._longURL;
    }
    set longURL(url) {
        this._longURL = url;
    }
    get userID() {
        return this._userID;
    }
    get numOfVisits() {
        return this._numOfVisits;
    }
    get createDate() {
        return this._createDate;
    }
    get uniVisits() {
        return this._uniVisits.length;
    }
    addNumberOfVisits() {
        this._numOfVisits++;
        return this;
    }
    addUniVisits(ip) {
        if (!this._uniVisits.includes(ip)) {
            this._uniVisits.push(ip);
        }
        return this;
    }
};
// router list
app.get(`/`, (req, res) => {
    req.cookies[`user_id`] ? res.redirect('/urls') : res.redirect('/login');
});

// get request for register page
app.get(`/register`, (req, res) => {
    const templateVars = { user: req.cookies['user_id'] };
    templateVars.user ? res.redirect('/urls') : res.render('urls_register', templateVars);

});
app.get(`/login`, (req, res) => {
    const templateVars = { user: req.cookies['user_id'] };
    templateVars.user ? res.redirect('/urls') : res.render('urls_login', templateVars);
});
// ------------------------------------------------------------
app.post(`/login`, (req, res) => {
    const { email, password } = req.body;
    const findUser = getUserByEmail(email, users);
    if (findUser) {
        const hashed = users[findUser].hashedPassword;
        const verifyPassword = bcrypt.compareSync(password, hashed);
        if (verifyPassword) {
            res.cookie('user_id', users[findUser], { expires: new Date(+new Date() + 900000), httpOnly: true });
            res.redirect(`/urls`);
        } else {
            res.status(403).send('Password is incorrect!');
        }
    } else {
        res.status(403).send('Email does not exist!');
    }
});
// post request to add registration to data while clients submit register info
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
            console.log(client);
            res.cookie('user_id', client, { expires: new Date(+new Date() + 900000), httpOnly: true });
            res.redirect('/urls');
        }
    }
});
// ------------------------------------------------------------
app.get('/urls', (req, res) => {
    if (req.cookies[`user_id`]) {
        const idData = urlsForUser(req.cookies[`user_id`].id);
        const templateVars = { idData, user: req.cookies['user_id'] };
        res.render('urls_index', templateVars);
    } else {
        res.send('Please login first!');
    }

});
app.get("/urls/new", (req, res) => {
    if (req.cookies['user_id']) {
        const templateVars = { user: req.cookies['user_id'] };
        res.render("urls_new", templateVars);
    } else {
        res.redirect('/login');
    }

});
app.post('/urls', (req, res) => {
    if (req.cookies['user_id']) {
        const shortURL = generateRandomString();
        const newURL = new ShortURL(req.body.longURL, req.cookies['user_id'].id);
        urlDatabase[shortURL] = newURL;
        res.redirect(`/urls/${shortURL}`);
    } else {
        res.status(403).send('Please login first!');
    }
});
app.get('/u/:shortURL', (req, res) => {
    if (urlDatabase[req.params.shortURL]) {
        const urlInfo = urlDatabase[req.params.shortURL];
        const longURL = urlInfo.longURL;
        urlInfo.addNumberOfVisits().addUniVisits(req.ip);
        res.redirect(longURL);
    } else {
        res.status(403).send('The shortURL you\'re attempting to visit doesn\'t exist!!!');
    }
});
app.get('/urls/:shortURL', (req, res) => {
    if (!req.cookies['user_id']) {
        res.status(403).send('Please login first');
    } else if (!urlDatabase[req.params.shortURL]) {
        res.status(403).send('The shortURL you\'re attempting to visit doesn\'t exist!!!');
    } else if (req.cookies['user_id'].id !== urlDatabase[req.params.shortURL].userID) {
        res.status(403).send('You are trying to access this shortURL without permission!');
    } else {
        const idData = urlsForUser(req.cookies[`user_id`].id);
        const shortURL = req.params.shortURL;
        const info = idData[shortURL];
        const user = req.cookies[`user_id`];
        const templateVars = { shortURL, info, user };
        res.render('urls_show', templateVars);
    }

});
app.post('/urls/:shortURL', (req, res) => {
    if (!req.cookies['user_id']) {
        res.status(403).send('Please login first');
    } else if (!urlDatabase[req.params.shortURL] || req.cookies['user_id'].id !== urlDatabase[req.params.shortURL].userID) {
        res.status(403).send('You are not allowed to change the URL without permission!');
    } else {
        urlDatabase[req.params.shortURL].longURL = req.body.longURL;
        res.redirect(`/urls`);
    }
});
app.post(`/urls/:shortURL/delete`, (req, res) => {
    if (!req.cookies['user_id']) {
        res.status(403).send('Please login first');
    } else if (!urlDatabase[req.params.shortURL] || req.cookies['user_id'].id !== urlDatabase[req.params.shortURL].userID) {
        res.status(403).send('You are not allowed to delete this URL without permission!');
    } else {
        delete urlDatabase[req.params.shortURL];
        res.redirect(`/urls`);
    }
});

app.post(`/logout`, (req, res) => {
    res.clearCookie('user_id');
    res.redirect(`/login`);
});
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});