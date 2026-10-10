
/* =========================================
   EL GLOBO - CANCIONES DE LA QUEMA
   Catálogo + administración + YouTube
========================================= */

const SUPABASE_URL = "https://spokbjpzrrijzaftwqoj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_aaJSwqXZxBoV72rbLIZYDA_9VF-Gg_p";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const CLAVE_CANCIONES = "huracan-canciones";
const CLAVE_FAVORITOS = "huracan-favoritos";

const cancionesIniciales = [
    {
        id: 1,
        titulo: "El Globo de Parque Patricios",
        categoria: "clasica",
        descripcion: "Ejemplo de una canción dedicada al club.",
        letra: "Acá va la letra de demostración.\n\nReemplazala por la letra correspondiente.",
        imagen: "imagenes/principal.pgn",
        original: {
            titulo: "",
            artista: "",
            youtubeId: ""
        }
    },
    {
        id: 2,
        titulo: "Dale Huracán",
        categoria: "popular",
        descripcion: "Ejemplo de un canto para alentar al equipo.",
        letra: "Acá va la letra de demostración.",
        imagen: "imagenes/principal.pgn",
        original: {
            titulo: "",
            artista: "",
            youtubeId: ""
        }
    },
    {
        id: 3,
        titulo: "La Quema está de fiesta",
        categoria: "popular",
        descripcion: "Ejemplo de un canto de cancha.",
        letra: "Acá va otra letra de demostración.",
        imagen: "imagenes/principal.pgn",
        original: {
            titulo: "",
            artista: "",
            youtubeId: ""
        }
    }
];

/* ELEMENTOS DEL CATÁLOGO */

const listaCanciones = document.getElementById("lista-canciones");
const buscador = document.getElementById("buscador");
const contador = document.getElementById("contador");
const sinResultados = document.getElementById("sin-resultados");

const dialogo = document.getElementById("dialogo-cancion");
const tituloDialogo = document.getElementById("titulo-dialogo");
const letraDialogo = document.getElementById("letra-dialogo");
const cerrarDialogo = document.getElementById("cerrar-dialogo");
const copiarLetra = document.getElementById("copiar-letra");
const favoritoDialogo = document.getElementById("favorito-dialogo");

const tituloOriginal = document.getElementById("titulo-original");
const artistaOriginal = document.getElementById("artista-original");
const reproductorOriginal = document.getElementById("reproductor-original");
const enlaceOriginal = document.getElementById("enlace-original");
const portadaOriginal = document.getElementById("portada-original");
/* ELEMENTOS DE ADMINISTRACIÓN */

const formulario = document.getElementById("formulario-cancion");
const campoId = document.getElementById("cancion-id");
const campoTitulo = document.getElementById("campo-titulo");
const campoCategoria = document.getElementById("campo-categoria");
const campoDestacada = document.getElementById("campo-destacada");
const campoDescripcion = document.getElementById("campo-descripcion");
const campoImagenArchivo = document.getElementById("campo-imagen-archivo");
const campoImagenUrl = document.getElementById("campo-imagen-url");
const campoLetra = document.getElementById("campo-letra");
const campoOriginalTitulo = document.getElementById("campo-original-titulo");
const campoArtista = document.getElementById("campo-artista");
const campoYoutube = document.getElementById("campo-youtube");

const cancelarEdicion = document.getElementById("cancelar-edicion");
const mensajeAdministracion = document.getElementById("mensaje-administracion");
const listaAdministracion = document.getElementById("lista-administracion");

/* CARGAR DATOS GUARDADOS */

function leerJSON(clave, valorPredeterminado) {
    try {
        const texto = localStorage.getItem(clave);

        if (texto === null) {
            return valorPredeterminado;
        }

        return JSON.parse(texto);
    } catch (error) {
        return valorPredeterminado;
    }
}

function cargarCanciones() {
    const guardadas = leerJSON(CLAVE_CANCIONES, null);

    if (Array.isArray(guardadas)) {
        return guardadas;
    }

    return cancionesIniciales.map(cancion => ({ ...cancion }));
}

let canciones = cargarCanciones();


async function cargarCancionesDesdeSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from("canciones")
            .select("*")
            .order("orden", { ascending: true })
            .order("id", { ascending: true });

        if (error) {
            throw error;
        }

        canciones = data.map(fila => ({
            id: Number(fila.id),
            titulo: fila.titulo,
            categoria: fila.categoria,
            descripcion: fila.descripcion || "",
            letra: fila.letra || "",
            imagen: fila.imagen || "imagenes/principal.pgn",
            destacada: fila.destacada === true,
            original: {
                titulo: fila.original_titulo || "",
                artista: fila.artista_original || "",
                youtubeId: fila.youtube_id || ""
            }
        }));

        guardarCanciones();
        mostrarCanciones();
        mostrarAdministracion();

        return true;
    } catch (error) {
        console.error(
            "No se pudo cargar el catálogo desde Supabase:",
            error
        );

        // Mostrar el catálogo que ya estaba cargado en el navegador.
        mostrarCanciones();
        mostrarAdministracion();

        return false;
    }
}

