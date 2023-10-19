const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// gucci
// https://i.ibb.co/pX0TfW6/johanne-pold-jacobsen-1-A5h-Sv-PZj-Mc-unsplash.jpg


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
      await client.connect();

      const productsCollection = client.db("productsDB").collection("products");
      


      app.post('/product', async (req, res) => {
          const newProduct = req.body;
        //   console.log(newProduct);
          const result = await productsCollection.insertOne(newProduct);
          res.send(result);
      })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Fashion Apparel server in running');
})


app.listen(port, () => {
    console.log(`Fashion server is running on port ${port}`);
})