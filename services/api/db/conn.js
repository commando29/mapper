const { MongoClient, ServerApiVersion } = require('mongodb');
const connectionString = process.env.ATLAS_URI;
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});

let dbConnection;

module.exports = {
  connectToServer: function (callback) {
    console.log('About to try db connection...');
    client.connect(function (err, db) {
      console.log('In the mongodb connect');
      if (err || !db) {
        console.log('Mongodb conn error');
        return callback(err);
      }

      dbConnection = db.db('mapper');
      console.log('Successfully connected to MongoDB.');
      db.close();
      return callback();
    }).catch(err =>
      res.status(400).json({ msg: `Could not connect to MongoDB`, err })
    );
  },

  getDb: function () {
    return dbConnection;
  },
};