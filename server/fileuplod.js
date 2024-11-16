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

app.post("/upload", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files; // Access uploaded files
    const urls = await Promise.all(
      files.map(async (file) => {
        const blob = bucket.file(`images/${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        // Handle file upload to Firebase
        blobStream.end(file.buffer);

        // Wait for the upload to complete
        await new Promise((resolve, reject) => {
          blobStream.on("finish", resolve);
          blobStream.on("error", reject);
        });

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        return publicUrl;
      })
    );

    res.status(200).json({ success: true, imageUrls: urls });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ success: false, message: "Error uploading images" });
  }
});

app.post("/data", async (req, res) => {
  let docRef = db.collection("products");
  // await docRef.add({
  //   name: req.body.name,
  //   price: req.body.price,
  //   images: req.body.images,
  //   modelSrc: req.body.modelSrc,
  //   description: req.body.description,
  //   category: req.body.category,
  // });
  await addDoc(collection(db, "products"), data);
  res.status(200).send("product created successfully");

  res.json({ message: "done" });
});

export const getProducts = async (req, res, next) => {
  try {
    const products = await getDocs(collection(db, "products"));
    const productArray = [];

    if (products.empty) {
      res.status(400).send("No Products found");
    } else {
      products.forEach((doc) => {
        const product = new Product(
          doc.id,
          doc.data().name,
          doc.data().price,
          doc.data().retailer,
          doc.data().amountInStock
        );
        productArray.push(product);
      });

      res.status(200).send(productArray);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = doc(db, "products", id);
    const data = await getDoc(product);
    if (data.exists()) {
      res.status(200).send(data.data());
    } else {
      res.status(404).send("product not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

app.get("/", getProducts);
app.post("/new", createProduct);
app.get("/product/:id", getProduct);

const app = express();

app.use(cors());
app.use(express.json());

//routes
app.use("/api", productRoute);

app.listen(4000, () => console.log(`Server is live @ localhost`));
