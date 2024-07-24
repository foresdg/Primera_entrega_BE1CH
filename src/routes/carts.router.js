import { Router } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let carts = [];


const cartsFilePath = path.join(__dirname, "../db/carrito.json");


fs.readFile(cartsFilePath, "utf8", (err, data) => {
    if (err) {
        console.log("Error de lectura:", err);
        return;
    }
    try {
        carts = JSON.parse(data);
    } catch (err) {
        console.error("Error al parsear JSON:", err);
    }
});


class Cart {
    constructor(id, products = []) {
        this.id = id;
        this.products = products;
    }
}

router.post("/", (req, res) => {
    const nuevoId = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
    const nuevoCarrito = new Cart(nuevoId);
    carts.push(nuevoCarrito);

    fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), (err) => {
        if (err) {
            return res.status(500).send({ error: "Error al guardar el carrito" });
        }
        res.send({ status: "success", message: "Carrito creado exitosamente", cart: nuevoCarrito });
    });
});

router.get("/:cid", (req, res) => {
    const { cid } = req.params;
    const carrito = carts.find(cart => cart.id == cid);

    if (!carrito) {
        return res.status(404).send({ error: "Carrito no encontrado" });
    }

    res.send({ products: carrito.products });
});

router.post("/:cid/product/:pid", (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).send({ error: "La cantidad debe ser un número positivo" });
    }

    const carrito = carts.find(cart => cart.id == cid);
    if (!carrito) {
        return res.status(404).send({ error: "Carrito no encontrado" });
    }

    const productoExistente = carrito.products.find(prod => prod.product == pid);
    
    if (productoExistente) {
        productoExistente.quantity += quantity;
    } else {
        carrito.products.push({ product: pid, quantity });
    }

    fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), (err) => {
        if (err) {
            return res.status(500).send({ error: "Error al actualizar el carrito" });
        }
        res.send({ status: "success", message: "Producto agregado exitosamente", cart: carrito });
    });
});

export default router;