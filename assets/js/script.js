// --- Variables y elementos DOM ---
const btnLogin = document.getElementById("btnLogin");
const modalLogin = document.getElementById("modalLogin");
const modalLoginClose = document.querySelector(".modal-login-close");
const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");
const btnModoOscuro = document.getElementById("btnModoOscuro");

const catalogoContainer = document.getElementById("catalogo");
const carritoContainer = document.getElementById("carritoItems");
const carritoTotal = document.getElementById("carritoTotal");

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// --- FUNCIONES MODAL LOGIN ---
// Mostrar modal login si no hay usuario logueado
btnLogin.addEventListener("click", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (!usuario) {
    modalLogin.style.display = "flex";
    modalLogin.setAttribute("aria-hidden", "false");
  }
});

modalLoginClose.addEventListener("click", () => cerrarModal("modalLogin"));
window.addEventListener("click", (e) => { if (e.target === modalLogin) cerrarModal("modalLogin"); });

function cerrarModal(idModal) {
  const modal = document.getElementById(idModal);
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

// --- TOGGLE FORMULARIOS LOGIN/REGISTRO ---
document.getElementById("mostrarRegistro").addEventListener("click", e => {
  e.preventDefault();
  formLogin.style.display = "none";
  formRegistro.style.display = "block";
});

document.getElementById("mostrarLogin").addEventListener("click", e => {
  e.preventDefault();
  formRegistro.style.display = "none";
  formLogin.style.display = "block";
});

// --- REGISTRO ---
formRegistro.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("emailRegistro").value.trim();
  const password = document.getElementById("passwordRegistro").value.trim();

  if (!email || !password) {
    alert("Por favor completa todos los campos");
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password })
    });
    const data = await res.json();

    if (res.ok) {
      alert(`Registro exitoso para ${email}. Ya puedes iniciar sesión.`);
      formRegistro.reset();
      formRegistro.style.display = "none";
      formLogin.style.display = "block";
    } else {
      alert(data.error || "Error en el registro.");
    }
  } catch {
    alert("Error al conectar con el servidor.");
  }
});

// --- LOGIN ---
formLogin.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("emailLogin").value.trim();
  const password = document.getElementById("passwordLogin").value.trim();

  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Credenciales inválidas");
      return;
    }

    alert(`Bienvenido de nuevo, ${data.username}`);
    localStorage.setItem("usuarioLogueado", JSON.stringify({ username: data.username }));
    cerrarModal("modalLogin");
    formLogin.reset();
    actualizarEstadoUsuario();

  } catch (error) {
    console.error("Error en login:", error);
    alert("Error al conectar con el servidor.");
  }
});

// --- ACTUALIZAR UI SEGÚN ESTADO USUARIO ---
function actualizarEstadoUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (usuario) {
    btnLogin.textContent = `Cerrar sesión (${usuario.username})`;
    btnLogin.onclick = () => {
      localStorage.removeItem("usuarioLogueado");
      actualizarEstadoUsuario();
      alert("Sesión cerrada");
    };
  } else {
    btnLogin.textContent = "Iniciar Sesión";
    btnLogin.onclick = () => {
      modalLogin.style.display = "flex";
      modalLogin.setAttribute("aria-hidden", "false");
    };
  }
}

// --- MODO OSCURO ---
function aplicarModo() {
  const modoGuardado = localStorage.getItem("modoOscuro");
  if (modoGuardado === "true") {
    document.body.classList.add("dark");
    if(btnModoOscuro) btnModoOscuro.textContent = "Modo Claro";
  } else {
    document.body.classList.remove("dark");
    if(btnModoOscuro) btnModoOscuro.textContent = "Modo Oscuro";
  }
}

if (btnModoOscuro) {
  btnModoOscuro.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const modoActual = document.body.classList.contains("dark");
    localStorage.setItem("modoOscuro", modoActual);
    btnModoOscuro.textContent = modoActual ? "Modo Claro" : "Modo Oscuro";
  });
}

// --- CATÁLOGO DE PRODUCTOS (mock para ejemplo) ---
const productos = [
  { id: 1, nombre: "Producto 1", precio: 250, img: "https://via.placeholder.com/200x150?text=Producto+1" },
  { id: 2, nombre: "Producto 2", precio: 450, img: "https://via.placeholder.com/200x150?text=Producto+2" },
  { id: 3, nombre: "Producto 3", precio: 300, img: "https://via.placeholder.com/200x150?text=Producto+3" }
];

