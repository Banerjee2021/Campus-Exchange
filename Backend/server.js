
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const port = 3000;
const app = express();


app.use(cors());

app.use(bodyParser.json());


app.post('/login', (req, res) => {
  console.log('Login data received:', JSON.stringify(req.body, null, 2));
  res.json({ success: true, message: 'Login successful' });
});

app.post('/signup', (req, res) => {
  console.log('Signup data received:', JSON.stringify(req.body, null, 2));
  res.json({ success: true, message: 'Signup successful' });
});

app.get('/', (req, res) => {
  res.send("Backend server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});