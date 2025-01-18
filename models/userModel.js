import { db } from '../config/conexion_DB.js'

//Crear usuarios
const create = async ({ nombre, apellido, email, contrasena, fecha_nacimiento, genero, celular, pais_nacimiento, usuario }) => {
    const query = {
        text: `
        INSERT INTO usuarios ( nombre, apellido, email, contrasena, fecha_nacimiento, genero, celular, pais_nacimiento, usuario)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING email, usuario
        `,
        values: [nombre, apellido, email, contrasena, fecha_nacimiento, genero, celular, pais_nacimiento, usuario]
    }

    const { rows } = await db.query(query)
    return rows[0]
}

//Buscar usuarios por email (unico)
const findOneByEmail = async (email) => {
    const query = {
        text: `
         SELECT * FROM usuarios u
         INNER JOIN roles r ON u.id_rol = r.id_rol
         WHERE u.email = $1
        `,
        values: [email]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

//Buscar usuarios por nombre de usuario (unico)
const findOneByUserName = async (usuario) => {
    const query = {
        text: 'SELECT * FROM usuarios WHERE usuario = $1',
        values: [usuario]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

// Traer todos los usuarios con sus roles
const findAll = async () => {
    const query = {
        text: `
        SELECT u.nombre, u.apellido, u.email, r.nombre_rol 
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        `
    };
    const { rows } = await db.query(query);
    return rows;
};

//Actualizar usuarios por email
const updateUser = async ({ nombre, apellido, email, id_rol }) => {
    const query = {
        text: `
            UPDATE usuarios
            SET nombre = $1, apellido = $2, email = $3, id_rol = $4
            WHERE email = $3
        `,
        values: [nombre, apellido, email, id_rol]
    };
     const { rowCount, rows } = await db.query(query);
	 if (rowCount === 0) {
        throw new Error("No se pudo actualizar el usuario.");
    }
    console.log("Consulta ejecutada:", query);
	return rows[0]; // Devuelve el usuario actualizado
};

// Eliminar usuario por email
const deleteByEmail = async (email) => {
    const query = {
        text: `DELETE FROM usuarios WHERE email = $1`,
        values: [email],
    };
    const { rowCount } = await db.query(query);

    if (rowCount === 0) {
        throw new Error("Usuario no encontrado o ya eliminado.");
    }

    return { msg: "Usuario eliminado exitosamente." };
};

export const UserModel = {
    create,
    findOneByEmail,
	findOneByUserName,
	findAll,
	updateUser,
	deleteByEmail
}