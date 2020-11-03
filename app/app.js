const express = require('express')
const app =express()
const sqlite3 = require('sqlite3')
const path = require('path')
//basic認証
var basicAuth = require('basic-auth-connect');

const dbPath = "app/db/database.sqlite3"

app.use(basicAuth(
  'user', 'password'
))

//_dirname=C:\develop\basic-rest-api\appになっていて'publicとつなげるだけ'
app.use(express.static(path.join(__dirname, 'public')))

app.get('/api/v1/hello',(req, res) =>{
    console.log(new sqlite3.Database(dbPath));
    console.log(__dirname)
})

// Get all users
app.get('/api/v1/users',(req, res) => {
    //connect database
    const db = new sqlite3.Database(dbPath)
    db.all('SELECT * FROM users',(err,rows) => {
        //resはjsonというメソッドを持っていて引数で指定したjsonをそのまま返す。
        res.json(rows)
    })
    db.close()
})

//Get a user
app.get('/api/v1/users:id',(req, res) => {
    const db = new sqlite3.Database(dbPath)
    const id = req.params.id

    db.get(`SELECT * FROM users WHERE id =${id}`, (err,rows) => {
        //resはjsonというメソッドを持っていて引数で指定したjsonをそのまま返す。
        res.json(rows)
    })
    db.close()
})

//Serach users matching keyword
app.get('/api/v1/search',(req, res) => {
    const db = new sqlite3.Database(dbPath)
    const keyword = req.query.q

    // %????% は????の部分一致となる。
    db.all(`SELECT * FROM users WHERE name LIKE "%${keyword}%"`, (err,rows) => {
        //resはjsonというメソッドを持っていて引数で指定したjsonをそのまま返す。
        res.json(rows)
    })
    db.close()
})


const port = process.env.PORT || 3000;
app.listen(port)
console.log("Listen on port:" + 3000);