/* ----- CLASES ----- */
class producto {
    constructor(nombre, costo, cantidad) {
        this.nombre = nombre;
        this.costo = parseFloat(costo);
        this.cantidad = parseFloat(cantidad);
    };

    importe = () => this.costo * this.cantidad;
}

class ordenCompra {
    constructor(id, proveedor, listProd, estado) {
        this.id = id;
        this.proveedor = proveedor;
        this.listProd = listProd;
        this.estado = estado;
    }
    subtotal = () => listProd.reduce((acc, prod) => acc + (prod.cantidad * prod.costo), 0);
    iva = () => this.subtotal * 1.21;
    total = () => this.subtotal + this.iva;
}

/* ----- VARIABLES -----  */

let listOrdenCompra = JSON.parse(localStorage.getItem('listOrdenCompra')) || [];
let btnModificar, btnEliminar = [];

let tableOrdenCompra = document.querySelector('#tableOrdenCompra');
let btnNuevaOC = document.querySelector('#btnNuevaOC');


/* ------- FUNCIONES -------  */

const formatear = new Intl.NumberFormat("en", { style: "currency", currency: 'USD'});

// Guardar en el LocalStorage
const guardarLocal = (clave, valor) => {
    localStorage.setItem(clave, valor)
}

// Al momento de Cargar la Pagina
document.addEventListener('DOMContentLoaded', () => {
    listOrdenCompra = JSON.parse(localStorage.getItem('listOrdenCompra')) || [];

    showOrdenCompras();
})

// GENERAR NUEVA Orden de Compra
// Direcciona al formulario de Orden de Compra
btnNuevaOC.addEventListener('click', () => location.href = './index.html');

//CARGAR ORDEN DE COMPRAS a la tabla
const showOrdenCompras = () => {
    listOrdenCompra.forEach(ordenCompra => {
        
        // Muestrar cada Orden de Compra
        let oc = document.createElement('tr');
        let { id, proveedor: { razonSocial }, listProd, estado } = ordenCompra;
        oc.innerHTML = `
            <th scope="row">${id}</th>
            <td class="text-uppercase fw-bold">${razonSocial}</td>
            <td>
            <a class="nav-link" data-bs-toggle="collapse" href="#collapseListProduct${id}" role="button"
            aria-expanded="false" aria-controls="collapseExample">Ver Productos</a>
            </td>
            <td class="text-center">${estado ? 'Activo' : 'ANULADO'}</td>
            <td class="text-center">
            <button class="btnModificar btn btn-warning" name="${id}"><i class="fa-solid fa-pen"></i></button>
            <button class="btnEliminar btn btn-danger ms-2" name="${id}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tableOrdenCompra.appendChild(oc);

        // Mostrar los productos de cada orden
        let trProds = document.createElement('tr');
        trProds.id = `collapseListProduct${id}`;
        trProds.className = 'collapse';
        trProds.innerHTML = `
            <td colspan="5">
                <table class="table mb-0">
                    <thead class="text-center">
                        <tr class="table-warning">
                            <th scope="col">Item</th>
                            <th scope="col">Producto</th>
                            <th scope="col">Cantidad</th>
                            <th scope="col">P. Unitario</th>
                            <th scope="col">Importe</th>
                        </tr>
                    </thead>
                    <tbody id="listProd${id}"  class="table-group-divider text-center">
                    </tbody>
                    <tfoot>
                        <tr>
                            <td rowspan="3" colspan="3" class="border-start-0 border-bottom-0"></td>
                            <th>Subtotal</th>
                            <td id="subtotal${id}"></td>
                        </tr>
                        <tr>
                            <th>IVA 21%</th>
                            <td id="iva${id}"></td>
                        </tr>
                        <tr>
                            <th class="table-warning">TOTAL</th>
                            <td class="table-warning fw-bold" id="total${id}"></td>
                            </tr>
                    </tfoot>
                </table>
            </td>
        `;
        tableOrdenCompra.appendChild(trProds);

        // Agregar por productos a mostrar
        listProd.forEach((producto, i) => {
            let prod = document.createElement('tr');
            prod.className = "table mb-0";
            prod.innerHTML += `
                <th scope="row">${i + 1}</th>
                <td class="text-start">${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>${producto.costo}</td>
                <td>${producto.cantidad * producto.costo}</td>
            `;
            let tableItemsID = 'listProd' + id;
            document.getElementById(tableItemsID).insertAdjacentElement("beforeend", prod);
        });

        let subtotal = listProd.reduce((acc, prod) => acc + (prod.cantidad * prod.costo), 0);
        let subtotalID = 'subtotal'+ id;
        document.getElementById(subtotalID).innerHTML = formatear.format(subtotal);
        
        let iva = subtotal * 0.21;
        let ivaID = 'iva'+ id;
        document.getElementById(ivaID).innerHTML = formatear.format(iva);

        let total = subtotal + iva;
        let totalID = 'total'+ id;
        document.getElementById(totalID).innerHTML = formatear.format(total);

        btnModificar = document.querySelectorAll('.btnModificar');
        btnModificar.forEach((modificar) => {
            modificar.addEventListener('click', modificarOrdenCompra.bind(this))
        })

        btnEliminar = document.querySelectorAll('.btnEliminar');
        btnEliminar.forEach(eliminar => {
            eliminar.addEventListener('click', anularOrdenCompra.bind(this))
        })
    })
}

// MODIFICAR Orden de Compra
// Agrego al localStorage la Orden de Compra a modificar.
// Direcciono al formulario de Orden de Compra.
function modificarOrdenCompra(e) {
    console.log(e.currentTarget.name);
    let idMod = parseInt(e.currentTarget.name);
    let modificarOC = listOrdenCompra.find((oc) => oc.id == idMod);
    guardarLocal('modificarOrdenCompra', JSON.stringify(modificarOC));
    location.href = './index.html';
}

// ANULAR Orden de Compra
function anularOrdenCompra(e) {
    let idAnular = parseInt(e.currentTarget.name);
    Swal.fire({
        title: 'Seguro que desea Anular la Orden de Compra?',
        icon: 'warning',
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            let anularOrden = listOrdenCompra.find(oc => oc.id == idAnular);
            anularOrden.estado = 0;
            listOrdenCompra.splice(idAnular - 1, 1, anularOrden);
            guardarLocal('listOrdenCompra', JSON.stringify(listOrdenCompra));
            location.href = './ordenCompras.html';
        }
    })
}