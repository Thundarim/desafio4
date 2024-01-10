const fs = require("fs").promises;

class CartManager {
    async getCarts() {
        return fs.readFile("./src/models/carts.json", "utf-8")
            .then((respuesta) => JSON.parse(respuesta))
            .catch((error) => {
                console.error("Error al leer el carrito", error);
                throw error;
            });
    }

    async getCartById(id) {
        const arrayCarritos = await this.getCarts();
        const buscado = arrayCarritos.find(item => item.id === id);
        return buscado;
    }
    async addProductToCart(cartId, productId, quantity) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(item => item.id === cartId);

        if (cartIndex !== -1) {
            const existingProductIndex = carts[cartIndex].products.findIndex(item => item.id === productId);

            if (existingProductIndex !== -1) {
                carts[cartIndex].products[existingProductIndex].quantity += quantity;
            } else {
                carts[cartIndex].products.push({ id: productId, quantity });
            }

            await fs.writeFile("./src/models/carts.json", JSON.stringify(carts, null, 2), "utf-8");
            return carts[cartIndex];
        } else {
            throw new Error("Carrito no encontrado");
        }
    }
}

module.exports = CartManager;
