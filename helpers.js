// helper function to test if users' email has already beeen registered
const bcrypt = require('bcrypt');
const getUserByEmail = (email, userData) => {
  return Object.keys(userData).filter(user => userData[user].email === email)[0];
};

// function generates six Alpha-numerical digits
// generates a single character from charcode(48 to 122)
const randomChar = () => {
  return String.fromCharCode(Math.floor(Math.random() * 75) + 48);
};
const generateRandomString = () => {
  let str = '';
  for (let index = 0; index < 6; index++) {
    let newChar = randomChar();
    /[0-9a-z]/i.test(newChar) ? str += newChar : index--;
  }
  return str;
};
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
//filter client's url data by id
const urlsForUser = (database, id) => {
  let matchURL = {};
  Object.keys(database).forEach(key => {
    if (database[key].userID === id) {
      matchURL[key] = database[key];
    }
  });
  return matchURL;
};
// Client class is used to create instance to store registrar's infomation
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
/* Class to create an instance once a shortURL generates, it will store related contents including
longURL, creator's ID, number of visits, created date and some methods to update some properties */
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
    url ? this._longURL = url : this._longURL;
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
}
module.exports = { getUserByEmail, generateRandomString, emptyInput, urlsForUser, Client, ShortURL };