const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
app.use(express.json()); 
app.use(cookieParser());

//http://localhost:5000/carts?email=sonia@mila.com

//Verify token
const verifyToken = async (req, res, next) => {
  const token = req.cookies.UserToken;
  // console.log(token);
  if (!token) {
    return res.status(401).send({message: "Not Authorized"})
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({message: "Unauthorized"})
    }
    console.log("value od dewcode", decoded);
    
     next();
  })

 
}
 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o9ylutr.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
      // await client.connect();

    
    const database = client.db("productsDB");
    const productsCollection = database.collection("products");
    const addCollection = database.collection("addProducts");
      

    //Token create
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      
      res
        .cookie('UserToken', token, {
          httpOnly: true,
          secure: false,
          // sameSite: 'none'
        })
        .send({success: true});
    })
     
      app.get('/brand', async(req, res) => {
          const cursor = productsCollection.find();
          const result = await cursor.toArray();
          res.send(result);
      })
    
    app.get('/product/:id' , async(req, res) => {
          const id = req.params.id;
          const query = {_id : new ObjectId(id)};
          const result = await productsCollection.findOne(query);
          res.send(result);
          // console.log(result);
    })
    
    // app.get('/carts', async (req, res) => {
    //   const cursor1 = addCollection.find();
    //   const result = await cursor1.toArray();
    //   console.log(result);
    //   res.send(result);
    // })
    app.get('/carts',verifyToken, async (req, res) => {
      // console.log("tokkken", req.cookies.UserToken);
      let query = {};

      if (req.query?.email) {
        query = {email : req.query.email}
      }
      const cursor1 = addCollection.find(query);
      const result = await cursor1.toArray();
      // console.log(result);
      res.send(result);
    })

      app.post('/product', async (req, res) => {
          const newProduct = req.body;
          // console.log(newProduct);
          const result = await productsCollection.insertOne(newProduct);
          res.send(result);
      })
    
    app.post('/add', async(req, res) => {
      const addProduct = req.body;
        const result = await addCollection.insertOne(addProduct);
      res.send(result);
      // console.log(result);

    })

    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const filter2 = { _id: id };
      const options = { upsert: true };
      const updateProduct = req.body;
      console.log(updateProduct);

      const upProduct = {
      $set: {
         proName: updateProduct.proName,
         proImg : updateProduct.proImg,
         brand : updateProduct.brand,
         type : updateProduct.type,
         price : updateProduct.price,
         rating : updateProduct.rating
        },
       
      };
      
      const result = await productsCollection.updateOne(filter, upProduct, options);
      res.send(result);
      const result2 = await addCollection.updateOne(filter2, upProduct);
     
    })

    // app.delete('/carts/:id', async(req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await addCollection.deleteOne(query);
    //   console.log(id);
    //   console.log(result);
    //     res.send(result);
    // })
     app.delete('/carts/:id', async(req, res) => {
      const id = req.params.id;
       const query = { _id: id };
      const result = await addCollection.deleteOne(query);
      // console.log(id);
      console.log(result);
        res.send(result);
    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Fashion Apparel server in runninggggggg 22');
})


app.listen(port, () => {
    console.log(`Fashion server is running on port ${port}`);
})