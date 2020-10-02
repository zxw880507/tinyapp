# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
#### *Key Value*
- usersData & urlData are generated as instances of their class, all of the data inside is read-only except the related longURL which is modifiable depending on user's request
- response 403 with message reports either email or password is empty, or both after commited a falsey register
- display the date of each shortURL created
- shows the number of times a given shortURL was visited
- shows the number of unique visits on a given shortURL based on the request IP address 
## Final Product

!["screenshot of register page"](https://github.com/zxw880507/tinyapp/blob/master/docs/register-page.png?raw=true)
!["screenshot of urls page"](https://github.com/zxw880507/tinyapp/blob/master/docs/urls-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- [optional] mocha & chai (test helpers function)

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.