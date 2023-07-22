import pool from "../database/database.js";

/**
 * gets a single user by id
 * @param id
 * @returns {Promise<*>}
 *
 * @author Aaron Will Djaba
 */
export const getUser = async (id) => {
    const [row] = await pool.query
    (
        `SELECT *
         FROM users
         WHERE user_id = ?`, [id]
    )
    return row
}