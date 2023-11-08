var mysql = require('mysql');
var express = require('express');
const bodyParser= require('body-parser');
const path = require('path')
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname,'images')));

var db = mysql.createConnection({
  host: "localhost",
  user: "clinic",
  password: "Pass@1234",
  database: 'clinicdata'
});

db.connect((err) =>{
  if (err) throw err;
  console.log("Connected!");
});

app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname,'public','user.html'));
});

app.post('/register',(req,res)=>{
  const {username, email, password}=req.body;
  const user = {
    username: username,
    email: email,
    password: password
  };
  db.query('INSERT INTO users SET ?',user,(err,result)=>{
    if(err) throw err;
    console.log('User registered Successfully !');
    res.sendFile(path.join(__dirname,'public','index.html'));
  });
});

app.post('/login',(req,res)=>{
  const {email, password} = req.body;
  db.query('SELECT * FROM users WHERE email = ?',[email],(err,results)=>{
    if(err) throw err;
    if (results.length > 0) {
      const user = results[0];
      if(password == user.password)
      {
        res.send("Login SuccessFul !");
        res.sendFile(path.join(__dirname,'public','index.html'));
      }
      else{
        res.send("Wrong Credentials!");
      }
    }
    else{
      res.send("User not Found!");
    }
    });
});

app.listen(3000,()=>{
  console.log("Server is running....!");
});

