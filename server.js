const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('', (req, res) => res.end('OK!'));

app.get('/GetOwnedGames', (req, res) => {
  fetch('http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=2D7A611545098E1FC165D53E16F03065&steamid=76561198080321262&format=json&include_appinfo=1&include_played_free_games=1')
    .then(res => res.json())
    .then(json => {
      const payload = json.response;

      if (payload && payload.games) {
        fs.writeFile('./data/GetOwnedGames.txt', JSON.stringify(payload), () => {
          payload.lastFetchTime = Date.now();
          res.json(payload);
        });
      } else {
        fs.readFile('./data/GetOwnedGames.txt', (err, data) => {
          if(data) {
            res.json(JSON.parse(data));
          } else {
            res.json(payload);
          }
        })
      }
    })
});

app.listen(3000, () => {
  console.log('Steam holder');
});