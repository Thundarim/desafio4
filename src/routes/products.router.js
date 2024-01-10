const express = require("express");
const socket = require("socket.io");
const router = express.Router();
const ProductManager = require("../controllers/productManager.js");
const productManager = new ProductManager("./src/models/products.json");
//añadir un nuevo producto
router.post("/products", async (req, res) => {
    try {
        const newProduct = req.body;
        const addedProduct = await productManager.addProduct(newProduct);
        res.json(addedProduct);
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
//obtener productos
router.get("/products", async (req, res) => {
    try {
        const limit = req.query.limit;
        const productos = await productManager.getProducts();
        if (limit) {
            res.json(productos.slice(0, limit));
        } else {
            res.json(productos);
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
//obtener productos por id
router.get("/products/:pid", async (req, res) => {
    try {
        const id = parseInt(req.params.pid);
        const product = await productManager.getProductById(id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener producto por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
// editar un producto por id
router.put("/products/:pid", async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const updatedProduct = await productManager.updateProduct(productId, req.body);
        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al actualizar producto por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// borrar un producto por id
router.delete("/products/:pid", async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const deletedProduct = await productManager.deleteProduct(productId);
        if (deletedProduct) {
            res.json({ message: "Producto eliminado correctamente" });
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar producto por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;
