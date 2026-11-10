import express from "express";
import cors from "cors";
import "dotenv/config";
import {MongoClient, ObjectId} from "mongodb";

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
const applicationsCollection = database.collection("applications");

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

// API endpoint to get all jobs
app.get("/jobs", async (req, res) => {
  const query = {};

  if(req.query) {
    if(req.query.type) {
      query.type = req.query.type;
    }
    if(req.query.workplace) {
      query.workplace = req.query.workplace;
    }
    if(req.query.salary) {
      const salaryRange = req.query.salary.split("-");
      if (salaryRange.length === 2) {
        const minSalary = parseInt(salaryRange[0], 10);
        const maxSalary = parseInt(salaryRange[1], 10);
        if (!isNaN(minSalary) && !isNaN(maxSalary)) {
          query.salary = { $gte: minSalary, $lte: maxSalary };
        }
      }
    }
    if(req.query.isRemote) {
      query.isRemote = req.query.isRemote === "true";
    }
    if(req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.location && typeof req.query.location === "string" && req.query.location.trim()) {
      const sanitizedLocation = req.query.location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.location = { $regex: sanitizedLocation, $options: "i" };
    }
    if(req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { company: { $regex: req.query.search, $options: "i" } },
        { responsibilities: { $regex: req.query.search, $options: "i" } },
        { requirements: { $regex: req.query.search, $options: "i" } },
      ];
    }
  }
  const cursor = jobsCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
})

// API endpoint to get a job by ID
app.get("/jobs/:id", async (req, res) => {
  const id = req.params.id;
  const result = await jobsCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
})

// API endpoint to create a new job 
app.post("/jobs", async (req, res) => {
  const job = req.body;
  const result = await jobsCollection.insertOne(job);
  res.send(result);
})

// API endpoint to delete a job by ID
app.delete("/jobs/:id", async (req, res) => {
  const id = req.params.id;
  const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
})

// application related APIs
app.post("/applications", async (req, res) => {
  const application = req.body;
  const result = await applicationsCollection.insertOne(application);
  res.send(result);
})

app.get("/applications", async (req, res) => {
  const query = {};
  if (req.query.seekerEmail) {
    query.seekerEmail = req.query.seekerEmail;
  }
  if (req.query.jobId) {
    query.jobId = req.query.jobId;
  }
  const cursor = applicationsCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
})


// Start the server
app.listen(port, () => {
  console.log(`Hireloop server is running on port ${port}`);
})
