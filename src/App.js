// Constantes
const express = require("express");
const multer = require("multer");
const exphbs = require("express-handlebars");
const ProductManager = require("./controllers/productManager.js");

const app = express();
const PUERTO = 8080;

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const socket = require("socket.io");



// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./src/public/img");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// Configuración de la aplicación
app.use(express.static("./src/public"));
app.use(express.json());
app.use("/api", productsRouter);
app.use("/api", cartsRouter);

// Ruta de carga de archivos
app.post("/upload", upload.single("imagen"), (req, res) => {
    res.send("¡Archivo subido exitosamente!");
});

// Configuración de Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Rutas de Handlebars
app.use("/", viewsRouter);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal!');
});

// Inicio del servidor

const httpServer = app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto: ${PUERTO}`);
});

const io = socket(httpServer);
const productManager = new ProductManager("./src/models/products.json", io);

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('mensaje', (msg) => {
        console.log(`Mensaje: ${msg}`);
        io.emit('mensaje', { senderId: socket.id, message: msg });
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });

    app.post("/api/products", async (req, res) => {
        try {
            const newProduct = req.body;
            const addedProduct = await productManager.addProduct(newProduct);
            console.log(`Usuario ${socket.id} ha agregado un nuevo producto:`, newProduct);
            io.emit('realtimeProductUpdate', addedProduct);

            res.json(addedProduct);
        } catch (error) {
            console.error("Error al agregar producto:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    });

    app.post("/api/products/delete/:pid", async (req, res) => {
        try {
            const productId = parseInt(req.params.pid);
            const deletedProduct = await productManager.deleteProduct(productId);
            console.log(`Usuario ${socket.id} ha eliminado un producto con ID: ${productId}`);
            io.emit('realtimeProductRemoval', productId);

            res.json({ message: "Producto eliminado correctamente" });
        } catch (error) {
            console.error("Error al eliminar producto por ID:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    });
});
