const Express = require("express");
const cors = require('cors');
const BodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require("mongodb").ObjectID;
const CONNECTION_URL = "mongodb+srv://admin:s85Z3LIp84BpTGXETlHc@cluster0.hkkzkeu.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "mapper";


var app = Express();
app.use(cors());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

/*app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});*/

var database, collection;

app.get("/map/region/:region_id", async (request, response) => {
    const systems_array = await collection.find({ "region_id": parseInt(request.params.region_id) }).toArray();

    var idArray = [];
    // Loop through the array of documents
    for (let i = 0; i < systems_array.length; i++) {
        idArray.push(systems_array[i]["system_id"]);
    }

    let nodes_collection = database.collection("vw_system_nodes");
    let edges_collection = database.collection("vw_system_edges");

    const nodes_query = { id: { $in: idArray } };
    const edges_query = { from: { $in: idArray } };
    const nodes_array = await nodes_collection.find(nodes_query).toArray();
    const edges_array = await edges_collection.find(edges_query).toArray();

    // clean up edges so you don't have two for each connection
    for (let i = edges_array.length - 1; i >= 0; i--) {
        if (edges_array.find(item => item.from == edges_array[i].to && item.to == edges_array[i].from)) {
            edges_array.splice(i, 1);
        }
    }

    //var items = collection.find({ "region_id": parseInt(request.params.region_id) }).toArray();
    response.send({
        systems: systems_array,
        nodes: nodes_array,
        edges: edges_array
      });
});

app.get("/map/system/:system_id", async (request, response) => {
    const systems_array = await collection.find({ "region_id": parseInt(request.params.region_id) }).toArray();

    var idArray = [];
    // Loop through the array of documents
    for (let i = 0; i < systems_array.length; i++) {
        idArray.push(systems_array[i]["system_id"]);
    }

    let nodes_collection = database.collection("vw_system_nodes");
    let edges_collection = database.collection("vw_system_edges");

    const nodes_query = { id: { $in: idArray } };
    const edges_query = { from: { $in: idArray } };
    const nodes_array = await nodes_collection.find(nodes_query).toArray();
    const edges_array = await edges_collection.find(edges_query).toArray();

    // clean up edges so you don't have two for each connection
    for (let i = edges_array.length - 1; i >= 0; i--) {
        if (edges_array.find(item => item.from == edges_array[i].to && item.to == edges_array[i].from)) {
            edges_array.splice(i, 1);
        }
    }

    //var items = collection.find({ "region_id": parseInt(request.params.region_id) }).toArray();
    response.send({
        systems: systems_array,
        nodes: nodes_array,
        edges: edges_array
      });
});

app.listen(5000, () => {
    const client = new MongoClient(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    console.log("About to connect to MongoDB `" + DATABASE_NAME + "`!");
    client.connect(error => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("vw_system_details");
        // perform actions on the collection object
       // client.close();
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

