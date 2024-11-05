require("dotenv").config()
const express = require("express")
const jwt = require("jsonwebtoken")
const app = express()

app.use(express.json())

const tokens = []

const posts = [
    {
        "username": "Alice",
        "id": 1,
        "content": "This is Alice's content."
    },
    {
        "username": "Bob",
        "id": 2,
        "content": "This is Bob's content."
    },
    {
        "username": "Charlie",
        "id": 3,
        "content": "This is Charlie's content."
    },
    {
        "username": "Diana",
        "id": 4,
        "content": "This is Diana's content."
    }
]
function generateToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '80s' })
}

app.get("/posts", auth, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.username))
})

app.post("/login", (req, res) => {

    const username = req.body.username;
    const user = { username: username }
    const acessToken = generateToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    tokens.push(refreshToken)
    res.send({ acessToken: acessToken, refreshToken: refreshToken })
})

app.post("/token", (req, res) => {
    const token = req.body.token;
    if (token === null) return res.sendStatus(401)
    const auth = tokens.find(() => token === token)
    if (auth === null) return res.sendStatus(403)
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateToken(user)
        res.json({ accessToken: accessToken })
    })

})

function auth(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user
        next()
    })
}

app.listen(3000)