// Verificar si el token es válido y si el usuario tiene permisos de Superadmin
document.addEventListener('DOMContentLoaded', async () => {
	const token = localStorage.getItem('token');
	if (!token) {
		showAlert('Acceso denegado. Por favor inicia sesión', 'danger');
		window.location.href = '/login';
		return;
	}

	try {
		const { data } = await axios.get('/api/v1/users/profile', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (data.msg.id_rol !== 2) { // Verifica si el usuario es superadmin
			showAlert('No tienes permisos para acceder a esta página.', 'danger');
			window.location.href = '/login';
		}
	} catch (error) {
		console.error('Error al verificar el usuario:', error);
		showAlert('Error al verificar el acceso.', 'danger');
showAlert(response.data.msg, 'success');		window.location.href = '/login';
	}
});

// Mostrar formulario de registro de usuario
document.getElementById('btnRegisterUser').addEventListener('click', function () {
	document.getElementById('userForm').style.display = 'block';
	document.getElementById('usersPanel').style.display = 'none';
});

// Mostrar el panel de usuarios
document.getElementById('btnViewUsers').addEventListener('click', function () {
	document.getElementById('usersPanel').style.display = 'block';
	document.getElementById('userForm').style.display = 'none';
	getAllUsers(); // Cargar los usuarios al abrir el panel
});

// Enviar formulario de creación de usuario
document.getElementById('createUserForm').addEventListener('submit', async function (e) {
	e.preventDefault();

	const nombre = document.getElementById('nombre').value;
	const apellido = document.getElementById('apellido').value;
	const email = document.getElementById('email').value;
	const contrasena = document.getElementById('contrasena').value;
	const fecha_nacimiento = document.getElementById('fecha_nacimiento').value;
	const genero = document.getElementById('genero').value;
	const celular = document.getElementById('celular').value;
	const pais_nacimiento = document.getElementById('pais_nacimiento').value;
	const usuario = document.getElementById('usuario').value;
	const id_rol = document.getElementById('id_rol').value;

	try {
		const response = await axios.post('/api/v1/users/register', {
			nombre, apellido, email, contrasena, fecha_nacimiento, genero, celular, pais_nacimiento, usuario, id_rol
		});

		showAlert(response.data.msg, 'success');
		document.getElementById('createUserForm').reset();
		window.location.href = '/dashboard-superadmin';
	} catch (error) {
		const errorMsg = error.response?.data?.msg || 'Error al registrar el usuario';
        showAlert(errorMsg, 'danger');
	}
});

// Función para obtener todos los usuarios
async function getAllUsers() {
	try {
		const response = await axios.get('/api/v1/users', {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`
			}
		});
		
		if (!response.data.ok) {
			throw new Error(response.data.msg);
		}
	
		const users = response.data.msg;
		
		const usersList = document.getElementById('usersList');
		usersList.innerHTML = ''; // Limpiar la lista de usuarios antes de agregar

		users.forEach(user => {
			const row = document.createElement('tr');
			row.innerHTML = `
		
				<td>${user.nombre}</td>
				<td>${user.apellido}</td>
				<td>${user.email}</td>
				<td>${user.nombre_rol}</td>
			`;
			usersList.appendChild(row);
		});
	} catch (error) {
		const errorMsg = error.response?.data?.msg || 'Error al obtener los usuarios';
        showAlert(errorMsg, 'danger');
	}
}

// Función de búsqueda de usuarios por correo
document.getElementById('btnSearchUser').addEventListener('click', async () => {
	const searchEmail = document.getElementById('searchEmail').value;

	try {
		const response = await axios.get(`/api/v1/users/searchByEmail?email=${searchEmail}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`
			}
		});

		const users = response.data.users;
		if (!users || users.length === 0) {
			showAlert('No se encontraron usuarios con ese correo.', 'danger');
			return;
		}
		
		console.log(response.data)
		
		const usersList = document.getElementById('usersList');
		usersList.innerHTML = '';

		users.forEach(user => {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${user.nombre}</td>
				<td>${user.apellido}</td>
				<td>${user.email}</td>
				<td>${user.nombre_rol}</td>
			`;
			usersList.appendChild(row);
		});
	} catch (error) {
		const errorMsg = error.response?.data?.msg || 'Error al realizar la búsqueda.';
        showAlert(errorMsg, 'danger');
		console.log('Error al buscar usuarios:', error);
	}
});

