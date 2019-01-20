const mongoose = require("mongoose");
const express = require('express');
const cors = require('cors');
const SteamApi = require('steam-api');
const _ = require('lodash');
const bodyParser = require('body-parser');

const Game = require('./game');

const apiKey = '1AD897533C698E617B4F351C640EC53E';
const userSteamId = '76561198080321262';

let steamApp = new SteamApi.App(apiKey);
let player = new SteamApi.Player(apiKey, userSteamId);

mongoose.connect('mongodb://localhost:27017/steamify', {useNewUrlParser: true});

const app = express();
app.use(bodyParser.json({type: 'application/json'}));
app.use(cors());

const onError = (res) => {
  res.status(400).json({
    error: 'Something went wrong'
  });
};

const excludedField = '-_id -__v'

app.get('/api/v1/games', async (req, res) => {
  let games = await player.GetOwnedGames(
    userSteamId,
    optionalIncludeAppInfo = true,
    optionalIncludePlayedFreeGames = true,
    optionalAppIdsFilter = []
  ).catch(() => onError(res));

  games = Array.isArray(games) ? games : [];

  if (games.length) {
    games = await Promise.all(
      games.map(g => {
        return Game.findOneAndUpdate(
          {appId: g.appId},
          g,
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
            fields: excludedField
          })
      })
    );
  } else {
    games = await Game.find({}, excludedField)
  }

  res.json(games);
});

app.get('/api/v1/games/:id', async (req, res) => {
  const result = await steamApp.appDetails(req.params.id)
    .catch(() => onError(res));

  res.json(result);
});

app.patch('/api/v1/games/:id', async (req, res) => {
  let {price} = req.body;

  if (typeof price !== 'number') {
    res.statusCode = 400;
    return res.send('The price must have an integer type');
  }

  const game = await Game.findOneAndUpdate(
    {appId: req.params.id},
    {price},
    {
      new: true,
      fields: excludedField
    });

  return res.json(game);
});


app.listen(3000, () => {
  console.log('Steamify api server');
});