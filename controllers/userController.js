import bcryptjs from 'bcryptjs'
import jwt from "jsonwebtoken"
import { UserModel } from '../models/userModel.js'
import validator from 'validator'; // Utilizamos la librería validator

// /api/v1/users/register
const register = async (req, res) => {
    try {
        const { nombre, apellido, email, contrasena, fecha_nacimiento, genero, celular, pais_nacimiento, usuario } = req.body
	    console.log(req.body)
		
		if (!nombre || !apellido || !email || !contrasena || !fecha_nacimiento || !genero || !celular || !pais_nacimiento || !usuario)  {
            return res.status(400).json({ ok: false, msg: "Todos los campos son requeridos." })
        }
		
		// Validar el email
		if (!validator.isEmail(email)) {
			return res.status(400).json({ok: false, msg: 'El email ingresado no es válido.'});	
		}
		
		// Validar que el email o el nombre de usuario no existan
        const user = await UserModel.findOneByEmail(email)
        if (user) {

            return res.status(409).json({ ok: false, msg: "El email ya está registrado." })
        }
		
		const userName = await UserModel.findOneByUserName(usuario)
        if (userName) {
            return res.status(409).json({ ok: false, msg: "El nombre de usuario ya existe" })
        }
		
		//// Validar que la contraseña tenga al menos una letra mayúscula, una minúscula, un número y un símbolo especial
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		if (!passwordRegex.test(contrasena)) {
			return res.status(400).json({ ok: false, msg: 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un símbolo especial.'});
		}
		
		// Validar que el celular solo contenga números
		if (!/^\d+$/.test(celular)) {
			return res.status(400).json({ ok: false, msg: 'El número de celular debe contener solo números.' });
		}
		
		// Hash de la contraseña
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(contrasena, salt)

		const newUser = await UserModel.create({ nombre, apellido, email, contrasena: hashedPassword, fecha_nacimiento, genero, celular, pais_nacimiento, usuario })
		
		const token = jwt.sign({ email: newUser.email },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )
		
		return res.status(201).json({ ok: true, msg: "Usuario registrado con token " + token })
	}catch (error) {
        console.log(error)
        return res.status(500).json({ ok: false, msg: 'Error de servidor' })
    }
}

// /api/v1/users/login
const login = async (req, res) => {
    try {
        const { email, contrasena } = req.body
	    console.log(req.body)
		
		// Validar que los campos no estén vacíos
		if (!email || !contrasena) {
			return res.status(400).json({ ok: false, msg: "Todos los campos son requeridos." });
		}

		// Validar que el email tenga formato válido
		if (!validator.isEmail(email)) {
			return res.status(400).json({ ok: false, msg: 'El email ingresado no es válido.' });
		}
		
		// Buscar el usuario por el email
		const user = await UserModel.findOneByEmail(email)
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }
		
		// Comparar la contraseña proporcionada con la almacenada
        const isMatch = await bcryptjs.compare(contrasena, user.contrasena)
        if (!isMatch) {
            return res.status(401).json({ msg: "Credenciales inválidas" });
        }
		
		const token = jwt.sign({ email: user.email},
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )
		// Si todo es correcto, generar una respuesta de éxito
		return res.status(201).json({ ok: true, msg: token })
	}catch (error) {
        console.log(error)
        return res.status(500).json({ ok: false, msg: 'Error al intentar iniciar sesión' })
    }
}	

// /api/v1/users/profile
const profile = async (req, res) => {
    try {
		const user = await UserModel.findOneByEmail(req.email)
        return res.json({ ok: true, msg: user})
		
    } catch (error) {
        console.log(error)
        return res.status(500).json({ ok: false, msg: 'Error derl servidor' })
    }
}

//Traer todos los usuarios al admin
const findAll = async (req, res) => {
    try {
        const users = await UserModel.findAll()

        return res.json({ ok: true, msg: users })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ ok: false, msg: 'Error derl servidor' })
    }
}


export const UserController = {
    register,
	login,
	profile,
	findAll
}