/* =====================================================
VIDRIERÍA TATAN
CARRITO DE COMPRAS
===================================================== */
let carrito = [];
/* =====================================================
AGREGAR PRODUCTO
===================================================== */
function agregarAlCarrito(id, nombre, precio) {
    const productoExistente = carrito.find(
        producto => producto.id === id
    );
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }
    mostrarCarrito();
}
/* =====================================================
MOSTRAR CARRITO
===================================================== */
function mostrarCarrito() {
    const contenido = document.getElementById("carrito-contenido");
    const totalElemento = document.getElementById("total");
    contenido.innerHTML = "";
    if (carrito.length === 0) {
        contenido.innerHTML =
            '<p id="carrito-vacio">Tu carrito está vacío.</p>';
        totalElemento.textContent = "0";
        return;
    }
    let total = 0;
    carrito.forEach(producto => {
        const subtotal =
            producto.precio * producto.cantidad;
        total += subtotal;
        const item = document.createElement("div");
        item.classList.add("item-carrito");
        item.innerHTML = `
            <div class="item-info">
                <strong>${producto.nombre}</strong>
                <br>
                Cantidad: ${producto.cantidad}
            </div>
            <div class="item-precio">
                $${formatearPrecio(subtotal)}
            </div>
            <button
                class="btn-eliminar"
                onclick="eliminarDelCarrito(${producto.id})">
                Eliminar
            </button>
        `;
        contenido.appendChild(item);
    });
    totalElemento.textContent =
        formatearPrecio(total);
}
/* =====================================================
ELIMINAR PRODUCTO
   ===================================================== */
function eliminarDelCarrito(id) {
    carrito = carrito.filter(
        producto => producto.id !== id
    );
    mostrarCarrito();
}
/* =====================================================
FORMATEAR PRECIO
   ===================================================== */
function formatearPrecio(numero) {
    return numero.toLocaleString("es-CO");
}
/* =====================================================
ENVIAR PEDIDO A PYTHON
===================================================== */
document
    .getElementById("formulario-compra")
    .addEventListener("submit", async function(event) {
        event.preventDefault();
        /* Comprobar que haya productos */
        if (carrito.length === 0) {
            mostrarMensaje(
                "Agrega al menos un producto al carrito.",
                "error"
            );
            return;
        }
        /* Obtener datos */
        const nombre =
            document.getElementById("nombre").value;
        const telefono =
            document.getElementById("telefono").value;
        const email =
            document.getElementById("email").value;
        const direccion =
            document.getElementById("direccion").value;
        const metodoPago =
            document.getElementById("metodo_pago").value;
        /* Calcular total */
        let total = 0;
        carrito.forEach(producto => {
            total +=
                producto.precio * producto.cantidad;
        });
        /* Preparar pedido */
        const pedido = {
            nombre: nombre,
            telefono: telefono,
            email: email,
            direccion: direccion,
            metodo_pago: metodoPago,
            productos: carrito,
            total: total
        };
        try {
            /* Enviar información a Python */
            const respuesta = await fetch(
                "/guardar_pedido",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(pedido)
                }
            );
            const resultado =
                await respuesta.json();
            if (resultado.exito) {
                mostrarMensaje(
                    "✅ ¡Pedido realizado correctamente!",
                    "exito"
                );
                /* Vaciar carrito */
                carrito = [];
                mostrarCarrito();
                /* Limpiar formulario */
                document
                    .getElementById("formulario-compra")
                    .reset();
            } else {
                mostrarMensaje(
                    "❌ No se pudo guardar el pedido.",
                    "error"
                );
            }
        } catch (error) {
            console.error(error);
            mostrarMensaje(
                "❌ No se pudo conectar con el servidor de Python.",
                "error"
            );
        }
    });
/* =====================================================
MOSTRAR MENSAJES
   ===================================================== */
function mostrarMensaje(texto, tipo) {
    const mensaje =
        document.getElementById("mensaje");
    mensaje.textContent = texto;
    if (tipo === "exito") {
        mensaje.style.color = "#008f8c";
    } else {
        mensaje.style.color = "#d9534f";
    }
}