import express from "express";
const app = express();
const PUERTO = 8080;
app.use(express.json());

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);


// LISTENER
app.listen(PUERTO, ()=>{
    console.log(`Escuchando en localhost:${PUERTO}`)
})