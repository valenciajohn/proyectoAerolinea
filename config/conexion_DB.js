import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

const connectionString = process.env.DATABASE_URL

// Configuración del Pool con SSL habilitado
export const db = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false // Asegura que funcione con certificados autofirmados
    },
    allowExitOnIdle: true
})

try {
    // Probar la conexión
    await db.query('SELECT NOW()')
    console.log('DATABASE connected')
} catch (error) {
    console.error('Error connecting to the database:', error)
}
