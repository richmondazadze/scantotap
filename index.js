import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const privateKey = process.env.IMAGEKIT_PRIVATE_KEY; // from your .env

console.log('Loaded private key:', !!privateKey, privateKey && privateKey.slice(0, 5));

app.get('/auth', function (req, res) {
  const token = req.query.token || uuidv4();
  const expire = req.query.expire || parseInt(Date.now() / 1000) + 2400;
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');
  res.status(200).json({
    token,
    expire,
    signature,
  });
});

app.listen(5001, function () {
  console.log('Live at Port 5001');
});