let favoritasGuardadas = leerJSON(CLAVE_FAVORITOS, []);

let favoritas = Array.isArray(favoritasGuardadas)
    ? favoritasGuardadas.filter(Number.isFinite)
    : [];

let filtroActual = "todas";
let cancionAbiertaId = null;

/* GUARDAR DATOS */

function guardarCanciones() {
    try {
        localStorage.setItem(CLAVE_CANCIONES, JSON.stringify(canciones));
        return true;
    } catch (error) {
        mensajeAdministracion.textContent =
            "No se pudieron guardar los cambios en este navegador.";
        return false;
    }
}

function guardarFavoritas() {
    try {
        localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritas));
    } catch (error) {
        console.warn("No se pudieron guardar los favoritos.", error);
    }
}

/* FUNCIONES AUXILIARES */

function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caracter => {
        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entidades[caracter];
    });
}

function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function nombreCategoria(categoria) {
    return {
        clasica: "Clásica",
        popular: "Popular"
    }[categoria] || "Canción quemera";
}

function obtenerCancion(id) {
    return canciones.find(cancion => cancion.id === id);
}

function siguienteId() {
    return Math.max(0, ...canciones.map(c => Number(c.id) || 0)) + 1;
}

/* OBTENER ID DE UN VIDEO DE YOUTUBE */

function obtenerIdYoutube(texto) {
    const valor = texto.trim();

    if (!valor) {
        return "";
    }

    // También permite pegar directamente el ID de 11 caracteres.
    if (/^[a-zA-Z0-9_-]{11}$/.test(valor)) {
        return valor;
    }

    try {
        const url = new URL(valor);
        let id = "";

        if (url.hostname === "youtu.be" ||
            url.hostname === "www.youtu.be") {
            id = url.pathname.split("/").filter(Boolean)[0] || "";
        } else if (
            ["youtube.com", "www.youtube.com", "m.youtube.com",
             "music.youtube.com"].includes(url.hostname)
        ) {
            if (url.pathname === "/watch") {
                id = url.searchParams.get("v") || "";
            } else {
                const partes = url.pathname.split("/").filter(Boolean);

                if (["embed", "shorts", "live"].includes(partes[0])) {
                    id = partes[1] || "";
                }
            }
        }

        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    } catch (error) {
        return null;
    }
}

/* BUSCADOR Y FILTROS */


