var mysql = require('mysql');
var express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const accountSid = 'ACe0b7a55e22b79a4a619765f22ca4ab50';
const authToken = 'e2fae9728552f16d8d4dbf5611bd17d6';
const client = require('twilio')(accountSid, authToken);
const passport = require('passport');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());

//Use express-session middleware
app.use(session(
  {
    secret: 'qwertyuiop',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // Set to a reasonable value in milliseconds
    },
  }
));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

var db = mysql.createConnection({
  host: "localhost",
  user: "poshan",
  password: "Poshan@1234",
  database: 'poshan'
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

//Function to generate a JWT token
function generateToken(user) {
  const token = jwt.sign({ id: user.id, email: user.email }, 'qwertyuiop', { expiresIn: '1h' });
  return token;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/admin', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM admins WHERE email = ?', [email], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const user = results[0];
      if (password == user.password) {
        req.session.userId = user.id;
        res.redirect('/adashboard');
      }
      else {
        res.send("Wrong Credentials!");
      }
    }
    else {
      res.send("User not Found!");
    }
  });
});

app.post('/user', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {

    if (err) throw err;
    if (results.length > 0) {
      const user = results[0];
      req.session.userId = user.id;
      if (password == user.password) {
        // Create a session or token
        const token = generateToken(user);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 }); // Set the token as a cookie
        res.redirect('/user');
      }
      else {
        
        res.redirect('index.html?error=Invalid%20credentials');
      }
    }
    else {
      res.send("User not Found!");
    }
  });
});
app.get('/user', (req, res) => {
  // Check if the user is authenticated (for example, check the session or token)
  // For token: verify the token
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'qwertyuiop', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/');
      } else {
        res.sendFile(path.join(__dirname, 'public', 'user.html'));
        console.log(decodedToken);
        console.log(`Welcome to the profile page, user ${decodedToken.email}!`);
      }
    });
  } else {
    // For session: check if the user is in the session
    if (req.session.userId) {
      res.sendFile(path.join(__dirname, 'public', 'user.html'));
      console.log(`Welcome to the profile page, user ID: ${req.session.userId}!`);
    } else {
      res.redirect('/');
    }
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout(function(err) {
      if (err) {
          // Handle error, if any
          console.error(err);
          return next(err);
      }
      res.clearCookie('jwt');
      // Redirect after logout
      res.redirect('/');
  });
});


//FORM1

app.post('/form1', (req, res) => {
  console.log(req.session);
  const id = req.session.userId;
  const {
    name,
    husband,
    aadhar,
    mobile,
    dob,
    category,
    ans1,
    ans2
  } = req.body;

  const insertQuery = 'INSERT INTO pregnancy_data(id, name, hname, aadhar, mobile, dob, category, first_pregnancy, miscarriage) VALUES(?,?,?,?,?,?,?,?,?)';
  const values = [
    id,
    name,
    husband,
    aadhar,
    mobile,
    dob,
    category,
    ans1,
    ans2,
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal server error");
    }
    else {
      console.log("Data inserted successfully");
      res.redirect('/user');
    }
  })


});

app.listen(3000, () => {
  console.log("Server is running....!");
});

//FORM2
app.post('/form2', (req, res) => {
  console.log(req.session);
  const id = req.session.userId;
  const {
    name,
    husband,
    aadhar,
    mobile,
    dob,
    category,
    ans1,
    infant_gender
  } = req.body;

  const insertQuery = 'INSERT INTO lactating_data(id, name, hname, aadhar, mobile, delivery, category, first_pregnancy, infant_gender) VALUES(?,?,?,?,?,?,?,?,?)';
  const values = [
    id,
    name,
    husband,
    aadhar,
    mobile,
    dob,
    category,
    ans1,
    infant_gender,
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal server error");
    }
    else {
      console.log("Data inserted successfully");
    /* client.messages
  .create({
     body: `Hello!\nData of ${name} is successfully inserted in Poshan Tracker`,
     from: 'whatsapp:+14155238886', // Your sandbox number
     to: `whatsapp:+919067951440` // The recipient's number
  })
  .then(message => console.log(message.sid))
  .catch(err => console.error(err)); */
      res.redirect('/user');
    }
  })
});

//FORM3
app.post('/form3', (req, res) => {
  console.log(req.session);
  const id = req.session.userId;
  const {
    name,
    father,
    mother,
    aadhar,
    mobile,
    dob,
    category,
    infant_gender,
    weight,
    height,

  } = req.body;

  const insertQuery = 'INSERT INTO child_data(id, name, father, mother, aadhar, mobile, dob, category, infant_gender,weight,height) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
  const values = [
    id,
    name,
    father,
    mother,
    aadhar,
    mobile,
    dob,
    category,
    infant_gender,
    weight,
    height,
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal server error");
    }
    else {
      console.log("Data inserted successfully");
      res.redirect('/user');
    }
  })


});

