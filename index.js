const express =require ("express");
const  dotenv =require ("dotenv");
const  mongoose =require ("mongoose");
// const AppRouter = require('./src/routes/index.js')
const cors = require('cors')


dotenv.config()

const app = express()
const PORT = Number(process.env.PORT)

app.use(cors());
app.use(express.json());
// app.use('/',AppRouter);

app.get("/", (req,res)=>{
    res.send("Welcome to the Server!");
});

mongoose
   .connect(`${process.env.dbUrl}/${process.env.dbName}`)
   .then(() =>{      
       app.listen(PORT,() => {
       console.log(`app is listening to port ${PORT}`);
   });
})
.catch((error) => {
    console.log(error);
});