function obtenerCancionesVisibles() {
    const consulta = normalizar(buscador.value);
    const orden = document.getElementById("orden-canciones").value;

    const visibles = canciones.filter(cancion => {
        const original = cancion.original || {};

        const textoBuscable = normalizar([
            cancion.titulo,
            cancion.descripcion,
            cancion.letra,
            original.titulo,
            original.artista
        ].join(" "));

        const coincideBusqueda = textoBuscable.includes(consulta);

        const coincideFiltro =
            filtroActual === "todas" ||
            (filtroActual === "favoritas" &&
                favoritas.includes(cancion.id)) ||
            cancion.categoria === filtroActual;

        return coincideBusqueda && coincideFiltro;
    });

    if (orden === "titulo") {
        visibles.sort((a, b) =>
            a.titulo.localeCompare(b.titulo, "es", {
                sensitivity: "base"
            })
        );
    } else if (orden === "titulo-desc") {
        visibles.sort((a, b) =>
            b.titulo.localeCompare(a.titulo, "es", {
                sensitivity: "base"
            })
        );
    } else if (orden === "recientes") {
        visibles.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return visibles;
}


/* MOSTRAR TARJETAS DEL CATÁLOGO */

function mostrarCanciones() {
    const visibles = obtenerCancionesVisibles();

    contador.textContent = visibles.length === 1
        ? "1 canción"
        : `${visibles.length} canciones`;

    sinResultados.hidden = visibles.length > 0;

    listaCanciones.innerHTML = visibles.map(cancion => {
        const esFavorita = favoritas.includes(cancion.id);

        return `
            <article class="tarjeta-cancion">
                <div class="tarjeta-imagen-contenedor">
                    <img
                        class="tarjeta-imagen"
                        src="${escaparHTML(cancion.imagen || "imagenes/principal.pgn")}"
                        alt=""
                        loading="lazy"
                        onerror="this.style.visibility='hidden'"
                    >
                </div>

                <span class="tarjeta-categoria">
                    ${escaparHTML(nombreCategoria(cancion.categoria))}
                </span>

                <h3>${escaparHTML(cancion.titulo)}</h3>

                <p>${escaparHTML(cancion.descripcion)}</p>

                <div class="tarjeta-acciones">
                    <button
                        class="boton-ver-cancion"
                        data-accion="abrir"
                        data-id="${Number(cancion.id)}"
                        type="button"
                    >
                        Ver canción →
                    </button>

                    <button
                        class="boton-favorito ${esFavorita ? "es-favorita" : ""}"
                        data-accion="favorito"
                        data-id="${Number(cancion.id)}"
                        type="button"
                        aria-label="${esFavorita ? "Quitar de favoritos" : "Agregar a favoritos"}"
                        aria-pressed="${esFavorita}"
                    >
                        ${esFavorita ? "♥" : "♡"}
                    </button>
                </div>
            </article>
        `;
    
    }).join("");

    mostrarDestacadas();
}


function mostrarDestacadas() {
    const contenedor = document.getElementById("lista-destacadas");

    if (!contenedor) return;

    const destacadas = canciones
    .filter(cancion => cancion.destacada === true)
    .slice(0, 3);

    contenedor.innerHTML = destacadas.map(cancion => `
        <article class="tarjeta-cancion tarjeta-destacada">
            <div class="tarjeta-imagen-contenedor">
                <img
                    class="tarjeta-imagen"
                    src="${escaparHTML(cancion.imagen || "imagenes/principal.pgn")}"
                    alt=""
                    loading="lazy"
                    onerror="this.style.visibility='hidden'"
                >
            </div>

            <span class="tarjeta-categoria">
                ${escaparHTML(nombreCategoria(cancion.categoria))}
            </span>

            <h3>${escaparHTML(cancion.titulo)}</h3>

            <p>${escaparHTML(cancion.descripcion)}</p>

            <div class="tarjeta-acciones">
                <button
                    class="boton-ver-cancion"
                    data-accion="abrir"
                    data-id="${Number(cancion.id)}"
                    type="button"
                >
                    Escuchar y ver letra →
                </button>
            </div>
        </article>
    `).join("");
}

/* MOSTRAR EL TEMA ORIGINAL Y SU VIDEO */


function mostrarOriginal(cancion) {
    const original = cancion.original || {};

    tituloOriginal.textContent =
        original.titulo || "Tema original todavía no cargado";

    artistaOriginal.textContent =
        original.artista ? `Artista: ${original.artista}` : "";

    reproductorOriginal.replaceChildren();

    enlaceOriginal.hidden = true;
    enlaceOriginal.removeAttribute("href");
    portadaOriginal.removeAttribute("src");

    if (!original.youtubeId ||
        !/^[a-zA-Z0-9_-]{11}$/.test(original.youtubeId)) {
        return;
    }

    const videoId = original.youtubeId;

    enlaceOriginal.href =
        `https://www.youtube.com/watch?v=${videoId}`;

    portadaOriginal.src =
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    portadaOriginal.alt =
        `Portada de ${original.titulo || "el tema original"}`;

    enlaceOriginal.hidden = false;
}

/* ABRIR UNA CANCIÓN */

function abrirCancion(id) {
    const cancion = obtenerCancion(id);

    if (!cancion) return;

    cancionAbiertaId = id;

    tituloDialogo.textContent = cancion.titulo;
    letraDialogo.textContent = cancion.letra;

    actualizarBotonFavoritoDialogo();
    mostrarOriginal(cancion);

    if (!dialogo.open) {
        dialogo.showModal();
    }
}

function actualizarBotonFavoritoDialogo() {
    const esFavorita = favoritas.includes(cancionAbiertaId);

    favoritoDialogo.textContent = esFavorita
        ? "♥ En favoritos"
        : "♡ Agregar a favoritos";
}

/* FAVORITOS */

function cambiarFavorito(id) {
    if (favoritas.includes(id)) {
        favoritas = favoritas.filter(favoritoId => favoritoId !== id);
    } else {
        favoritas.push(id);
    }

    guardarFavoritas();
    mostrarCanciones();
    mostrarAdministracion();

    if (cancionAbiertaId === id) {
        actualizarBotonFavoritoDialogo();
    }
}

/* PANEL: LISTAR CANCIONES Y ACCIONES */

function mostrarAdministracion() {
    listaAdministracion.innerHTML = canciones.map((cancion, indice) => `
        <article class="item-administracion">
            <div>
                <h4>${escaparHTML(cancion.titulo)}</h4>
                <p>
                    ${escaparHTML(nombreCategoria(cancion.categoria))}
                    ${favoritas.includes(cancion.id) ? " · ♥ Favorita" : ""}
                    ${cancion.destacada === true ? " · ★ Destacada" : ""}
                </p>
            </div>

            <div class="botones-administracion">
                <button
                    type="button"
                    data-admin-accion="subir"
                    data-id="${Number(cancion.id)}"
                    ${indice === 0 ? "disabled" : ""}
                    aria-label="Subir ${escaparHTML(cancion.titulo)}"
                >
                    ↑
                </button>

                <button
                    type="button"
                    data-admin-accion="bajar"
                    data-id="${Number(cancion.id)}"
                    ${indice === canciones.length - 1 ? "disabled" : ""}
                    aria-label="Bajar ${escaparHTML(cancion.titulo)}"
                >
                    ↓
                </button>

                <button
                    type="button"
                    data-admin-accion="editar"
                    data-id="${Number(cancion.id)}"
                >
                    Editar
                </button>

                <button
                    type="button"
                    data-admin-accion="eliminar"
                    data-id="${Number(cancion.id)}"
                >
                    Eliminar
                </button>
            </div>
        </article>
    `).join("");
}


/* PANEL: LIMPIAR FORMULARIO */

function limpiarFormulario() {
    formulario.reset();
    campoId.value = "";
    mensajeAdministracion.textContent = "";
    campoTitulo.focus();
}

/* PANEL: EDITAR CANCIÓN */

function editarCancion(id) {
    const cancion = obtenerCancion(id);

    if (!cancion) return;

    campoId.value = cancion.id;
    campoTitulo.value = cancion.titulo;
    campoDestacada.checked = cancion.destacada === true;
    campoCategoria.value = cancion.categoria;
    campoDescripcion.value = cancion.descripcion;
    campoLetra.value = cancion.letra;
    campoImagenArchivo.value = "";

campoImagenUrl.value =
    cancion.imagen &&
    !cancion.imagen.startsWith("data:") &&
    cancion.imagen !== "imagenes/principal.pgn"
        ? cancion.imagen
        : "";

    campoOriginalTitulo.value = cancion.original?.titulo || "";
    campoArtista.value = cancion.original?.artista || "";
    campoYoutube.value = cancion.original?.youtubeId
    ? `https://www.youtube.com/watch?v=${cancion.original.youtubeId}`
    : "";

    mensajeAdministracion.textContent =
        `Editando: ${cancion.titulo}`;

    document.getElementById("administracion").scrollIntoView({
        behavior: "smooth"
    });

    campoTitulo.focus();
}

/* PANEL: ELIMINAR CANCIÓN */


async function eliminarImagenSiNoSeUsa(urlImagen) {
    const prefijo =
        `${SUPABASE_URL}/storage/v1/object/public/imagenes-canciones/`;

    // No borrar imágenes externas ni direcciones desconocidas.
    if (!urlImagen || !urlImagen.startsWith(prefijo)) {
        return;
    }

    try {
        // Comprobar si alguna canción todavía utiliza esta imagen.
        const { data: cancionesQueLaUsan, error: errorConsulta } =
            await supabaseClient
                .from("canciones")
                .select("id")
                .eq("imagen", urlImagen)
                .limit(1);

        if (errorConsulta) {
            throw errorConsulta;
        }

        if (cancionesQueLaUsan.length > 0) {
            return;
        }

        const rutaImagen = decodeURIComponent(
            new URL(urlImagen).pathname.split(
                "/storage/v1/object/public/imagenes-canciones/"
            )[1]
        );

        const { error: errorBorrado } = await supabaseClient
            .storage
            .from("imagenes-canciones")
            .remove([rutaImagen]);

        if (errorBorrado) {
            throw errorBorrado;
        }
    } catch (error) {
        console.error(
            "No se pudo limpiar la portada anterior:",
            error
        );
    }
}


async function eliminarCancion(id) {
    const cancion = obtenerCancion(id);

    if (!cancion) return;

    const confirmar = window.confirm(
        `¿Querés eliminar "${cancion.titulo}" del catálogo?`
    );

    if (!confirmar) return;

    mensajeAdministracion.textContent =
        "Eliminando canción de la base de datos...";

    try {
        
const { data: cancionesEliminadas, error } = await supabaseClient
    .from("canciones")
    .delete()
    .eq("id", id)
    .select("id");

if (error) {
    console.error("Error al eliminar en Supabase:", error);

    mensajeAdministracion.textContent =
        "No se pudo eliminar la canción de la base de datos.";
    return;
}

if (!cancionesEliminadas || cancionesEliminadas.length === 0) {
    mensajeAdministracion.textContent =
        "La canción no se eliminó. Verificá tu sesión y tus permisos.";

    await cargarCancionesDesdeSupabase();
    return;
}


        // Actualizar el catálogo local.
        canciones = canciones.filter(item => item.id !== id);
        favoritas = favoritas.filter(
            favoritoId => favoritoId !== id
        );

        if (cancionAbiertaId === id) {
            dialogo.close();
            cancionAbiertaId = null;
        }

        guardarCanciones();
        guardarFavoritas();

        mostrarCanciones();
        mostrarAdministracion();

        if (campoId.value === String(id)) {
            formulario.reset();
            campoId.value = "";
        }

        mensajeAdministracion.textContent =
            "Canción eliminada correctamente.";

        // Limpiar la portada si pertenece a nuestro bucket.
        if (
            cancion.imagen &&
            cancion.imagen.startsWith(
                `${SUPABASE_URL}/storage/v1/object/public/imagenes-canciones/`
            )
        ) {
            try {
                const marca =
                    "/storage/v1/object/public/imagenes-canciones/";

                const rutaCodificada =
                    new URL(cancion.imagen).pathname
                        .split(marca)[1];

                const rutaImagen =
                    decodeURIComponent(rutaCodificada);

                // Comprobar si otra canción utiliza esa misma URL.
                const { data: otrasCanciones, error: errorConsulta } =
                    await supabaseClient
                        .from("canciones")
                        .select("id")
                        .eq("imagen", cancion.imagen)
                        .limit(1);

                if (errorConsulta) {
                    throw errorConsulta;
                }

                if (otrasCanciones.length === 0) {
                    const { error: errorImagen } =
                        await supabaseClient
                            .storage
                            .from("imagenes-canciones")
                            .remove([rutaImagen]);

                    if (errorImagen) {
                        console.error(
                            "La canción se eliminó, pero no se pudo borrar su imagen:",
                            errorImagen
                        );

                        mensajeAdministracion.textContent =
                            "Canción eliminada. No se pudo limpiar su portada.";
                    }
                }
            } catch (errorImagen) {
                console.error(
                    "Error al limpiar la portada:",
                    errorImagen
                );

                mensajeAdministracion.textContent =
                    "Canción eliminada. La portada quedó almacenada.";
            }
        }
    } catch (error) {
        console.error("Error inesperado al eliminar:", error);

        mensajeAdministracion.textContent =
            "Ocurrió un error al eliminar la canción.";
    }
}


/* PANEL: GUARDAR CANCIÓN NUEVA O EDITADA */


function leerImagenComoDataURL(archivo) {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();

        lector.onload = () => resolve(lector.result);
        lector.onerror = () => reject(
            new Error("No se pudo leer la imagen.")
        );

        lector.readAsDataURL(archivo);
    });
}

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const titulo = campoTitulo.value.trim();
    const descripcion = campoDescripcion.value.trim();
    const letra = campoLetra.value.trim();
    const categoria = campoCategoria.value;

    const tituloTemaOriginal = campoOriginalTitulo.value.trim();
    const artista = campoArtista.value.trim();
    const textoYoutube = campoYoutube.value.trim();

    const archivoImagen = campoImagenArchivo.files[0];
    const urlImagen = campoImagenUrl.value.trim();

    if (!titulo || !descripcion || !letra) {
        mensajeAdministracion.textContent =
            "Completá el título, la descripción y la letra.";
        return;
    }

    if (!["clasica", "popular"].includes(categoria)) {
        mensajeAdministracion.textContent =
            "Elegí una categoría válida.";
        return;
    }

    if (archivoImagen && !archivoImagen.type.startsWith("image/")) {
        mensajeAdministracion.textContent =
            "El archivo seleccionado no parece ser una imagen.";
        return;
    }

    if (archivoImagen && archivoImagen.size > 2 * 1024 * 1024) {
        mensajeAdministracion.textContent =
            "La imagen supera los 2 MB. Elegí una imagen más liviana.";
        return;
    }

    if (urlImagen) {
        try {
            const url = new URL(urlImagen);

            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("URL no permitida");
            }
        } catch (error) {
            mensajeAdministracion.textContent =
                "Pegá una URL válida que empiece con https:// o http://.";
            return;
        }
    }

    const youtubeId = obtenerIdYoutube(textoYoutube);

    if (textoYoutube && !youtubeId) {
        mensajeAdministracion.textContent =
            "El enlace de YouTube no parece válido.";
        return;
    }

    const idEditado = campoId.value
        ? Number(campoId.value)
        : null;

    const existente = idEditado
        ? obtenerCancion(idEditado)
        : null;

    let imagen = existente?.imagen || "imagenes/principal.pgn";

    
