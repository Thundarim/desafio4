const express = require("express");
const router = express.Router();
const CartManager = require("../controllers/cartManager");
const fs = require("fs").promises;
const cartManager = new CartManager("./src/models/carts.json");

router.get("/carts", async (req, res) => {
    try {
        const carts = await cartManager.getCarts();
        res.json(carts);
    } catch (error) {
        console.error("Error al obtener carritos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
//mostrar carritos
router.post("/carts", async (req, res) => {
    try {
        const newCart = req.body;
        if (!isValidCart(newCart)) {
            return res.status(400).json({ error: "Datos de carrito no válidos" });
        }

        const carts = await cartManager.getCarts();
        const existingCartIndex = carts.findIndex(item => item.id === newCart.id);

        if (existingCartIndex !== -1) {
            const existingCart = carts[existingCartIndex];
            newCart.products.forEach(newProduct => {
                const existingProductIndex = existingCart.products.findIndex(existingProduct => existingProduct.id === newProduct.id);
                if (existingProductIndex !== -1) {
                    existingCart.products[existingProductIndex].quantity += newProduct.quantity;
                } else {
                    existingCart.products.push(newProduct);
                }
            });
        } else {
            newCart.id = generateCartId();
            carts.push(newCart);
        }

        await fs.writeFile("./src/models/carts.json", JSON.stringify(carts, null, 2), "utf-8");
        res.json(newCart);
    } catch (error) {
        console.error("Error al agregar carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

//obtener carritos por id
router.get("/carts/:cid", async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener carrito por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

//añadir un producto al carrito
router.post("/carts/:cid/products/:pid", async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = parseInt(req.params.pid);
        const quantity = req.body.quantity || 1;
        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);

        res.json(updatedCart);
    } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

//funcion para validar que el carrito añadido sea correcto
function isValidCart(cart) {
    return (
        cart &&
        typeof cart.id === "string" &&
        true
    );
}

function generateCartId() {
    return Math.random().toString(36).substr(2, 9);
}

module.exports = router;
