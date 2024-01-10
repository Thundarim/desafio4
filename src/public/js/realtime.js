const socket = io();

socket.on('realtimeProductUpdate', addedProduct => {
});

socket.on('realtimeProductRemoval', removedProductId => {
    const productElement = document.getElementById(`product_${removedProductId}`);
    if (productElement) {
        productElement.remove();
    }
});

async function deleteProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('La respuesta de la red fue invalidada');
        }

        socket.emit('realtimeProductRemoval', productId);
        fetchAndRenderProductList();
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
    }
}

async function fetchAndRenderProductList() {
    try {
        const productList = await fetch('/api/products');
        const products = await productList.json();
        renderProductList(products);
    } catch (error) {
        console.error('Error al obtener la lista de productos:', error);
    }
}
function addProduct(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value;
    const thumbnail = document.getElementById('thumbnail').value;
    const code = document.getElementById('code').value;
    const stock = document.getElementById('stock').value;

    const newProduct = {
        title,
        description,
        price: parseFloat(price),
        category,
        thumbnail,
        code,
        stock: parseInt(stock),
    };

    fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
    })
    .then(response => response.json())
    .then(addedProduct => {
        console.log('Producto agregado:', addedProduct);
        socket.emit('realtimeProductUpdate', addedProduct);
        fetchAndRenderProductList();
    })
    .catch(error => {
        console.error('Error al agregar producto:', error);
    });
}



function renderProductList(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    products.forEach(product => {
        const listItem = document.createElement('li');
        listItem.id = `product_${product.id}`;
        listItem.innerHTML = `
            <div class="product-details">
            <div>${product.title}</div>
                <div>Precio: ${product.price}</div>
                <div>Stock: ${product.stock}</div>
                <button type="button" onclick="deleteProduct('${product.id}')">Borrar</button>
            </div>
            
        `;
        productList.appendChild(listItem);
    });
}
fetchAndRenderProductList();
