const jwt = require("jsonwebtoken");

const secret = "9f4b7e2a6d1c4f87b0a3d9e2f5641c73"; // your JWT_SECRET

// Generate a token with payload
const token = jwt.sign({ role: "admin" }, secret, { expiresIn: "1h" });

console.log("Generated JWT token:");
console.log(token);

// Verify the token
try {
  const decoded = jwt.verify(token, secret);
  console.log("Decoded payload:");
  console.log(decoded);
} catch (err) {
  console.error("Token verification failed:", err.message);
}
