const express = require('express');
const cors = require('cors');
const axios = require('axios');


const app = express();
const port = 3000;

// GPT config
const API_KEY = "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";
const API_URL = "https://api.openai.com/v1/chat/completions";

const REQUEST_HEADER = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_KEY}`
};

const REQUEST_PAYLOAD = {
  "model": "gpt-3.5-turbo"
};

app.use(cors());
app.use(express.json())


app.post('/completion', (req, res) => {
  const messages = req.body.messages;

  if (!messages) {
    return res.status(500).json({error: 'No valid message supplied!'})
  } else {
    REQUEST_PAYLOAD["messages"] = messages;
  }

  axios({
    method: 'post',
    url: API_URL,
    data: REQUEST_PAYLOAD,
    headers: REQUEST_HEADER,
    timeout: 100000
  }).then(function(response) {
    res.json(response.data);
  }).catch(function(error) {
    console.log(error);
    res.status(500).json(error);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});