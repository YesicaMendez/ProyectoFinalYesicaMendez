/* ----- CLASES ----- */
class Proveedor {
    constructor(id, razon, cuit, domicilio) {
        this.id = id;
        this.razonSocial = razon;
        this.cuit = cuit;
        this.domicilio = domicilio;
    }
}


/* ----- VARIABLES -----  */

let listProveedores = JSON.parse(localStorage.getItem('listProveedores')) || [];
let modificar = false;

// Variables para Proveedor
let inputId = document.querySelector('#id');
let inputNombre = document.querySelector('#nombre');
let inputCuit = document.querySelector('#cuit');
let inputDomicilio = document.querySelector('#domicilio');

// Varibles para Botones
let btnNewProv = document.querySelector('#form-prov');
let btnCancelar = document.querySelector('#btnCancelar');
let btnLimpiar = document.querySelector('#btnLimpiar');

// Variables de Validación
let invalidNombre = document.querySelector('#invalidNombre');
let invalidCuit = document.querySelector('#invalidCuit');
let invalidDom = document.querySelector('#invalidDom');


/* ------- FUNCIONES -------  */

// Direcciona a la lista de Proveedores
const dirListProv = () => location.href ='./proveedores.html';

// Limpiar el Formulario de Proveedores
const resetForm = () => {
    inputNombre.value = '';
    inputCuit.value = '';
    inputDomicilio.value = '';
}

// Guardar en el LocalStorage
const guardarLocal = (clave, valor) => {
    localStorage.setItem(clave, valor)
}

// Al momento de Cargar la Pagina
document.addEventListener('DOMContentLoaded', () => {
    // Si no hay lista de proveedores guardo al Localstore el archivo JSON.
    if (listProveedores == '') {
        fetch('./assets/proveedores.json')
            .then((res) => res.json())
            .then((proveedores) => {
                guardarLocal('listProveedores', JSON.stringify(proveedores));
            })
    }

    // Verifica si es un Nuevo Proveedor o se Modifica una existente.
    let modificarProv = JSON.parse(localStorage.getItem('modificarProv')) || '';
    if (modificarProv) {
        modificar = true;
        let { id, razonSocial, cuit, domicilio } = modificarProv;
        inputId.value = id;
        inputNombre.value = razonSocial;
        inputCuit.value = cuit;
        inputDomicilio.value = domicilio;
    } else {
        inputId.value = listProveedores.length + 1;
    }
})

// INGRESAR un NUEVO PROVEEDOR
// Verifica que todos los campos sean correctos antes de guardar.
btnNewProv.addEventListener('submit', (e) => {
    e.preventDefault();

    // Controla si todos los valores ingresados son correctos.
    let inputs = document.querySelectorAll('input');
    let valid = true;
    inputs.forEach(input => {
        if (input.classList.contains('invalid') || input.value == '') {
            valid = false;
        }
    });

    // Guarda el Proveedor de estar correcto el formulario.
    valid ? modalSaveProveedor() : toastInvalid();
})

// GUARDAR EL PROVEDDOR
// Controla si se modifica uno existente o se agrega uno nuevo.
const saveProveedor = () => {
    let newProveedor = new Proveedor(inputId.value, inputNombre.value, inputCuit.value, inputDomicilio.value);

    // Verifica si es un modificar o agrega un nuevo Proveedor.
    if (modificar) {
        listProveedores.splice(inputId.value - 1, 1, newProveedor);
        localStorage.removeItem('modificarProv');
    } else {
        listProveedores.push(newProveedor);
    }
    guardarLocal('listProveedores', JSON.stringify(listProveedores));
    resetForm();
    dirListProv();
}

// ACCIÓN boton CANCELAR
btnCancelar.addEventListener('click', () => {
    console.log(modificar);
    modificar ? modalCancelar() : dirListProv();
})

// ACCIÓN boton LIMPIAR
btnLimpiar.addEventListener('click', (e) => {
    e.preventDefault();
    resetForm();
});


/* ----- VALIDACIONES -----  */

inputNombre.addEventListener('blur', () => {
    if (inputNombre.value == '') {
        inputNombre.classList.add('invalid');
        invalidNombre.classList.remove('d-none');
    } else {
        inputNombre.classList.remove('invalid');
        invalidNombre.classList.add('d-none');
    }
})

inputCuit.addEventListener('blur', () => {
    if (inputCuit.value == '') {
        inputCuit.classList.add('invalid');
        invalidCuit.classList.remove('d-none');
    } else {
        inputCuit.classList.remove('invalid');
        invalidCuit.classList.add('d-none');
    }
})

inputDomicilio.addEventListener('blur', () => {
    if (inputDomicilio.value == '') {
        inputDomicilio.classList.add('invalid');
        invalidDom.classList.remove('d-none');
    } else {
        inputDomicilio.classList.remove('invalid');
        invalidDom.classList.add('d-none');
    }
})


/* ----- CONFIRMACIONES Y TOAST SWEETALERT 2 -----  */

const modal = Swal.mixin({
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'No'
})

function modalSaveProveedor() {
    modal.fire({
        title: 'Desea guardar el Proveedor?',
        icon: 'question',
    }).then((result) => {
        result.isConfirmed && saveProveedor()
    })
}

function modalCancelar() {
    modal.fire({
        title: 'Seguro que desea salir sin guardar?',
        icon: 'question',
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('modificarProv');
            modificar = false;
            dirListProv();
        }
    })
}

function toastInvalid() {
    Swal.fire({
        toast: true,
        position: 'top-end',
        title: 'Datos Incorrectos! Revisar todos los campos.',
        icon: 'error',
        timerProgressBar: true,
        showConfirmButton: false,
        timer: 3000
    })
}
