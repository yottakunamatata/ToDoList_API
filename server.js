// node.js 內建套件
const http = require('http'); 
// npm 外部套件
const { v4: uuidv4 } = require('uuid');
// 自己寫的套件
const errHandle = require('./errorHandle')

const todos = []

const requestListener = (req,res)=>{
    console.log(req.method,req.url)
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }
    let body = ""
    let num = 0
    req.on('data',chunk =>{
        body+=chunk
        num+=1
        console.log(chunk)
        console.log(num)
    })

    if(req.url =="/todos" && req.method =="GET"){
        res.writeHead(200,headers)
        //  要把物件轉成字串才能回傳
        res.write(JSON.stringify(
            {
                "status":"succes",
                "data": todos         
            }
        ))
        res.end()
    }else if(req.url =="/todos" && req.method =="POST"){
        req.on('end',()=>{
        try{
        // 避免錯誤: 1. 回傳的資料不是JSON格式
        // 避免錯誤: 2. 回傳的欄位資訊不對 
        const title = JSON.parse(body).title
        if(title !== undefined){
            const todo = {
            "title": title,
            "id": uuidv4()
        }
        todos.push(todo)
        console.log(todos)
        res.writeHead(200,headers)
        res.write(JSON.stringify(
            {
                "status":"succes",
                "data": todos    
            }
        ))
        res.end()
        }else{
            errHandle(res)        
        }

        }catch(error){
        errHandle(res)
        }
        
    })
    }
    // 刪除全部
    else if(req.url =="/todos" && req.method =="DELETE"){
        // 刪除todos中既有資料
        todos.length = 0 
        res.writeHead(200,headers)
        res.write(JSON.stringify(
            {
                "status":"succes",
                "data": todos      
            }
        ))
        res.end()

    }
    // 逐筆刪除
    else if(req.url.startsWith("/todos/") && req.method =="DELETE"){
        const id = req.url.split('/').pop()
        const index = todos.findIndex(element => element.id == id)
        if(index != -1){
            todos.splice(index,1)
            res.writeHead(200,headers)
            res.write(JSON.stringify(
            {
                "status":"succes",
                "data": todos,
            }
        ))
        res.end()
        }else{
            errHandle(res)
        }
    }
    else if(req.url.startsWith("/todos/") && req.method =="PATCH"){
        req.on('end',()=>{
            try{
                const todo = JSON.parse(body).title
                const id = req.url.split('/').pop()
                const index = todos.findIndex(element => element.id == id)
                if(todo !== undefined && index !== -1){
                    todos[index].title = todo
                    res.writeHead(200,headers)
                    res.write(JSON.stringify({
                        "status":"sucess",
                        "data": todos
                    }))
                    res.end()
                }else{
                    errHandle(res)
                }
            }catch{
                errHandle(res)
            }
        })
    }
    else if(req.method == "OPTIONS"){
        res.writeHead(200,headers)
        res.end()
    }
    else{
        res.writeHead(404,headers)
        res.write(JSON.stringify(
            {
                "status":"fail",
                "message":"無此網站路由"           
            }
        ))
        res.end()
        // console.log("404, not found")
    }
}

// 有使用者進來就會觸發
const server = http.createServer(requestListener)
server.listen(3005)