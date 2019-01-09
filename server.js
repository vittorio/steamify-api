const express = require('express');
const cors = require('cors');
const SteamApi = require('steam-api');
const mongoose = require('mongoose');

const Game = require('./game');

const apiKey = '2D7A611545098E1FC165D53E16F03065';
const userSteamId = '76561198080321262';

let steamApp = new SteamApi.App(apiKey);
let player = new SteamApi.Player(apiKey, userSteamId);

const app = express();
mongoose.connect('mongodb://localhost:27017/steamify', {useNewUrlParser: true});

app.use(cors());

const onError = (res) => {
  res.status(400).json({
    error: 'Something went wrong'
  });
};

app.get('/api/v1/games', async (req, res) => {
  let games = await player.GetOwnedGames(
    userSteamId,
    optionalIncludeAppInfo = true,
    optionalIncludePlayedFreeGames = true,
    optionalAppIdsFilter = []
  )
    .catch(() => onError(res));

  if (games && games.length) {
    const games2 = [];
    await Promise.all(
      games.map(game => {
        return new Promise(async resolve => {
          let result = await Game.findOneAndUpdate({'basic.appid': game.appid}, {$set: {basic: game}}, {upsert: true, new: true});
          if (!result.details) {
            let result2 = await fetchAppDetails(game.appid)

            if (result2) {
              result = result2;
            }
          }

          games2.push(result);
          resolve(result)
        })
      })
    );

    games = games2;
  }
  else {
    games = await Game.find({});
  }

  res.json(games);
});

const fetchAppDetails = (appId) => {
  return new Promise(async (resolve, reject) => {
    const game = await steamApp.appDetails(appId)
      .catch(reject);

    let result;

    if (game && game.id) {
      result = await Game.findOneAndUpdate({'basic.appid': appId}, {$set: {details: game}}, {new: true});
    } else {
      result = await Game.findOne({'basic.appid': appId});
    }

    resolve(result);
  })
};

app.get('/api/v1/games/:id', async (req, res) => {
  const result = await fetchAppDetails(req.params.id)
    .catch(() => onError(res));

  res.json(result);
});


app.listen(3000, () => {
  console.log('Steam holder server');
});