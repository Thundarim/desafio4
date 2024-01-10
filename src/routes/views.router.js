const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/productManager.js");
const productManager = new ProductManager("./src/models/products.json");
router.get("/", async (req, res) => {
    try {
        res.render("index");
    } catch (error) {
        console.error('Error al cargar la ruta raiz:', error);
        res.status(500).send('Error interno del servidor');
    }
});
router.get("/home", async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render("realtimeproducts", { products });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
router.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render("realtimeproducts", { products });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
router.delete("/products/:pid", async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const deletedProduct = await productManager.deleteProduct(productId);
        if (deletedProduct) {
            io.emit('realtimeProductRemoval', productId);
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
