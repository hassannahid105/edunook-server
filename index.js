const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 5000;
// ** middleware
app.use(cors());
app.use(express.json());
// ! mongodb uri
// ${process.env.MONGODB_USER}
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.ovfeh1r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // Get the database and collection on which to run the operation
    const database = client.db("edunook");
    const assignmentsCollection = database.collection("assignments");
    // ! assignments get for all data
    app.get("/assignments", async (req, res) => {
      const { email } = req.query;
      console.log(email);
      let query = {};
      if (email) {
        query = { "user.userEmail": email };
      }
      const result = await assignmentsCollection.find(query).toArray();
      res.send(result);
    });
    // ! create a single assignment
    app.post("/assignment", async (req, res) => {
      const assingment = req.body;
      const result = await assignmentsCollection.insertOne({ ...assingment });
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
