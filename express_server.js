// Server Setup
const express = require('express');
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
const loginCheck = (userInput, userData, value) => {
    return Object.keys(userData).filter(id => userData[id][value] === userInput[value])[0];
};
// ------------------------------------------------------------

// helper to test if either email or password is empty
const emptyInput = (object) => {
    for (let key in object) {
        if (object[key] === "") {
            return key;
        }
    }
};
// ------------------------------------------------------------
// url database
const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "default" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "default" }
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
        this.id = id;
        this.email = email;
        this.password = password;
    }
}
// ------------------------------------------------------------
class ShortURL {
    constructor(longURL, userID) {
        this.longURL = longURL;
        this.userID = userID;
    }
}
// router list
app.get(`/`, (req, res) => {
    res.send(`Hello!`);
});
app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});
// get request for register page
app.get(`/register`, (req, res) => {
    const templateVars = { user: req.cookies['user_id'] };
    res.render('urls_register', templateVars);
});
app.get(`/login`, (req, res) => {
    const templateVars = { user: req.cookies['user_id'] };
    res.render('urls_login', templateVars);
});
// ------------------------------------------------------------
app.post(`/login`, (req, res) => {
    const checkIDByEmail = loginCheck(req.body, users, 'email');
    if (checkIDByEmail && users[checkIDByEmail].password === req.body.password) {
        res.cookie('user_id', users[checkIDByEmail], { expires: new Date(+new Date() + 900000), httpOnly: true });
        res.redirect(`/urls`);
    } else {
        res.status(403).send('Email/Password is incorrect');
    }
});
// post request to add registration to data while clients submit register info
app.post('/register', (req, res) => {
    const emptyCheck = emptyInput(req.body);
    if (emptyCheck) {
        res.status(400).send(`Email/Password can not be empty`);
    } else {
        const check = loginCheck(req.body, users, 'email');
        if (check) {
            res.status(400).send('Email has been registered');
        } else {
            const id = generateRandomString();
            const client = new Client(id, req.body.email, req.body.password);
            users[id] = client;
            res.cookie('user_id', client, { expires: new Date(+new Date() + 900000), httpOnly: true });
            res.redirect('/urls');
        }
    }
});
// ------------------------------------------------------------
app.get('/urls', (req, res) => {
    if (req.cookies[`user_id`]) {
        const templateVars = { urlDatabase, user: req.cookies['user_id'] };
        res.render('urls_index', templateVars);
    } else {
        res.redirect('/login');
    }

});
app.get("/urls/new", (req, res) => {
    const templateVars = { user: req.cookies['user_id'] };
    res.render("urls_new", templateVars);
});
app.post('/urls', (req, res) => {
    const shortURL = generateRandomString();
    const newURL = new ShortURL(req.body.longURL, req.cookies['user_id'].id);
    urlDatabase[shortURL] = newURL;
    res.redirect(`/urls/${shortURL}`);
});
app.get('/u/:shortURL', (req, res) => {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});
app.get('/urls/:shortURL', (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: req.cookies['user_id'] };
    res.render('urls_show', templateVars);
});
app.post('/urls/:shortURL', (req, res) => {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
});
app.post(`/urls/:shortURL/delete`, (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
});

app.post(`/logout`, (req, res) => {
    res.clearCookie('user_id');
    res.redirect(`/login`);
});
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});