/* ----- CLASES ----- */
class producto {
    constructor(id,nombre, costo, cantidad) {
        this.id = parseInt(id);
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
}

/* ----- VARIABLES -----  */

let listProveedores = JSON.parse(localStorage.getItem('listProveedores')) || [];
let listProds = [];
let listOrdenCompra = JSON.parse(localStorage.getItem('listOrdenCompra')) || [];
let modificarOC, modificarProd = false;
let prodModificarID = 0;

// Variables para Orden de Compra
let inputId = document.querySelector('#id');
let selectProv = document.querySelector('#selectProv');
let tdSubtotal = document.querySelector('#subtotal');
let tdIva = document.querySelector('#iva');
let tdTotal = document.querySelector('#total');
let tableItems = document.querySelector('#tableItems');
let btnNewOC = document.querySelector('#btnNewOC');
let btnCancelar = document.querySelector('#btnCancelar');

// Variables para Producto
let modalProd = document.querySelector('#newItemProd');
let formItemProd = document.querySelector('#form-itemProd');
let inputNameProd = document.querySelector('#nameProd');
let inputCantidad = document.querySelector('#cantidad');
let inputPrecio = document.querySelector('#precio');
let btnItemProd = document.querySelector('#btnItemProd');
let btnModificar, btnEliminar = [];

// Variables de Validación
let invalidProveedor = document.querySelector('#invalidProveedor');
let invalidNameProd = document.querySelector('#invalidNameProd');
let invalidCantidad = document.querySelector('#invalidCantidad');
let invalidPrecio = document.querySelector('#invalidPrecio');


/* ------- FUNCIONES -------  */

const formatear = new Intl.NumberFormat("en", { style: "currency", currency: 'USD'});


// Direcciona a la lista de Ordenes de Compra
const dirListOrdenC = () => location.href ='./ordenCompras.html';

// Guardar en el LocalStorage
const guardarLocal = (clave, valor) => {
    localStorage.setItem(clave, valor)
}

// Limpiar el Formulario de Producto
const resetFormProd = () => {
    inputNameProd.value = '';
    inputCantidad.value = '';
    inputPrecio.value = '';
}

// Al momento de Cargar la Pagina
document.addEventListener('DOMContentLoaded', () => {
    // Si no hay lista de proveedores guardo al Localstore el archivo JSON.
    if (listProveedores == '') {
        fetch('./assets/proveedores.json')
            .then((res) => res.json())
            .then((proveedores) => {
                guardarLocal('listProveedores', JSON.stringify(proveedores));
                location.reload();
            })
    }
    getProveedores();

    // Verifica si es una Nueva Orden de Compra o se Modifica una existente.
    let modificarOrdenCompra = JSON.parse(localStorage.getItem('modificarOrdenCompra')) || '';
    if (modificarOrdenCompra) {
        modificarOC = true;
        let { id, proveedor, listProd } = modificarOrdenCompra;
        inputId.value = id;
        selectProv.value = proveedor.id || proveedor;
        listProd.forEach( prod => {
            inputNameProd.value = prod.nombre;
            inputCantidad.value = prod.cantidad;
            inputPrecio.value = prod.costo;
            agregarItem();
        })
    } else {
        inputId.value = listOrdenCompra.length + 1;
    }
})

// CARGAR los PROVEEDORES al Select
const getProveedores = () => {
    listProveedores.forEach(proveedor => {
        let { id, razonSocial } = proveedor;
        let itemProd = document.createElement('option');
        itemProd.value = id;
        itemProd.text = razonSocial;
        itemProd.className = 'text-uppercase';
        selectProv.appendChild(itemProd);
    });
}


/* ------ FUNCIONES AGREGANDO PRODUCTO --------*/

// EVENTO INGRESAR un ITEM PRODUCTO a la Orden de Compra
// Verifica que todos los campos sean correctos antes de guardar.
btnItemProd.addEventListener('click', (e) => {
    e.preventDefault();

    let inputs = formItemProd.querySelectorAll('input');
    let valid = true;
    inputs.forEach(input => {
        if (input.classList.contains('invalid') || input.value == '') {
            valid = false;
        }
    });

    if (valid) {
        modificarProd &&  modificarProdList(); // Pregunto si se modifico un producto de la lista.
        agregarItem();
        var modal = bootstrap.Modal.getInstance(modalProd);
        modal.hide();
    } else {
        toastInvalid();
    }
})

// MOSTRAR el ITEM Agregado en pantalla
// y ACTUALIZAR subtotal, iva y Total.
const agregarItem = () => {
    let newItem = new producto(listProds.length + 1, inputNameProd.value, inputPrecio.value, inputCantidad.value);
    let {id, nombre, costo, cantidad } = newItem;
    listProds.push(newItem);

    guardarLocal ('listProds', JSON.stringify(listProds));

    let item = document.createElement('tr');
    item.innerHTML = `
        <th scope="row">${listProds.length}</th>
        <td class="text-start">${ nombre }</td>
        <td>${ cantidad }</td>
        <td>${ formatear.format(costo) }</td>
        <td>${ formatear.format(newItem.importe()) }</td>
        <td><button class="btnModificar btn btn-warning" type="button" name="${id}"><i class="fa-solid fa-pen"></i></button>
        <button class="btnEliminar btn btn-danger ms-2" type="button" name="${id}"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;
    tableItems.appendChild(item);

    resetFormProd();
    calcularValores();

    btnModificar = document.querySelectorAll('.btnModificar');
    btnModificar.forEach((modificar) => {
        modificar.addEventListener('click', eventModificarItemProd.bind(this))
    });

    btnEliminar = document.querySelectorAll('.btnEliminar');
    btnEliminar.forEach( (eliminar) => {
        eliminar.addEventListener('click', eventEliminarItemProd.bind(this))
    })
}

// CALCULAR los valores Subtotal, Iva y Total
// de la Orden de Compra
const calcularValores = () =>{
    let subtotal = listProds.reduce((acc, prod) => acc + prod.importe(), 0);
    tdSubtotal.textContent = formatear.format(subtotal);
    iva = subtotal * 0.21;
    tdIva.textContent = formatear.format(iva);
    tdTotal.textContent = formatear.format(subtotal + iva);
}
/* --------------------------------*/



/* ------ FUNCIONES MODIFICAR PRODUCTO --------*/
// EVENTO MODIFICAR Item Producto
function eventModificarItemProd(e) {
    prodModificarID = parseInt(e.currentTarget.name);
    modificarProd = true;

    let prodModificar = listProds.find(prod => prod.id == prodModificarID);
    inputNameProd.value = prodModificar.nombre;
    inputCantidad.value = prodModificar.cantidad;
    inputPrecio.value = prodModificar.costo;

    let modal = new bootstrap.Modal(modalProd);
    modal.show();
}

// MODIFICAR el Item Producto
const modificarProdList = () =>{
    let prodModificado = new producto (prodModificarID, inputNameProd.value, inputPrecio.value, inputCantidad.value)
    let indexModProd = listProds.findIndex(prod => prod.id == prodModificarID);

    listProds.splice(indexModProd, 1, prodModificado);

    let newOrdenC = new ordenCompra(inputId.value, selectProv.value, listProds, 1);
    guardarLocal('modificarOrdenCompra',JSON.stringify(newOrdenC));
    location.reload();
}
/* --------------------------------*/


/* ------ FUNCION ELIMINAR PRODUCTO --------*/
// EVENTO ELIMINAR Item Producto
function eventEliminarItemProd(e){
    let idAnular = parseInt(e.currentTarget.name);
    console.log(idAnular);

    listProds = listProds.filter( prov => prov.id != idAnular);
    console.log(listProds);

    let newOrdenC = new ordenCompra(inputId.value, selectProv.value, listProds, 1);
    guardarLocal('modificarOrdenCompra',JSON.stringify(newOrdenC));
    location.reload();
}
/* --------------------------------*/


/* ------ FUNCIONES ORDEN DE COMPRA --------*/
// EVENTO boton GUARDAR ORDEN DE COMPRA
// Verifica que todos los campos sean correctos.
btnNewOC.addEventListener('click', (ev) => {
    ev.preventDefault();

    let valid = true;
    if (selectProv.classList.contains('invalid') || selectProv.value == '' || !(JSON.parse(localStorage.getItem('listProds')))) {
        valid = false;
    }
    valid ? modalSaveOrdenC() : toastInvalid();
})

// GUARDAR EL ORDEN DE COMPRA
// Controla si se modifica uno existente o se agrega uno nuevo.
const saveOrdenCompra = () => {
    let proveedorOc = listProveedores.find( (prov) => prov.id == parseInt(selectProv.value));

    let newOrdenC = new ordenCompra(inputId.value, proveedorOc, listProds, 1);

    if (modificarOC) {
        listOrdenCompra.splice(inputId.value - 1, 1, newOrdenC);
        localStorage.removeItem('modificarOrdenCompra')
    } else {
        listOrdenCompra.push(newOrdenC);
    }

    guardarLocal('listOrdenCompra', JSON.stringify(listOrdenCompra));
    localStorage.removeItem('listProds');
    dirListOrdenC();
}
/* --------------------------------*/



// ACCIÓN boton CANCELAR
btnCancelar.addEventListener('click', () => {
    modificarOC ? modalCancelar() : dirListOrdenC();
})


/* ----- VALIDACIONES -----  */

selectProv.addEventListener('blur', () => {
    if (selectProv.value == '') {
        console.log('aaaaaa');
        selectProv.classList.add('invalid');
        invalidProveedor.classList.remove('d-none');
    } else {
        selectProv.classList.remove('invalid');
        invalidProveedor.classList.add('d-none');
    }
})

inputNameProd.addEventListener('blur', () => {
    if (inputNameProd.value == '') {
        inputNameProd.classList.add('invalid');
        invalidNameProd.classList.remove('d-none');
    } else {
        inputNameProd.classList.remove('invalid');
        invalidNameProd.classList.add('d-none');
    }
})

inputCantidad.addEventListener('blur', () => {
    if (inputCantidad.value <= 0 || isNaN(inputCantidad.value)) {
        if (inputCantidad.value < 0) {
            inputCantidad.classList.add('invalid');
            invalidCantidad.textContent = 'Error!, debe ingresar un numero positivo.'
            invalidCantidad.classList.remove('d-none');
        } else {
            inputCantidad.classList.add('invalid');
            invalidCantidad.textContent = 'Error!, ingrese un numero mayor que Cero.';
            invalidCantidad.classList.remove('d-none');
        }
    } else {
        inputCantidad.classList.remove('invalid');
        invalidCantidad.classList.add('d-none');
    }
})

inputPrecio.addEventListener('blur', () => {
    if (inputPrecio.value <= 0 || isNaN(inputPrecio.value)) {
        if (inputPrecio.value < 0) {
            inputPrecio.classList.add('invalid');
            invalidPrecio.textContent = 'Error!, debe ingresar un numero positivo.'
            invalidPrecio.classList.remove('d-none');
        } else {
            inputPrecio.classList.add('invalid');
            invalidPrecio.textContent = 'Error!, ingrese un numero mayor que Cero.';
            invalidPrecio.classList.remove('d-none');
        }
    } else {
        inputPrecio.classList.remove('invalid');
        invalidPrecio.classList.add('d-none');
    }
})


/* ----- CONFIRMACIONES Y TOAST  SWEETALERT 2 -----  */

const modal = Swal.mixin({
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'No'
})

function modalSaveOrdenC() {
    modal.fire({
        title: 'Desea guardar la Orden de Compra?',
        icon: 'question',
    }).then((result) => {
        result.isConfirmed && saveOrdenCompra()
    })
}

function modalCancelar() {
    modal.fire({
        title: 'Seguro que desea salir sin guardar?',
        icon: 'question',
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('modificarOrdenCompra');
            localStorage.removeItem('listProds');
            modificar = false;
            dirListOrdenC();
        }
    })
}

function toastInvalid() {
    Swal.fire({
        toast: true,
        position: 'top-end',
        title: 'Error! Revisar que esten completos todos los campos.',
        icon: 'error',
        timerProgressBar: true,
        showConfirmButton: false,
        timer: 3000
    })
}