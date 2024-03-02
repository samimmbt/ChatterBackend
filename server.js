const express = require('express');
require('dotenv').config();
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
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('message', (data) => {
    console.log(data);
    socketIO.emit('messageResponse', data);
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
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

app.put('')

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});