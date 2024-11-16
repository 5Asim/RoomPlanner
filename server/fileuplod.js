require("dotenv").config();
const saltedMd5 = require("salted-md5");
const path = require("path");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-project-1-58a04.firebaseio.com",
  storageBucket: process.env.BUCKET_URL,
});
app.locals.bucket = admin.storage().bucket();



app.post("/upload", upload.multiple("file"), async (req, res) => {
  const name = saltedMd5(req.file.originalname, "SUPER-S@LT!");
  const fileName = name + path.extname(req.file.originalname);
  await app.locals.bucket
    .file(fileName)
    .createWriteStream()
    .end(req.file.buffer);
  res.send("done");
});


app.post("/data", async (req, res) => {

  let docRef = db.collection("user");
  await docRef.add({
    name: req.body.name,
    price: req.body.price,
    images = 
  });
  res.json({ message: "done" });
});
