const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

const FIREBASE_DB_URL =
  "https://chlorosense-3e14d-default-rtdb.firebaseio.com/";
const FIREBASE_API_KEY = "AIzaSyA1BtDaUDy6Qle2K0IiJihx4kbIyJoiFY0";

app.use(
  cors({
    origin: "http://127.0.0.1:5501",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.urlencoded({ extended: true }));

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

// Configure Multer for file upload
const upload = multer({ dest: "uploads/" });

app.post("/submit-form", upload.single("proof"), async (req, res) => {
  const { districtId, email, districtName, problem, solution } = req.body;
  const proofFile = req.file;

  if (!proofFile) {
    return res.status(400).send("Proof image is required.");
  }

  // Generate a new OTP for each request
  const otp = generateOTP().toString();
  console.log("Generated OTP:", otp);

  try {
    console.log("Fetching email from Firebase...");

    // Get email from Firebase
    const response = await axios.get(
      `${FIREBASE_DB_URL}/phedtocoll/${districtId}.json?auth=${FIREBASE_API_KEY}`
    );

    const firebaseData = response.data;

    if (!firebaseData || !firebaseData.email) {
      console.log("District ID or email not found.");
      return res.status(404).send("District ID not found in the database.");
    }

    const toEmail = firebaseData.email;
    console.log("Retrieved email:", toEmail);

    // Update OTP in Firebase
    console.log("Updating OTP in Firebase...");
    const putResponse = await axios.put(
      `${FIREBASE_DB_URL}/phedtocoll/${districtId}/OTP.json?auth=${FIREBASE_API_KEY}`,
      otp
    );

    console.log("Firebase OTP update response:", putResponse.status);

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sec23cs156@sairamtap.edu.in",
        // pass: password, User password
      },
    });

    const mailOptions = {
      from: '"District Phed Form" <sec23cs156@sairamtap.edu.in>',
      to: toEmail,
      subject: `District Phed Form Submission from ${districtName}`,
      text: `
        District ID: ${districtId}
        Email: ${email}
        District Name: ${districtName}
        Problem: ${problem}
        Solution: ${solution}
        OTP: ${otp}
      `,
      attachments: [
        {
          filename: proofFile.originalname,
          path: proofFile.path,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    // Clean up uploaded file
    try {
      fs.unlinkSync(proofFile.path);
      console.log("Uploaded file cleaned up.");
    } catch (fileError) {
      console.error("Error cleaning up uploaded file:", fileError.message);
    }

    res.send("Form submitted successfully!");
  } catch (error) {
    console.error("Error occurred:", error.response?.data || error.message);
    res.status(500).send("Failed to submit the form. Please try again.");
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "form.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
