const mysql = require('mysql');
require("dotenv").config();  // Load environment variables

// Configuration for MySQL connection
const config = {
  connectionLimit: 4,
  host: process.env.DB_HOST || "localhost",   // Use environment variable or default to localhost
  user: process.env.DB_USER || "root",        // Use environment variable or default to root
  password: process.env.DB_PASSWORD || "pass_root@PesPesBa260!",  // Use environment variable or hardcoded password
  database: process.env.DB_NAME || "project"  // Use environment variable or default to "project"
};

// Create a MySQL connection pool
const pool = mysql.createPool(config);

// Function to establish a connection and execute queries
const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting MySQL connection:", err);
        reject(err);  // Reject if there is an error
      } else {
        console.log("MySQL pool connected: threadId " + connection.threadId);

        // Define the query function
        const query = (sql, binding) => {
          return new Promise((resolve, reject) => {
            connection.query(sql, binding, (err, result) => {
              if (err) {
                console.error("Query error:", err);
                reject(err);  // Reject the promise if there's an error
              }
              resolve(result);  // Resolve the result if successful
            });
          });
        };

        // Define the release function
        const release = () => {
          return new Promise((resolve, reject) => {
            try {
              connection.release();
              console.log("MySQL pool released: threadId " + connection.threadId);
              resolve();
            } catch (err) {
              console.error("Error releasing MySQL connection:", err);
              reject(err);
            }
          });
        };

        // Resolve with both the query and release functions
        resolve({ query, release });
      }
    });
  });
};

// Execute a query without needing to establish a separate connection (for quick queries)
const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) {
        console.error("Query error:", err);
        reject(err);  // Reject if there's an error
      }
      resolve(result);  // Resolve the result
    });
  });
};

module.exports = { pool, connection, query };
