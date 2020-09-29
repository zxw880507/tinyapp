const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', "ejs");
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};
app.get(`/`, (req, res) => {
    res.send(`Hello!`);
});
app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
});
app.get(`/hello`, (req, res) => {
    res.send(`<html><body>Hello <b>World</b></body></html>\n`);
});
app.get('/urls', (req, res) => {
    const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
    res.render('urls_index', templateVars);
});
app.get("/urls/new", (req, res) => {
    const templateVars = { username: req.cookies['username'] };
    res.render("urls_new", templateVars);
});
app.post('/urls', (req, res) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
});
app.get('/u/:shortURL', (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});
app.get('/urls/:shortURL', (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
    res.render('urls_show', templateVars);
});
app.post('/urls/:shortURL', (req, res) => {
    urlDatabase[req.params.shortURL] = req.body.longURL;

    res.redirect(`/urls`);
})
app.post(`/urls/:shortURL/delete`, (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
});
app.post('/login', (req, res) => {
    const cookies = req.body.username;
    res.cookie('username', cookies, { expires: new Date(+new Date() + 900000), httpOnly: true });
    res.redirect('/urls');
});
app.post(`/logout`, (req, res) => {
    res.clearCookie('username');
    res.redirect(`/urls`);
})
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});