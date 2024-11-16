require("dotenv").config();
const {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} = "firebase/firestore";
const { getStorage, ref, getDownloadURL, uploadBytesResumable } =
  "firebase/storage";

const saltedMd5 = require("salted-md5");
const path = require("path");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
var admin = require("firebase-admin");
const firebase = require("./fiberbaseconfig.js");

// var serviceAccount = require("service_account.json");

class Product {
  constructor(id, name, price, modelSrc, images, description, category) {
    (this.id = id),
      (this.name = name),
      (this.price = price),
      (this.images = images),
      (this.modelSrc = modelSrc),
      (this.category = category),
      (this.desciption = description);
  }
}

const db = getFirestore(firebase);
const storage = getStorage(firebase);
// app.locals.bucket = admin.storage().bucket();

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  return dateTime;
};

app.post("/upload", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files; // Access uploaded files
    const urls = await Promise.all(
      files.map(async (file) => {
        const dateTime = giveCurrentDateTime();
        const storageRef = ref(
          storage,
          `files/${req.file.originalname + "       " + dateTime}`
        );

        // Create file metadata including the content type
        const metadata = {
          contentType: req.file.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(
          storageRef,
          req.file.buffer,
          metadata
        );
        //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

        // Grab the public url
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
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
          doc.data().images,
          doc.data().modelSrc,
          doc.data().desciption,
          doc.data().category
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