try {
    if (archivoImagen) {
        mensajeAdministracion.textContent =
            "Subiendo imagen a Supabase...";

        const nombreSeguro = archivoImagen.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9._-]/g, "_");

        const rutaImagen =
            `${Date.now()}-${nombreSeguro}`;

        const { data, error } = await supabaseClient
            .storage
            .from("imagenes-canciones")
            .upload(rutaImagen, archivoImagen, {
                cacheControl: "3600",
                upsert: false,
                contentType: archivoImagen.type
            });

        if (error) {
            console.error(
                "Error al subir la imagen:",
                error
            );

            mensajeAdministracion.textContent =
                "No se pudo subir la imagen. Revisá que hayas iniciado sesión como administrador.";
            return;
        }

        const { data: urlPublica } = supabaseClient
            .storage
            .from("imagenes-canciones")
            .getPublicUrl(data.path);

        imagen = urlPublica.publicUrl;

    } else if (urlImagen) {
        imagen = urlImagen;
    }
} catch (error) {
    console.error("Error al procesar la imagen:", error);

    mensajeAdministracion.textContent =
        "Ocurrió un error al cargar la imagen.";
    return;
}


const imagenAnterior = existente ? existente.imagen : "";

    const cancion = {
        id: existente ? existente.id : siguienteId(),
        titulo,
        categoria,
        descripcion,
        letra,
        imagen,
        destacada: campoDestacada.checked,
        original: {
            titulo: tituloTemaOriginal,
            artista,
            youtubeId: youtubeId || ""
        }
    };

    
    const filaSupabase = {
        id: cancion.id,
        titulo: cancion.titulo,
        categoria: cancion.categoria,
        descripcion: cancion.descripcion,
        letra: cancion.letra,
        imagen: cancion.imagen,
        destacada: cancion.destacada,
        original_titulo: cancion.original.titulo,
        artista_original: cancion.original.artista,
        youtube_id: cancion.original.youtubeId,
        enlace_youtube: cancion.original.youtubeId
            ? `https://www.youtube.com/watch?v=${cancion.original.youtubeId}`
            : null
    };

    mensajeAdministracion.textContent =
        "Guardando canción en la base de datos...";

    try {
        const { error } = await supabaseClient
            .from("canciones")
            .upsert(filaSupabase, { onConflict: "id" });

        if (error) {
            console.error("Error al guardar en Supabase:", error);

            mensajeAdministracion.textContent =
                "No se pudo guardar en la base de datos. Revisá tu sesión e intentá de nuevo.";
            return;
        }

        const cancionesAnteriores = canciones;

        if (existente) {
            canciones = canciones.map(item =>
                item.id === idEditado ? cancion : item
            );
        } else {
            canciones.push(cancion);
        }

        
if (!guardarCanciones()) {
    mensajeAdministracion.textContent =
        "La canción se guardó en Supabase, pero no se pudo guardar la copia local. Recargando el catálogo...";

    await cargarCancionesDesdeSupabase();

    mensajeAdministracion.textContent =
        "La canción está guardada en Supabase, pero no se pudo actualizar la copia local de este navegador.";

    return;
}

    } catch (error) {
        console.error("Error inesperado al guardar:", error);

        mensajeAdministracion.textContent =
            "Ocurrió un error al guardar la canción.";
        return;
    }

   
