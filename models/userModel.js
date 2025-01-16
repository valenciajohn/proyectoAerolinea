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
        SELECT * FROM usuarios
        WHERE email = $1
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

const findAll = async () => {
    const query = {
        text: 'SELECT * FROM usuarios'		
    }
    const { rows } = await db.query(query)
    return rows
}

export const UserModel = {
    create,
    findOneByEmail,
	findOneByUserName,
	findAll
}