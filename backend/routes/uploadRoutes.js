// const express = require("express");
// const multer = require("multer");
// const cloudinary = require("cloudinary").v2;
// const streamifier = require("streamifier");
// const router = express.Router(); // ✅ This was missing

// require("dotenv").config();

// // ✅ Cloudinary Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:    process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ✅ Multer setup using memory storage 
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // ✅ Upload Route
// router.post("/", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     // ✅ Stream upload function
//     const streamUpload = (fileBuffer) => {
//       return new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream((error, result) => {
//           if (result) {
//             resolve(result);
//           } else {
//             reject(error);
//           }
//         });

//         // ✅ Use streamifier to convert file buffer to a stream
//         streamifier.createReadStream(fileBuffer).pipe(stream);
//       });
//     };

//     const result = await streamUpload(req.file.buffer);
//     res.json({ imageUrl: result.secure_url });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// module.exports = router;



const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer using memoryStorage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  console.log("BODY:", req.body);
  console.log("HEADERS:", req.headers);
  console.log("FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({ message: "No file received" });
  }

  try {
    const streamUpload = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((err, result) =>
          err ? reject(err) : resolve(result)
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const result = await streamUpload(req.file.buffer);
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
});

module.exports = router;