if (existente && imagenAnterior && imagenAnterior !== imagen) {
    await eliminarImagenSiNoSeUsa(imagenAnterior);
}

mostrarCanciones();
mostrarAdministracion();

if (cancionAbiertaId === cancion.id && dialogo.open) {
    abrirCancion(cancion.id);
}


    formulario.reset();
    campoId.value = "";

    mensajeAdministracion.textContent = existente
        ? "¡Canción actualizada correctamente!"
        : "¡Canción agregada al catálogo!";
});

/* EVENTOS DEL CATÁLOGO */

buscador.addEventListener("input", mostrarCanciones);

document.querySelectorAll(".filtro").forEach(boton => {
    boton.addEventListener("click", () => {
        filtroActual = boton.dataset.filtro;

        document.querySelectorAll(".filtro").forEach(filtro => {
            filtro.classList.toggle("activo", filtro === boton);
        });

        mostrarCanciones();
    });
});


function gestionarClicCanciones(evento) {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) return;

    const id = Number(boton.dataset.id);

    if (boton.dataset.accion === "abrir") {
        abrirCancion(id);
    }

    if (boton.dataset.accion === "favorito") {
        cambiarFavorito(id);
    }
}

listaCanciones.addEventListener("click", gestionarClicCanciones);

document.getElementById("lista-destacadas")
    .addEventListener("click", gestionarClicCanciones);

