const express = require('express');
const cors = require('cors');
const SteamApi = require('steam-api');
const _ = require('lodash');

const apiKey = '1AD897533C698E617B4F351C640EC53E';
const userSteamId = '76561198080321262';

let steamApp = new SteamApi.App(apiKey);
let player = new SteamApi.Player(apiKey, userSteamId);

const app = express();

const firebase = require('firebase');
const admin = require("firebase-admin");
const firebaseConfig = {
  apiKey: "AIzaSyD5KmSQcQ1CLDeyfEdnIl7SDCrTwc0GXFQ",
  authDomain: "steamify-61hub.firebaseapp.com",
  databaseURL: "https://steamify-61hub.firebaseio.com",
  projectId: "steamify-61hub",
  storageBucket: "steamify-61hub.appspot.com",
  messagingSenderId: "497608429923"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const serviceAccount = require('./steamify-61hub-firebase-adminsdk-l80ee-0150531b1d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://steamify-61hub.firebaseio.com"
});

const db = admin.firestore();

app.use(cors());

const onError = (res) => {
  res.status(400).json({
    error: 'Something went wrong'
  });
};

const getAllGamesFromFirebase = async () => {
  const snapchot = await db.collection('games').get();

  const docs = [];

  snapchot.forEach(doc => docs.push(doc.data()));

  return docs
};

const getGameMainInformation = ({
                                  appId,
                                  name = '',
                                  playtimeTwoWeeks = 0,
                                  playtimeTwoWeeksReadable = '',
                                  playtimeForever = 0,
                                  playtimeForeverReadable = '',
                                  icon = '',
                                  logo = '',
                                  header = '',
                                  lastSync = Date.now()
                                }) => ({
  appId,
  name,
  playtimeTwoWeeks,
  playtimeTwoWeeksReadable,
  playtimeForever,
  playtimeForeverReadable,
  icon,
  logo,
  header,
  lastSync
})


let storedGames;
let once = false

app.get('/api/v1/games', async (req, res) => {
  let games = await player.GetOwnedGames(
    userSteamId,
    optionalIncludeAppInfo = true,
    optionalIncludePlayedFreeGames = true,
    optionalAppIdsFilter = []
  ).catch(() => onError(res));

  if (games && games.length) {
    if (!storedGames) {
      storedGames = await getAllGamesFromFirebase();
    }

    await Promise.all(
      games.map(async game => {
        let { appId } = game;
        let savedGame = getGameMainInformation(game);
        appId = appId.toString();

        if (appId.length) {
          const hasAlreadyGame = _.some(storedGames, { appId });
          const isPlaytimeChanged = hasAlreadyGame & _.some(storedGames, g => (g.appId === appId) && g.playtimeForever !== savedGame.playtimeForever);

          // const storedGame = _.find(storedGames, {appId});
          // const hasDetails = hasAlreadyGame && (storedGame.price || storedGame.metacritic || storedGame.categories)
          //
          // if (!hasDetails && !once) {
          //   if (storedGame && storedGame.hasNoDetails) {
          //
          //   } else {
          //
          //     once = true
          //     const details = await steamApp.appDetails(appId)
          //       .catch((e) => {
          //         db.collection('errors').doc(Date.now() + '').set({
          //           appId: appId,
          //           details: true,
          //           errorCode: e.response.statusCode
          //         });
          //       });
          //
          //     console.log(appId, details);
          //
          //     if (details) {
          //       const { price = {}, platforms = [], metacritic = '', categories = [], genres = [], release = {}} = details
          //
          //       savedGame = { ...savedGame,  price, platforms, metacritic, categories, genres, release }
          //     }
          //   }
          // }

          if (storedGames && (!hasAlreadyGame || isPlaytimeChanged)) {
            const index = _.findIndex(storedGames, { appId });
            storedGames.splice(index, 1, savedGame);

            return db.collection('games').doc(appId).set(savedGame);
          }
        } else {
          return db.collection('errors').doc(Date.now() + '').set(savedGame);
        }
      })
    )
  }

  res.json(storedGames);
});

app.get('/api/v1/games/:id', async (req, res) => {
  const result = await steamApp.appDetails(req.params.id)
    .catch(() => onError(res));

  res.json(result);
});


app.listen(3000, () => {
  console.log('Steam holder server');
});