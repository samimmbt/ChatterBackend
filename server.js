const express = require('express');
require('dotenv').config();
const postgres = require('postgres');
const app = express();
const PORT = 3000;
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let { TEMPLATE, PUBLICKEY, SERVICE, REQID, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const http = require('http').Server(app);
const socketIO = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

socketIO.on('connection', (socket) => {
  console.log(`:)) : ${socket.id} user just connected!`);

  socket.on('login', (data) => {
    if (data) {
      post(data).then((result) => {
        if (result) {
          const resData = {
            name: data.name,
            userId: data.userId,
            logged: true
          }
          socketIO.emit('loginRes', resData)
        }
        console.log("Data inserted successfully:", result);
      }).catch((error) => {
        console.error("Error inserting data:", error);
      })
    }
  })

  socket.on('message', (data) => {
    console.log(data);
    socketIO.emit('messageResponse', data);
  });

  socket.on('disconnect', () => {
    console.log('-_- : A user disconnected');
  });
});



app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

app.get('/email/:id', (req, res) => {
  const id = req.params.id;
  if (id === REQID) {
    res.json({
      pub_key: PUBLICKEY,
      template: TEMPLATE,
      service: SERVICE
    });
  }

});
app.get('/user/:id', (req, res) => {
  const id = req.params.id;
  if (id) {

  }

});


// app.post('/', (req, res) => {
//   console.log(req.body);
//   const data = req.body
//   if (data) {
//     const result = post(data)
//     if (result) {
//       res.send().status(202)
//     } else {
//       res.send().status(500)//server error
//     }
//   } else {
//     return null
//   }
// })
async function post(data) {
  try {
    const result = await sql`
    INSERT INTO "user" (name, email, userid, token)
    VALUES (${data.name}, ${data.email}, ${data.userId}, ${data.token});`;
    await sql`INSERT INTO "users" (userid)
    VALUES (${data.userId});`
    return result
  } catch (e) {
    console.error(e)
    throw e;
  }
}
async function getUser(data) {
  try {
    const result = await sql`SELECT * from "user" where userid =${data.userid} and email = ${data.email}`
    return result
  } catch (e) {
    console.error(e)
  }
}
// app.put('')

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});