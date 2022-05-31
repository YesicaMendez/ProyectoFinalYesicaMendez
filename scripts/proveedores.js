/* ----- VARIABLES -----  */

let listProveedores = JSON.parse(localStorage.getItem('listProveedores')) || [];
let btnModificar = [];

let tableProveedor = document.querySelector('#tableProveedor');
let btnNuevoProv = document.querySelector('#btnNuevoProv');


/* ------- FUNCIONES -------  */

// Guardar en el LocalStorage
const guardarLocal = (clave, valor) => {
    localStorage.setItem(clave, valor)
}

// Al momento de Cargar la Pagina
document.addEventListener('DOMContentLoaded', () => {
    if (listProveedores == '') {
        fetch('./assets/proveedores.json')
            .then((res) => res.json())
            .then((proveedores) => {
                guardarLocal('listProveedores', JSON.stringify(proveedores));
                
            })
    }
    showProveedores();
})

// GENERAR NUEVO Proveedor
// Direcciona al formulario de Proveedor
btnNuevoProv.addEventListener('click', () => location.href = './formProveedores.html');

// CARGAR PROVEEDORES a la tabla
const showProveedores = () => {
    listProveedores.forEach( proveedor => {
        let prov = document.createElement('tr');
        let { id, razonSocial, cuit, domicilio } = proveedor;
        prov.innerHTML = `
            <th scope="row">${ id }</th>
            <td class="text-uppercase fw-bold">${ razonSocial }</td>
            <td class="text-center">${ cuit }</td>
            <td>${ domicilio }</td>
            <td class="text-center"><button class="btnModificar btn btn-warning" name="${ id }"><i class="fa-solid fa-pen"></i></button></td>
        `;
        tableProveedor.appendChild(prov);
    });

    btnModificar = document.querySelectorAll('.btnModificar');

    btnModificar.forEach((modificar) => {
        modificar.addEventListener('click', modificarProveedor.bind(this))
    })
}

// MODIFICAR Proveedor
// Agrego al localStorage el Proveedor a modificar.
// Direcciono al formulario de Proveedor.
function modificarProveedor (e) {
    console.log(e.currentTarget.name);
    let idMod = parseInt(e.currentTarget.name);
    let modificarProv = listProveedores.find((prov) => prov.id == idMod);
    guardarLocal ('modificarProv', JSON.stringify(modificarProv));
    location.href = './formProveedores.html';
}
