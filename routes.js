const express = require("express");
const router = express.Router();
const elasticsearch = require("elasticsearch");
const bodyParser = require("body-parser").json();
const elasticClient = new elasticsearch.Client({
  hosts: ["http://localhost:9200"],
});
elasticClient.ping(
  {
    // ping usually has a 3000ms timeout
    requestTimeout: 3000,
  },
  function (error) {
    if (error) {
      console.trace("elasticsearch cluster is down!");
    } else {
      console.log("elasticsearch cluster is Well");
    }
  }
);
// let productsos = [
//   {
//     sku1: "1",
//     name: "Sillon 3 cuerpos",
//     categories: ["silon", "sofa", "mueble", "living", "cuero"],
//     description: "Hermo sillion de cuero de 3 cuerpos",
//   },
//   {
//     sku1: "2",
//     name: "Sillon 2 cuerpos",
//     categories: ["silon", "sofa", "mueble", "living", "ecocuero"],
//     description: "Hermo sillion de cuero de 2 cuerpos",
//   },
//   {
//     sku1: "3",
//     name: "Mesa de condor renonda de video",
//     categories: ["mesa", "comedor", "virdo   "],
//     description: "Moderna mesa de 110 cm de radio",
//   },
// ];

router.use((req, res, next) => {
  elasticClient
    .index({
      index: "logs",
      body: {
        url: req.url,
        method: req.method,
      },
    })
    .then((res) => {
      console.log("Logs indexed");
    })
    .catch((err) => {
      console.log(err);
    });
  next();
});

router.post("/products", bodyParser, (req, res) => {
  console.log(req.body);
  elasticClient
    .index({
      index: "products",
      body: req.body,
    })
    .then((resp) => {
      return res
        .status(200)
        .json({
          msg: "product indexed",
        })
        .catch((err) => {
          return res.status(500).json({
            msg: "Error",
            err,
          });
        });
    });
});
router.get("/products/:id", (req, res) => {
  let query = {
    index: "products",
    id: req.params.id,
  };
  elasticClient
    .get(query)
    .then((resp) => {
      if (!resp) {
        return res.status(400).json({
          product: resp,
        });
      }
      return res.status(200).json({
        product: resp,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        msg: "Error not found",
        err,
      });
    });
});

router.put("/products/:id", bodyParser, (req, res) => {
  elasticClient
    .update({
      index: "products",
      id: req.params.id,
      body: {
        doc: req.body,
      },
    })
    .then((resp) => {
      return res.status(200).json({
        msg: "product updated",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        msg: "Error",
        err,
      });
    });
});
router.delete("/products/:id", (req, res) => {
  elasticClient
    .delete({
      index: "products",
      id: req.params.id,
    })
    .then((resp) => {
      return res.status(200).json({
        msg: "product deleted",
      });
    })
    .catch((err) => {
      return res.status(404).json({
        msg: "Error",
        err,
      });
    });
});

router.get("/products", (req, res) => {
  let query = {
    index: "products",
    q: req.query.product,
  };
  //   if (req.query.product) query.q = `*${req.query.product}*`;
  // console.log("QUERY PARAMS",req.query.product)
  elasticClient
    .search(query)
    .then((resp) => {
      console.log(resp.hits.hits.length);
      return res.status(200).json({
        products: resp.hits.hits,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        msg: "Error",
        err,
      });
    });
});
router.get("/logs", (req, res) => {
  let query = {
    index: "logs",
  };
  //   if (req.query.product) query.q = `*${req.query.product}*`;
  // console.log("QUERY PARAMS",req.query.product)
  elasticClient
    .search(query)
    .then((resp) => {
      console.log(resp.hits.hits.length);
      return res.status(200).json({
        logs: resp.hits.hits,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        msg: "Error",
        err,
      });
    });
});
module.exports = router;