//FORM3
app.post('/form3', (req, res) => {
  console.log(req.session);
  const id = req.session.userId;
  const {
    name,
    father,
    mother,
    aadhar,
    mobile,
    dob,
    category,
    infant_gender,
    ans,
    weight,
    height,

  } = req.body;

  const insertQuery = 'INSERT INTO child_2_data(id, name, father, mother, aadhar, mobile, dob, category, infant_gender,studying,weight,height) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
  const values = [
    id,
    name,
    father,
    mother,
    aadhar,
    mobile,
    dob,
    category,
    infant_gender,
    ans,
    weight,
    height,
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal server error");
    }
    else {
      console.log("Data inserted successfully");
      res.redirect('/user');
    }
  })

});


// Route to fetch counts and render the dashboard
app.get('/udashboard', (req, res) => {
  console.log(req.session);
  const id = req.session.userId;

  // Example queries to fetch counts from different categories
  const pregnantWomenQuery = 'SELECT COUNT(*) AS pregnantWomenCount FROM pregnancy_data WHERE id=?';
  const lactatingMothersQuery = 'SELECT COUNT(*) AS lactatingMothersCount FROM lactating_data WHERE id=?';
  const infantQuery = 'SELECT COUNT(*) AS infantCount FROM child_1_data WHERE id=?';
  const childrenQuery = 'SELECT COUNT(*) AS childrenCount FROM child_data WHERE id=?';

  // Execute queries
  db.query(pregnantWomenQuery, [id], (err, pregnantWomenResult) => {
      if (err) {
          console.error('Error fetching pregnant women count:', err);
          res.status(500).send('Error fetching data');
          return;
      }

      db.query(lactatingMothersQuery, [id], (err, lactatingMothersResult) => {
          if (err) {
              console.error('Error fetching lactating mothers count:', err);
              res.status(500).send('Error fetching data');
              return;
          }

          db.query(infantQuery, [id], (err, infantResult) => {
              if (err) {
                  console.error('Error fetching infant count:', err);
                  res.status(500).send('Error fetching data');
                  return;
              }

              db.query(childrenQuery, [id], (err, childrenResult) => {
                  if (err) {
                      console.error('Error fetching children count:', err);
                      res.status(500).send('Error fetching data');
                      return;
                  }

                  // Render the dashboard view with the retrieved counts
                  res.render('udashboard', {
                      pregnantWomenCount: pregnantWomenResult[0].pregnantWomenCount,
                      lactatingMothersCount: lactatingMothersResult[0].lactatingMothersCount,
                      infantCount: infantResult[0].infantCount,
                      childrenCount: childrenResult[0].childrenCount,
                      total:pregnantWomenResult[0].pregnantWomenCount + lactatingMothersResult[0].lactatingMothersCount +infantResult[0].infantCount + childrenResult[0].childrenCount
                      // Add more counts if needed for other categories
                  });
              });
          });
      });
  });
});



app.get('/adashboard', (req, res) => {
  console.log(req.session);
  const id = req.session.userId;

  // Example queries to fetch counts from different categories
  const pregnantWomenQuery = 'SELECT COUNT(*) AS pregnantWomenCount FROM pregnancy_data WHERE id=?';
  const lactatingMothersQuery = 'SELECT COUNT(*) AS lactatingMothersCount FROM lactating_data WHERE id=?';
  const infantQuery = 'SELECT COUNT(*) AS infantCount FROM child_1_data WHERE id=?';
  const childrenQuery = 'SELECT COUNT(*) AS childrenCount FROM child_data WHERE id=?';

  // Execute queries
  db.query(pregnantWomenQuery, [id], (err, pregnantWomenResult) => {
      if (err) {
          console.error('Error fetching pregnant women count:', err);
          res.status(500).send('Error fetching data');
          return;
      }

      db.query(lactatingMothersQuery, [id], (err, lactatingMothersResult) => {
          if (err) {
              console.error('Error fetching lactating mothers count:', err);
              res.status(500).send('Error fetching data');
              return;
          }

          db.query(infantQuery, [id], (err, infantResult) => {
              if (err) {
                  console.error('Error fetching infant count:', err);
                  res.status(500).send('Error fetching data');
                  return;
              }

              db.query(childrenQuery, [id], (err, childrenResult) => {
                  if (err) {
                      console.error('Error fetching children count:', err);
                      res.status(500).send('Error fetching data');
                      return;
                  }

                  // Render the dashboard view with the retrieved counts
                  res.render('adashboard', {
                      pregnantWomenCount: pregnantWomenResult[0].pregnantWomenCount,
                      lactatingMothersCount: lactatingMothersResult[0].lactatingMothersCount,
                      infantCount: infantResult[0].infantCount,
                      childrenCount: childrenResult[0].childrenCount,
                      total:pregnantWomenResult[0].pregnantWomenCount + lactatingMothersResult[0].lactatingMothersCount +infantResult[0].infantCount + childrenResult[0].childrenCount
                      // Add more counts if needed for other categories
                  });
              });
          });
      });
  });
});


// Set the view engine and the directory for views (EJS in this case)
app.set('view engine', 'ejs');
app.set('views', './views');


app.listen(8080, () => {
  console.log("Server is running....!");
});
