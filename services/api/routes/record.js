const express = require('express');
const { CharacterStats } = require("../utils/characterstats.js");
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require('../db/conn');

recordRoutes.route('/').get(async function (request, res) {
  console.log(`Called base route.`);
});

// This section will help you get a list of all the records.
recordRoutes.route('/systemdetails/region/:region_id').get(async function (request, res) {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection('vw_system_details')
    .find({"region_id":  parseInt(request.params.region_id)})
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching listings!');
      } else {
        res.json(result);
      }
    });
});


// This section will help you get a list of all the records.
recordRoutes.route('/character/:character_id').get(async function (request, res) {
  const dbConnect = dbo.getDb();
  var character = await dbConnect.collection('characters').findOne({"character_id":  parseInt(request.params.character_id)});
  if (character) {
    res.json(character);
  }
  else {
    var x = new CharacterStats();
    var character = await x.constructCharacterStats(parseInt(request.params.character_id));
    if (character) {
      res.json(character);
    }
  }
});

// This section will help you create a new record.
/*recordRoutes.route('/listings/recordSwipe').post(function (req, res) {
  const dbConnect = dbo.getDb();
  const matchDocument = {
    listing_id: req.body.id,
    last_modified: new Date(),
    session_id: req.body.session_id,
    direction: req.body.direction,
  };

  dbConnect
    .collection('matches')
    .insertOne(matchDocument, function (err, result) {
      if (err) {
        res.status(400).send('Error inserting matches!');
      } else {
        console.log(`Added a new match with id ${result.insertedId}`);
        res.status(204).send();
      }
    });
});

// This section will help you update a record by id.
recordRoutes.route('/listings/updateLike').post(function (req, res) {
  const dbConnect = dbo.getDb();
  const listingQuery = { _id: req.body.id };
  const updates = {
    $inc: {
      likes: 1,
    },
  };

  dbConnect
    .collection('listingsAndReviews')
    .updateOne(listingQuery, updates, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error updating likes on listing with id ${listingQuery.id}!`);
      } else {
        console.log('1 document updated');
      }
    });
});

// This section will help you delete a record.
recordRoutes.route('/listings/delete/:id').delete((req, res) => {
  const dbConnect = dbo.getDb();
  const listingQuery = { listing_id: req.body.id };

  dbConnect
    .collection('listingsAndReviews')
    .deleteOne(listingQuery, function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting listing with id ${listingQuery.listing_id}!`);
      } else {
        console.log('1 document deleted');
      }
    });
});*/

module.exports = recordRoutes;