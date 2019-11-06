const mongoose = require("mongoose");
const express = require('express');
const cors = require('cors');
const SteamApi = require('steam-api');
const _ = require('lodash');
const bodyParser = require('body-parser');

const Game = require('./game');
const Pack = require('./pack');

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

app.get('/v1/games', async (req, res) => {
  let games = await player.GetOwnedGames(
    userSteamId,
    optionalIncludeAppInfo = true,
    optionalIncludePlayedFreeGames = true,
    optionalAppIdsFilter = []
  ).catch(() => onError(res));

  games = Array.isArray(games) ? games : [];

  if (games.length) {
    await Promise.all(
      games.forEach(game => {
        Game.findOneAndUpdate(
          {appId: game.appId},
          game,
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
            fields: excludedField
          })
      })
    );
  }

  games = await Game.find({}, excludedField)

  res.json(games);
});

app.get('/v1/games/:id', async (req, res) => {
  const result = await steamApp.appDetails(req.params.id)
    .catch(() => onError(res));

  res.json(result);
});

app.patch('/v1/games/:id', async (req, res) => {
  const game = await Game.findOneAndUpdate(
    {appId: req.params.id},
    req.body,
    {
      new: true,
      fields: excludedField
    });

  return res.json(game);
});

app.post('/v1/games', async (req, res) => {
  const game = new Game(req.body)
  const response = await game.save();
  res.json(response)
});

app.get('/v1/packs', async (req, res) => {
  const packs = await Pack.find({}, excludedField)

  res.json(packs);
});

app.post('/v1/packs', async (req, res) => {
  const pack = new Pack(req.body);
  const response = await pack.save();

  res.json(response);
});

app.patch('/v1/packs/:id', async (req, res) => {
  const { name, price, items } = req.body;

  const objToUpdate = {};

  !isNaN(parseInt(price)) ? objToUpdate.price = price : '';
  items && Array.isArray(items) ? objToUpdate.items = items : '';
  name && name.length ? objToUpdate.name = name : '';

  if (Object.keys(objToUpdate).length === 0) {
    res.statusCode = 400;
    return res.end('No fields to update');
  }

  const pack = await Pack.findOneAndUpdate(
      {packId: req.params.id},
      objToUpdate,
      {
        new: true,
        fields: excludedField
      });

  return res.json(pack);
});

app.listen(3000, () => {
  console.log('Steamify api server');
});
