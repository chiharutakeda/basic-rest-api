const express = require('express')
const app =express()

app.get('/api/v1/hello',(req, res) => {
    //resはjsonというメソッドを持っていて引数で指定したjsonをそのまま返す。
    res.json({"message":"Hello World!"})
})

const port = process.env.PORT || 3000;
app.listen(port)
console.log("Listen on port:" + 3000);