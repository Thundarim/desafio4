const fs = require("fs").promises;

class ProductManager {
    static ultId = 0;

    constructor(path) {
        this.products = [];
        this.path = path;
        this.removedProductId = null;
    }
    async getProducts() {
        try {
            const respuesta = await fs.readFile("./src/models/products.json", "utf-8");
            const arrayProductos = JSON.parse(respuesta);
            return arrayProductos;
        } catch (error) {
            console.error(error);
        }
    }
    async getProductById(id) {
        try {
            const arrayProductos = await this.getProducts();
            const buscado = arrayProductos.find(item => item.id === id);
            return buscado;
        } catch (error) {
            console.error(error);
        }
    }
    async addProduct(newProduct) {
        try {
            const arrayProductos = await this.getProducts();
            const ultId = arrayProductos.length > 0 ? Math.max(...arrayProductos.map(product => product.id)) + 1 : 1;
            newProduct.id = ultId;
            if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
                throw new Error("Todos los campos son obligatorios");
            }
            newProduct.status = true;
            arrayProductos.push(newProduct);
            await fs.writeFile("./src/models/products.json", JSON.stringify(arrayProductos, null, 2));
            return newProduct;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async updateProduct(productId, updatedFields) {
        const products = await this.getProducts();
        const productIndex = products.findIndex(product => product.id === productId);

        if (productIndex !== -1) {
            products[productIndex] = { ...products[productIndex], ...updatedFields };

            await fs.writeFile("./src/models/products.json", JSON.stringify(products, null, 2));
            return products[productIndex];
        } else {
            return null;
        }
    }
    async deleteProduct(productId) {
        const products = await this.getProducts();
        const updatedProducts = products.filter(product => product.id !== productId);
        

        if (updatedProducts.length < products.length) {
            await fs.writeFile("./src/models/products.json", JSON.stringify(updatedProducts, null, 2));
            this.removedProductId = productId;
            return true;
        } else {
            return false;
        }
        
    }
    getRemovedProductId() {
        return this.removedProductId;
    }
}



module.exports = ProductManager;
