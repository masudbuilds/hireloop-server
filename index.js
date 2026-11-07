import express from "express";
import cors from "cors";
import "dotenv/config";
import {MongoClient} from "mongodb";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

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

app.get("/", (req, res) => {
  res.send("Hireloop server is running");
})

app.listen(port, () => {
  console.log(`Hireloop server is running on port ${port}`);
})