/* EVENTOS DE ADMINISTRACIÓN */


listaAdministracion.addEventListener("click", evento => {
    const boton = evento.target.closest("button[data-admin-accion]");

    if (!boton) return;

    const id = Number(boton.dataset.id);
    const accion = boton.dataset.adminAccion;

    if (accion === "editar") {
        editarCancion(id);
        return;
    }

    if (accion === "eliminar") {
        eliminarCancion(id);
        return;
    }

    if (accion === "subir" || accion === "bajar") {
        const indice = canciones.findIndex(cancion => cancion.id === id);

        if (indice === -1) return;

        const nuevoIndice = accion === "subir"
            ? indice - 1
            : indice + 1;

        if (nuevoIndice < 0 || nuevoIndice >= canciones.length) {
            return;
        }

        [canciones[indice], canciones[nuevoIndice]] =
            [canciones[nuevoIndice], canciones[indice]];

        if (guardarCanciones()) {
            mostrarAdministracion();
            mostrarCanciones();
        }
    }
});
cancelarEdicion.addEventListener("click", limpiarFormulario);

cerrarDialogo.addEventListener("click", () => {
    dialogo.close();
});

dialogo.addEventListener("click", evento => {
    if (evento.target === dialogo) {
        dialogo.close();
    }
});

dialogo.addEventListener("close", () => {
    reproductorOriginal.replaceChildren();
    cancionAbiertaId = null;
});

copiarLetra.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(letraDialogo.textContent);
        copiarLetra.textContent = "¡Letra copiada!";
    } catch (error) {
        copiarLetra.textContent =
            "No se pudo copiar; seleccioná la letra manualmente";
    }
});

favoritoDialogo.addEventListener("click", () => {
    if (cancionAbiertaId !== null) {
        cambiarFavorito(cancionAbiertaId);
    }
});

/* INICIAR */

mostrarCanciones();
mostrarAdministracion();


const botonMenuMovil = document.getElementById("menu-movil-boton");
const enlacesMenuMovil = document.getElementById("menu-movil-enlaces");

if (botonMenuMovil && enlacesMenuMovil) {
    botonMenuMovil.addEventListener("click", () => {
        const abierto = enlacesMenuMovil.classList.toggle("abierto");

        botonMenuMovil.setAttribute("aria-expanded", abierto);
        botonMenuMovil.setAttribute(
            "aria-label",
            abierto ? "Cerrar menú" : "Abrir menú"
        );
    });

    enlacesMenuMovil.querySelectorAll("a").forEach(enlace => {
        enlace.addEventListener("click", () => {
            enlacesMenuMovil.classList.remove("abierto");
            botonMenuMovil.setAttribute("aria-expanded", "false");
            botonMenuMovil.setAttribute("aria-label", "Abrir menú");
        });
    });
}



