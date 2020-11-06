const express = require('express')
const app =express()
const sqlite3 = require('sqlite3')
const path = require('path')
const bodyParser = require('body-parser')
//basic認証
var basicAuth = require('basic-auth-connect');
const { send } = require('process')

const dbPath = "app/db/database.sqlite3"

app.use(basicAuth(
  'user', 'password'
))

//リクエストのbodyをパースする設定
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//_dirname=C:\develop\basic-rest-api\appになっていて'publicとつなげるだけ'
//publicディレクトリを静的ﾌｧｲﾙ軍のルートディレクトリとして設定
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
app.get('/api/v1/users/:id',(req, res) => {
    const db = new sqlite3.Database(dbPath)
    const id = req.params.id

    db.get(`SELECT * FROM users WHERE id=${id}`, (err,row) => {
        if(!row) {
            // res.status(404).send({error:"Not Found!"})
            res.status(404).send({error:"Not Found!"})
        } else {
            //resはjsonというメソッドを持っていて引数で指定したjsonをそのまま返す。
            res.status(200).json(row)
        }
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

const run = async (sql,db) => {
    return new Promise((resolve, reject) =>{
        db.run(sql,(err) => {
            if (err) {
                return reject(err)
            } else {
                return resolve()
            }
        })
    })
}

// Create a new user
app.post('/api/v1/users/',async(req, res) => {
    if (!req.body.name || req.body.name ==="") {
        res.status(400).send({error:"ユーザー名が指定されていません"})
    } else {
        //connect database
        const db = new sqlite3.Database(dbPath)

        const name = req.body.name
        const profile = req.body.profile ? req.body.profile : ""
        const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : ""

        try {
            //runは失敗したときにrejectを返しそうするとcatchがエラーとしてキャッチしてくれる。
            await run(
                `INSERT INTO users (name, profile, date_of_birth) VALUES ("${name}","${profile}","${dateOfBirth}")`,
                db
            )

            res.status(201).send({message:"新規ユーザーを作成しました。"})
        } catch (e) {
            res.status(500).send({error:e})
        }
        db.close()
    }
})
// Update user data
app.put('/api/v1/users/:id',async(req, res) => {
    if (!req.body.name || req.body.name ==="") {
        res.status(400).send({error:"ユーザー名が指定されていません"})
    } else {
        //connect database
        const db = new sqlite3.Database(dbPath)
        const id = req.params.id

        //現在のユーザー情報を取得する
        db.get(`SELECT * FROM users WHERE id=${id}`,async(err,row) => {
            if (!row) {
                res.status(404).send({error:"指定されたユーザーが見つかりません"})
            } else {
                //resはjsonというメソッドを持っていて引数で指定したjsonをそのまま返す。
                const name = req.body.name ? req.body.name : row.name
                const profile = req.body.profile ? req.body.profile : row.profile
                const dateOfBirth = req.body.date_of_birth ? req.body.date_of_birth : row.date_of_birth

                try {
                    await run(
                        `UPDATE  users SET name="${name}",profile="${profile}",date_of_birth="${dateOfBirth}" WHERE id=${id}`,
                        db
                    )
                    res.status(200).send({message:"ユーザー情報を更新しました。"})
                } catch (e) {
                    res.status(500).send({error:e})
                }
            }
        })
        db.close()
    }
})

// Delete user data
app.delete('/api/v1/users/:id',async(req, res) => {
    //connect database
    const db = new sqlite3.Database(dbPath)
    const id = req.params.id

    //現在のユーザー情報を取得する
    db.get(`SELECT * FROM users WHERE id=${id}`,async(err,row) => {
        if (!row) {
            res.status(404).send({error:"指定されたユーザーが見つかりません"})
        } else {
            try {
                await run(
                    `DELETE FROM users WHERE id=${id}`,
                    db
                )
                res.status(200).send({message: "ユーザーを削除しました。"})
            } catch(e){
                alert("aaa");
                res.status(500).send({error:e})
            }
        }
    })
    db.close()
})

// Get following users
app.get('/api/v1/users/:id/following',(req, res) => {
    //connect database
    const db = new sqlite3.Database(dbPath)
    //リクエストURLの:hogeをとってくることができる
    const id = req.params.id
    db.all(`SELECT * FROM following LEFT JOIN  users ON following.followed_id = users.id WHERE following_id=${id}`,(err,rows) => {
        //resはjsonというメソッドを持っていて引数で指定したjsonをそのまま返す。
        if (!rows) {
            res.staatus(404).send({error:"Not Found"})
        } else {
            res.status(200).json(rows)
        }
    })
    db.close()
})

// Get a following users
// id フォローする側 followed_id フォローされる側
app.get('/api/v1/users/:id/following/:followed_id',(req, res) => {
    //connect database
    const db = new sqlite3.Database(dbPath)
    //リクエストURLの:hogeをとってくることができる
    const id = req.params.id
    const followiedID = req.params.followed_id

    //idで指定した人がfollower_idで指定した人をフォローしていればその情報を返す(followingテーブルとusersテーブルを結合したままの情報で返す)
    db.get(`SELECT * FROM following LEFT JOIN  users ON following.followed_id = users.id WHERE following_id=${id} and followed_id=${followiedID}`,(err,row) => {
        //resはjsonというメソッドを持っていて引数で指定したjsonをそのまま返す。
        if (!row) {
            res.status(404).send({error:"Not Found"})
        } else {
            res.status(200).json(row)
        }
    })
    db.close()
})

// follow機能
// id フォローする人 followed_id フォローされる人
app.post('/api/v1/users/:id/following/:followed_id',async (req, res) => {
    //connect database
    const db = new sqlite3.Database(dbPath)
    //リクエストURLの:hogeをとってくることができる
    const id = req.params.id
    const followedID = req.params.followed_id

    //usersテーブルにフォローする人が存在することを確認
    db.get(`SELECT * FROM users WHERE id=${id}`,async(err,row) => {
        if (!row) {
            res.status(404).send({error:"フォローする側のユーザーが見つかりません"})
        } else {
            //usersテーブルにフォローされる人が存在することを確認
            db.get(`SELECT * FROM users WHERE id=${followedID}`,async(err,row) => {
                if (!row) {
                    res.status(404).send({error:"フォローされる側のユーザーが見つかりません"})
                } else {
                    try {
                        //runは失敗したときにrejectを返しそうするとcatchがエラーとしてキャッチしてくれる。
                        await run(
                            `INSERT INTO following (following_id, followed_id) VALUES ("${id}","${followedID}")`,
                            db
                        )
                        res.status(201).send({message:`${id}は${followedID}をフォローしました。`})
                    } catch (e) {
                        res.status(500).send({error:e})
                    }
                }
            })
        }
    })

    db.close()
})


// follow解除機能
// id フォローしている人 followed_id フォローされている人
app.delete('/api/v1/users/:id/following/:followed_id',async (req, res) => {
    //connect database
    const db = new sqlite3.Database(dbPath)
    //リクエストURLの:hogeをとってくることができる
    const id = req.params.id
    const followedID = req.params.followed_id

    //動きに問題がないのでユーザーの存在確認はしない
    try {
        await run(
            `DELETE FROM following WHERE following_id=${id} and followed_id=${followedID}`,
            db
        )
        res.status(200).send({message: "フォローを解除しました。"})
    } catch(e){
        res.status(500).send({error:e})
    }
    db.close()
})

const port = process.env.PORT || 3000;
app.listen(port)
console.log("Listen on port:" + 3000);