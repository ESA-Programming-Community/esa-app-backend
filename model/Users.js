import pool from "../database/database.js";


export const getUser = async (id) => {
    const [row] = await pool.query(`
        SELECT *
        FROM users
        WHERE user_id = ${id}
    `)
    return row
}