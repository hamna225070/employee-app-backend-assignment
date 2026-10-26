// Employee App Backend
// Keep your MongoDB Atlas connection string in a .env file.
// This starter project uses Express and the official MongoDB Node.js driver.

require("dotenv").config();

const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "employee_app";
const COLLECTION_NAME = process.env.COLLECTION_NAME || "employees";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the supplied frontend files from the dist folder.
app.use(express.static(path.join(__dirname, "dist")));

let employeesCollection;

async function startServer() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI. Create a .env file using .env.example.");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  employeesCollection = db.collection(COLLECTION_NAME);

  console.log("Connected to MongoDB Atlas.");

  // GET: retrieve all employees
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await employeesCollection.find({}).sort({ _id: -1 }).toArray();
      res.json(employees);
    } catch (error) {
      console.error("GET employees error:", error);
      res.status(500).json({ message: "Could not retrieve employees." });
    }
  });

  // GET: retrieve one employee by MongoDB ID
  app.get("/api/employees/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid employee ID." });
      }
      const employee = await employeesCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!employee) return res.status(404).json({ message: "Employee not found." });
      res.json(employee);
    } catch (error) {
      console.error("GET employee error:", error);
      res.status(500).json({ message: "Could not retrieve employee." });
    }
  });

  // POST: add a new employee
  app.post("/api/employees", async (req, res) => {
    try {
      const { name, email, department, position, phone } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required." });
      }
      const employee = {
        name: String(name).trim(),
        email: String(email).trim(),
        department: department ? String(department).trim() : "",
        position: position ? String(position).trim() : "",
        phone: phone ? String(phone).trim() : "",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await employeesCollection.insertOne(employee);
      res.status(201).json({ ...employee, _id: result.insertedId });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: "An employee with that email may already exist." });
      }
      console.error("POST employee error:", error);
      res.status(500).json({ message: "Could not add employee." });
    }
  });

  // PUT: update an employee by MongoDB ID
  app.put("/api/employees/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid employee ID." });
      }
      const { name, email, department, position, phone } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required." });
      }
      const updatedFields = {
        name: String(name).trim(),
        email: String(email).trim(),
        department: department ? String(department).trim() : "",
        position: position ? String(position).trim() : "",
        phone: phone ? String(phone).trim() : "",
        updatedAt: new Date()
      };
      const result = await employeesCollection.findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updatedFields },
        { returnDocument: "after" }
      );
      const updatedEmployee = result && (result.value || result);
      if (!updatedEmployee || !updatedEmployee._id) {
        return res.status(404).json({ message: "Employee not found." });
      }
      res.json(updatedEmployee);
    } catch (error) {
      console.error("PUT employee error:", error);
      res.status(500).json({ message: "Could not update employee." });
    }
  });

  // DELETE: delete one employee by MongoDB ID
  app.delete("/api/employees/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid employee ID." });
      }
      const result = await employeesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Employee not found." });
      }
      res.json({ message: "Employee deleted successfully." });
    } catch (error) {
      console.error("DELETE employee error:", error);
      res.status(500).json({ message: "Could not delete employee." });
    }
  });

  // Send the frontend for the root URL.
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`Employee App is running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Could not start the application:", error.message);
  process.exit(1);
});