/**
*
success para éxito.
danger para errores.
warning para advertencias.
info para información.
*
*/
function showAlert(message, type, timeout = 3000) {
	const alertContainer = document.getElementById('alertContainer');
	const alert = `
		<div class="alert alert-${type} alert-dismissible fade show" role="alert">
			${message}
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>`;
	alertContainer.innerHTML = alert;

	setTimeout(() => {
		const alertElement = document.querySelector('.alert');
		if (alertElement) {
			alertElement.remove();
		}
	}, timeout);
}

const logoutButton = document.querySelector('#logout');

logoutButton.addEventListener('click', () => {
	// Elimina el token almacenado en el navegador
	localStorage.removeItem('token');
	// Redirige al usuario a la página de inicio de sesión
	window.location.href = "/login";
});

//from para actualizar datos
document.getElementById('usersList').addEventListener('click', (event) => {
	if (event.target.tagName === 'TD') {
		const row = event.target.parentNode;
		const cells = row.getElementsByTagName('td');

		// Rellenar los campos del formulario con los datos actuales
		document.getElementById('editNombre').value = cells[0].innerText;
		document.getElementById('editApellido').value = cells[1].innerText;
		document.getElementById('editEmail').value = cells[2].innerText;

		// Obtener el rol correspondiente
		const roles = {
			"cliente": 1,
			"superadmin": 2,
			"administrativo": 3,
			"vendedor": 4,
			"mantenimiento": 5
		};
		
		const rolTexto = cells[3].innerText.trim();
		document.getElementById('editRol').value = roles[rolTexto] || "";

		// Mostrar el formulario
		const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
		modal.show();
	}
});

document.getElementById('cancelEdit').addEventListener('click', () => {
	document.getElementById('editUserModal').style.display = 'none';
});

document.getElementById('editUserForm').addEventListener('submit', async (event) => {
	event.preventDefault();

	const nombre = document.getElementById('editNombre').value;
	const apellido = document.getElementById('editApellido').value;
	const email = document.getElementById('editEmail').value;
	const id_rol = document.getElementById('editRol').value;

	try {
		const response = await axios.put(`/api/v1/users/updateUser`, {
			nombre,
			apellido,
			email,
			id_rol
		}, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`
			}
		});

		// Ocultar el modal
		const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
		modal.hide();

		// Recargar la lista de usuarios
		showAlert('Usuario actualizado correctamente.', 'success');
		getAllUsers();
	} catch (error) {
		const errorMsg = error.response?.data?.msg || 'Error al actualizar el usuario.';
        showAlert(errorMsg, 'danger');
		console.error('Error al actualizar el usuario:', error);
	}
});

document.getElementById('btnDeleteUser').addEventListener('click', async (event) => {
    
	const email = document.getElementById('editEmail').value;
	//console.log('Email recibido:', email);

    if (!confirm(`¿Estás seguro de que deseas eliminar el usuario con correo ${email}?`)) {
        return; // Cancelar si el usuario no confirma
    }

    try {
        const response = await axios.delete(`/api/v1/users/deleteByEmail?email=${email}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        showAlert(response.data.msg, 'success');
        document.getElementById('createUserForm').reset();
		// Ocultar el modal
		const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
		modal.hide();

		showAlert('Usuario eliminado correctamente.', 'success');
        getAllUsers(); // Recargar la lista de usuarios
    } catch (error) {
        const errorMsg = error.response?.data?.msg || 'Error al eliminar el usuario';
        showAlert(errorMsg, 'danger');
		
		if (errorMsg.includes('No puedes eliminar tu propia cuenta')) {
            // Deshabilitar el botón de eliminación si no se puede eliminar la propia cuenta
            document.getElementById('btnDeleteUser').disabled = true;
        }
    }
});
