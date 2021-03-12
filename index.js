//require the Elasticsearch librray
const elasticsearch = require("elasticsearch");
// instantiate an elasticsearch client
const client = new elasticsearch.Client({
  hosts: ["http://localhost:9200"],
});
const routes = require("./routes");
//require Express
const express = require("express");
// instanciate an instance of express and hold the value in a constant called app
const app = express();
app.set("port", 3000);
app.use("/api/v1", routes);

// listen on the specified port
app.listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});