const botonAccesoAdministracion = document.getElementById("acceso-administracion");
const panelAdministracion = document.getElementById("administracion");

if (botonAccesoAdministracion && panelAdministracion) {
    botonAccesoAdministracion.addEventListener("click", async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session) {
            const { error } = await supabaseClient.auth.signOut();

            if (error) {
                alert("No se pudo cerrar la sesión.");
                console.error(error);
                return;
            }

            panelAdministracion.classList.remove("panel-visible");
panelAdministracion.hidden = true;
loginAdministracion.hidden = true;
botonAccesoAdministracion.textContent = "⚙ Acceso de administración";
            return;
        }

        loginAdministracion.hidden = !loginAdministracion.hidden;

        if (!loginAdministracion.hidden) {
            loginAdministracion.scrollIntoView({
                behavior: "smooth"
            });

            campoCorreoLogin.focus();
        }
    });
}

function exportarCopiaSeguridad() {
    const copiaSeguridad = {
        version: 1,
        fecha: new Date().toISOString(),
        canciones: canciones,
        favoritas: favoritas
    };

    const contenido = JSON.stringify(copiaSeguridad, null, 2);
    const archivo = new Blob([contenido], {
        type: "application/json"
    });

    const enlace = document.createElement("a");
    const url = URL.createObjectURL(archivo);

    enlace.href = url;
    enlace.download = "respaldo-cancionero-huracan.json";

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);

    alert("¡Copia de seguridad descargada correctamente!");
}

const botonExportarCopia = document.getElementById("boton-exportar-copia");

if (botonExportarCopia) {
    botonExportarCopia.addEventListener("click", exportarCopiaSeguridad);
}


async function importarCopiaSeguridad(archivo) {
    
    if (!archivo) {
        alert("Seleccioná un archivo de copia de seguridad.");
        return;
    }

    const { data: { session }, error: errorSesion } =
        await supabaseClient.auth.getSession();

    if (
        errorSesion ||
        !session ||
        session.user.id !== "4fe8e404-d98e-466a-8d5f-bd37fbd1995f"
    ) {
        alert(
            "Necesitás iniciar sesión con la cuenta administradora para importar un respaldo."
        );
        return;
    }

    const lector = new FileReader();

    lector.onload = async function () {
        try {
            const respaldo = JSON.parse(lector.result);

            if (
                !respaldo ||
                !Array.isArray(respaldo.canciones) ||
                !Array.isArray(respaldo.favoritas)
            ) {
                alert(
                    "El archivo no tiene el formato de una copia de seguridad válida."
                );
                return;
            }

            // Validar las canciones antes de modificar el catálogo.
            const ids = new Set();

            for (const cancion of respaldo.canciones) {
                if (
                    !cancion ||
                    !Number.isSafeInteger(Number(cancion.id)) ||
                    Number(cancion.id) <= 0 ||
                    typeof cancion.titulo !== "string" ||
                    typeof cancion.letra !== "string" ||
                    !["clasica", "popular"].includes(cancion.categoria)
                ) {
                    alert(
                        "El respaldo contiene una canción con datos inválidos."
                    );
                    return;
                }

                const id = Number(cancion.id);

                if (ids.has(id)) {
                    alert(
                        "El respaldo contiene canciones con IDs repetidos."
                    );
                    return;
                }

                ids.add(id);
            }

            const confirmar = confirm(
                "Las canciones del respaldo se agregarán o actualizarán en el catálogo compartido. Las canciones que no estén en el respaldo no se eliminarán. ¿Querés continuar?"
            );

            if (!confirmar) return;

            mensajeAdministracion.textContent =
                "Sincronizando el respaldo con Supabase...";

            // Convertir las canciones al formato de la tabla.
            const filasSupabase = respaldo.canciones.map(cancion => ({
                id: Number(cancion.id),
                titulo: cancion.titulo,
                categoria: cancion.categoria,
                descripcion: cancion.descripcion || "",
                letra: cancion.letra,
                imagen: cancion.imagen || null,
                destacada: cancion.destacada === true,
                original_titulo: cancion.original?.titulo || "",
                artista_original: cancion.original?.artista || "",
                youtube_id: cancion.original?.youtubeId || "",
                enlace_youtube: cancion.original?.youtubeId
                    ? `https://www.youtube.com/watch?v=${cancion.original.youtubeId}`
                    : null
            }));

            // Enviar el respaldo en bloques para evitar solicitudes enormes.
            for (let i = 0; i < filasSupabase.length; i += 100) {
                const bloque = filasSupabase.slice(i, i + 100);

                const { error } = await supabaseClient
                    .from("canciones")
                    .upsert(bloque, { onConflict: "id" });

                if (error) {
                    console.error(
                        "Error al importar canciones en Supabase:",
                        error
                    );

                    mensajeAdministracion.textContent =
                        "La importación no se completó. Algunas canciones podrían haberse actualizado; revisá el catálogo antes de volver a intentarlo.";
                    return;
                }
            }

            // Recargar el catálogo desde la base de datos.
            const cargadas = await cargarCancionesDesdeSupabase();

            if (!cargadas) {
                mensajeAdministracion.textContent =
                    "Las canciones se enviaron a Supabase, pero no se pudo recargar el catálogo.";
                return;
            }

            // Los favoritos siguen siendo personales de este navegador.
            
            // Mantener solamente favoritos de canciones existentes.
            const idsCancionesExistentes = new Set(
                canciones.map(cancion => Number(cancion.id))
            );

            favoritas = [
                ...new Set(
                    respaldo.favoritas
                        .map(Number)
                        .filter(id =>
                            Number.isSafeInteger(id) &&
                            id > 0 &&
                            idsCancionesExistentes.has(id)
                        )
                )
            ];

            if (!guardarFavoritas()) {
                mensajeAdministracion.textContent =
                    "Las canciones se importaron correctamente, pero no se pudieron guardar los favoritos en este navegador.";
                return;
            }


            mostrarCanciones();
            mostrarAdministracion();

            mensajeAdministracion.textContent =
                "Copia de seguridad sincronizada correctamente.";

            alert(
                "¡Copia de seguridad importada! Las canciones se sincronizaron con Supabase."
            );
        } catch (error) {
            console.error("Error al importar la copia:", error);

            alert(
                "No se pudo leer o importar el archivo. Comprobá que sea un respaldo válido."
            );
        }
    };

    lector.readAsText(archivo);
}


