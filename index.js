import express from "express";
import cors from "cors";
import "dotenv/config";
import {MongoClient} from "mongodb";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URI);
export async function ConnectToMongoDB() {
  try{
    await client.connect();
    console.log("Connected to MongoDB");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Connect to MongoDB when the server starts
const ConnectedClient = await ConnectToMongoDB();
const database = ConnectedClient.db("hireloop");
const usersCollection = database.collection("user");
const jobsCollection = database.collection("jobs");

// API endpoint to check if the server is running
app.get("/", (req, res) => {
  res.send({msg: "Hireloop server is running"});
})

// API endpoint to get all users
app.get("/users", async (req, res) => {
  const cursor = usersCollection.find({});
  const result = await cursor.toArray();
  res.send(result);
})


// Jobs related APIs
app.post("/jobs", async (req, res) => {
  const job = req.body;
  const result = await jobsCollection.insertOne(job);
  res.send(result);
})


// Start the server
app.listen(port, () => {
  console.log(`Hireloop server is running on port ${port}`);
})
