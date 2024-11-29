const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// ** middleware
app.use(cors());

app.use(express.json());
// ! mongodb uri
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.gw9o5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    // Get the database and collection on which to run the operation
    const database = client.db("edunook");
    const assignmentsCollection = database.collection("assignments");
    const submittedAssignmentsCollection = database.collection(
      "submittedAssignments"
    );
    // ! assignments get for all data
    app.get("/assignments", async (req, res) => {
      const { email, difficulty } = req.query;
      let query = {};
      if (email) {
        query = { "user.userEmail": email };
      }
      if (difficulty) {
        query = { difficulty: difficulty };
      }
      const result = await assignmentsCollection.find(query).toArray();
      res.send(result);
    });
    // get email for submitting data

    // ! assignments details
    app.get("/assignments/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentsCollection.findOne(query);
      res.send(result);
    });
    // ! create a single assignment
    app.post("/assignment", async (req, res) => {
      const assingment = req.body;
      const result = await assignmentsCollection.insertOne({ ...assingment });
      res.send(result);
    });
    // ! ASSIGNMENT DELETE
    app.delete("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentsCollection.deleteOne(query);
      res.send(result);
    });
    // ! ASSIGNMENT update
    app.patch("/assignments/update/:id", async (req, res) => {
      const id = req.params.id;
      const doc = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { ...doc },
      };
      const result = await assignmentsCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    // ! Marking assingment update
    app.patch("/assignments/marks/:id", async (req, res) => {
      const id = req.params.id;
      const doc = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { ...doc },
      };
      const result = await submittedAssignmentsCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });
    // ! assignment submit
    app.post("/submittedassignments", async (req, res) => {
      // Check if the email and assignment  exists
      const doc = req.body;
      // ! duplicate assignment not allowed
      let query = {};

      if (doc.examinee) {
        const alreadyTaken = await submittedAssignmentsCollection.findOne({
          "examinee.examineeEmail": doc.examinee.examineeEmail,
          assignmentId: doc.assignmentId,
        });
        console.log("alreadyTaken", alreadyTaken);
        if (alreadyTaken) {
          return res.send({ status: "unauthorized" });
        }
      }

      const result = await submittedAssignmentsCollection.insertOne({
        ...doc,
      });
      res.send(result);
    });
    // ! get all submited assigment
    app.get("/allsubmited", async (req, res) => {
      const { email } = req.query;
      let query = {};
      if (email) {
        query = { examiner: email };
      }

      const result = await submittedAssignmentsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/submited", async (req, res) => {
      const { email } = req.query;
      let query = {};
      if (email) {
        query = { "examinee.examineeEmail": email };
      }

      const result = await submittedAssignmentsCollection.find(query).toArray();
      res.send(result);
    });
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