const botonImportarCopia = document.getElementById("boton-importar-copia");
const archivoCopiaSeguridad = document.getElementById("archivo-copia-seguridad");

if (botonImportarCopia && archivoCopiaSeguridad) {
    botonImportarCopia.addEventListener("click", () => {
        archivoCopiaSeguridad.click();
    });

    archivoCopiaSeguridad.addEventListener("change", () => {
        const archivo = archivoCopiaSeguridad.files[0];

        if (archivo) {
            importarCopiaSeguridad(archivo);
        }

        archivoCopiaSeguridad.value = "";
    });
}

const selectorOrdenCanciones = document.getElementById("orden-canciones");

if (selectorOrdenCanciones) {
    selectorOrdenCanciones.addEventListener("change", () => {
        mostrarCanciones();
    });
}

async function probarConexionSupabase() {
    const { data, error } = await supabaseClient
        .from("canciones")
        .select("*")
        .limit(1);

    if (error) {
        console.error("Error de conexión con Supabase:", error);
        return;
    }

    console.log("¡Conexión con Supabase correcta!", data);
}

cargarCancionesDesdeSupabase();

const loginAdministracion = document.getElementById("login-administracion");
const formularioLogin = document.getElementById("formulario-login");
const campoCorreoLogin = document.getElementById("correo-administracion");
const campoContrasenaLogin = document.getElementById("contrasena-login");
const mensajeLogin = document.getElementById("mensaje-login");

if (formularioLogin) {
    formularioLogin.addEventListener("submit", async evento => {
        evento.preventDefault();

        mensajeLogin.textContent = "Verificando acceso...";

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: campoCorreoLogin.value.trim(),
            password: campoContrasenaLogin.value
        });

        if (error) {
            mensajeLogin.textContent =
                "No se pudo iniciar sesión. Revisá el correo y la contraseña.";
            console.error("Error de inicio de sesión:", error);
            return;
        }
if (data.user.id !== "4fe8e404-d98e-466a-8d5f-bd37fbd1995f") {
    await supabaseClient.auth.signOut();

    mensajeLogin.textContent =
        "Esta cuenta no tiene permisos de administrador.";

    return;
}
        loginAdministracion.hidden = true;
panelAdministracion.hidden = false;
panelAdministracion.classList.add("panel-visible");

        botonAccesoAdministracion.textContent = "Cerrar administración";
        mensajeLogin.textContent = "";

        campoContrasenaLogin.value = "";

        panelAdministracion.scrollIntoView({
            behavior: "smooth"
        });

        console.log("Sesión iniciada correctamente:", data.user.id);
    });
}

async function restaurarSesionAdministracion() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("No se pudo comprobar la sesión:", error);
        panelAdministracion.hidden = true;
        return;
    }

    const session = data.session;

    if (!session) {
        panelAdministracion.hidden = true;
        panelAdministracion.classList.remove("panel-visible");
        botonAccesoAdministracion.textContent =
            "⚙ Acceso de administración";
        return;
    }

    // Solo se permite continuar al usuario administrador.
    if (session.user.id !== "4fe8e404-d98e-466a-8d5f-bd37fbd1995f") {
        await supabaseClient.auth.signOut();

        panelAdministracion.hidden = true;
        panelAdministracion.classList.remove("panel-visible");
        botonAccesoAdministracion.textContent =
            "⚙ Acceso de administración";
        return;
    }

    // Restaurar el estado de la administración.
    panelAdministracion.hidden = false;
    panelAdministracion.classList.add("panel-visible");
    loginAdministracion.hidden = true;
    botonAccesoAdministracion.textContent = "Cerrar administración";
}

restaurarSesionAdministracion();