function renderCatalogo() {
  catalogoContainer.innerHTML = "";
  productos.forEach(prod => {
    const card = document.createElement("div");
    card.className = "producto-card";
    card.innerHTML = `
      <img src="${prod.img}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p class="precio">$${prod.precio}</p>
      <button data-id="${prod.id}">Agregar al carrito</button>
    `;
    catalogoContainer.appendChild(card);
  });
  // Agregar eventos botones agregar
  catalogoContainer.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      agregarAlCarrito(id);
    });
  });
}

// --- FUNCIONES CARRITO ---
// Agregar producto al carrito o aumentar cantidad
function agregarAlCarrito(idProducto) {
  const item = carrito.find(i => i.id === idProducto);
  if (item) {
    item.cantidad++;
  } else {
    const producto = productos.find(p => p.id === idProducto);
    carrito.push({ ...producto, cantidad: 1 });
  }
  guardarCarrito();
  renderCarrito();
}

// Guardar carrito en localStorage
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Renderizar carrito con opciones editar y borrar
function renderCarrito() {
  carritoContainer.innerHTML = "";
  if(carrito.length === 0){
    carritoContainer.innerHTML = "<p>El carrito está vacío.</p>";
    carritoTotal.textContent = "$0";
    return;
  }

  carrito.forEach(item => {
    const div = document.createElement("div");
    div.className = "carrito-item";
    div.innerHTML = `
      <span><strong>${item.nombre}</strong> - $${item.precio} x </span>
      <input type="number" min="1" value="${item.cantidad}" style="width: 50px" data-id="${item.id}">
      <span> = $${item.precio * item.cantidad}</span>
      <button class="btn-editar" data-id="${item.id}">Editar</button>
      <button class="btn-borrar" data-id="${item.id}">Borrar</button>
    `;
    carritoContainer.appendChild(div);
  });

  // Mostrar total
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  carritoTotal.textContent = `$${total}`;

  // Eventos inputs cantidad (editar cantidad directo)
  carritoContainer.querySelectorAll("input[type='number']").forEach(input => {
    input.addEventListener("change", e => {
      const id = parseInt(e.target.dataset.id);
      let cant = parseInt(e.target.value);
      if (isNaN(cant) || cant < 1) cant = 1;
      actualizarCantidad(id, cant);
    });
  });

  // Eventos borrar
  carritoContainer.querySelectorAll(".btn-borrar").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      eliminarDelCarrito(id);
    });
  });

  // Eventos editar (en este caso podemos abrir un prompt para cambiar cantidad o producto)
  carritoContainer.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      editarItemCarrito(id);
    });
  });
}

function actualizarCantidad(idProducto, cantidad) {
  const item = carrito.find(i => i.id === idProducto);
  if (item) {
    item.cantidad = cantidad;
    guardarCarrito();
    renderCarrito();
  }
}

function eliminarDelCarrito(idProducto) {
  carrito = carrito.filter(i => i.id !== idProducto);
  guardarCarrito();
  renderCarrito();
}

function editarItemCarrito(idProducto) {
  const item = carrito.find(i => i.id === idProducto);
  if (!item) return;

  // Ejemplo simple: solo editar cantidad vía prompt
  let nuevaCantidad = prompt(`Modificar cantidad de ${item.nombre}:`, item.cantidad);
  nuevaCantidad = parseInt(nuevaCantidad);
  if (!isNaN(nuevaCantidad) && nuevaCantidad > 0) {
    actualizarCantidad(idProducto, nuevaCantidad);
  } else {
    alert("Cantidad inválida");
  }
}

// --- NUEVO: BOTÓN ENVIAR PEDIDO ---
const btnEnviarPedido = document.getElementById("btnEnviarPedido");

btnEnviarPedido?.addEventListener("click", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (!usuario) {
    alert("Debes iniciar sesión para enviar el pedido.");
    modalLogin.style.display = "flex";
    modalLogin.setAttribute("aria-hidden", "false");
    return;
  }

  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  // Armar el mensaje con usuario y productos
  let mensaje = `Nuevo pedido de ${usuario.username}:\n\n`;
  carrito.forEach(item => {
    mensaje += `- ${item.nombre} x ${item.cantidad} = $${item.precio * item.cantidad}\n`;
  });
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  mensaje += `\nTotal: $${total}`;

  try {
    const res = await fetch('http://localhost:3000/api/compra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje })
    });
    const data = await res.json();

    if (res.ok) {
      alert("Pedido enviado correctamente.");
      carrito = [];
      guardarCarrito();
      renderCarrito();
    } else {
      alert(data.error || "Error al enviar el pedido.");
    }
  } catch (error) {
    alert("No se pudo conectar con el servidor.");
  }
});

// --- INICIALIZACIONES ---
window.addEventListener("DOMContentLoaded", () => {
  actualizarEstadoUsuario();
  aplicarModo();
  renderCatalogo();
  renderCarrito();
});
