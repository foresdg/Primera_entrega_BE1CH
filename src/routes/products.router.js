import { Router } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let products = [];
const productsFilePath = path.join(__dirname, "../db/productos.json");

// Leer y asignar el json al array vacío

fs.readFile(productsFilePath,"utf8",(err,data)=>{
    if (err) {
        console.log('error de lectura')
        return;
    }
    try{
        products = JSON.parse(data)
    } catch (err) {
        console.error('Error',err)
    }
});

class Producto {
    constructor(id, title, description, code, price, status, stock, category) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.code = code;
        this.price = price;
        this.status = status;
        this.stock = stock;
        this.category = category;
    }
}

router.get('/',(req,res)=>{
    res.send(products);
});


router.get('/:id',(req,res)=>{
    let {id} = req.params;
    let idProd = parseInt(id)
    let productoBuscado = products.find(producto => producto.id === idProd)
    if(productoBuscado){
        res.send(productoBuscado);
    } else{
        res.send({status:"error",message:"El producto buscado no existe"})
    }
});

router.post("/", (req, res) => {
    const { title, description, code, price, status, stock, category } = req.body;
    
    if (!title || !description || !code || typeof price !== 'number' || typeof status !== 'boolean' || typeof stock !== 'number' || !category) {
        return res.status(400).send({ error: "Datos inválidos" });
    }

    const nuevoId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
    const nuevoProducto = new Producto(nuevoId, title, description, code, price, status, stock, category);
    products.push(nuevoProducto);

    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
        if (err) {
            return res.status(500).send({ error: "Error al guardar el producto" });
        }
        res.send({ status: "success", message: "Producto creado exitosamente" });
    });
});

router.put("/:pid", (req, res) => {
    let { pid } = req.params;
    pid = parseInt(pid, 10);
    const productoIndex = products.findIndex(producto => producto.id === pid);

    if (productoIndex === -1) {
        return res.status(404).send({ error: "Producto no encontrado" });
    }


    const updatedProduct = { ...products[productoIndex], ...req.body, id: pid };
    products[productoIndex] = updatedProduct;

    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
        if (err) {
            return res.status(500).send({ error: "Error al guardar el producto" });
        }
        res.send({ status: "success", message: "Producto actualizado exitosamente" });
    });
});

router.delete("/:pid", (req, res) => {
    let { pid } = req.params;
    pid = parseInt(pid, 10);
    const productoIndex = products.findIndex(producto => producto.id === pid);

    if (productoIndex === -1) {
        return res.status(404).send({ error: "Producto no encontrado" });
    }

    products.splice(productoIndex, 1);

    fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), (err) => {
        if (err) {
            return res.status(500).send({ error: "Error al guardar el producto" });
        }
        res.send({ status: "success", message: "Producto eliminado exitosamente" });
    });
});



export default router;