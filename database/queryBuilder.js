// queryBuilder.js
import pool from "./database.js";

// function query(sql, values) {
//     return new Promise((resolve, reject) => {
//         pool.query(sql, values, (err, results) => {
//             if (err) return reject(err);
//             resolve(results);
//         });
//     });
// }

async function query(sql, values) {
    return await pool.query(sql, values)
}


/**
 * Query Builder Class.
 * Builds query using common sql keywords as methods
 * @author Aaron WIll Djaba
 */
class QueryBuilder {
    constructor() {
        /**
         * 
         * @type {string}
         */
        this.columns = '*';

        /**
         * 
         * @type {string}
         */
        this.table = '';

        /**
         * 
         * @type {string}
         */

        /**
         * 
         * @type {string}
         */
        this.whereClause = '';
        
        /**
         * 
         * @type {*[]}
         */
        this.whereValues = [];
        
        /**
         * 
         * @type {string}
         */
        this.limitValue = '';
        
        /**
         * 
         * @type {string}
         */
        this.orderByValue = '';
        
        /**
         * 
         * @type {string}
         */
        this.unionQuery = '';
        
        /**
         * 
         * @type {string}
         */
        this.unionAllQuery = '';

        /**
         *
         * @type {*[]}
         */
        this.insertBatchData = [];
        
        /**
         * 
         * @type {string}
         */
        this.maxColumn = '';
        
        /**
         * 
         * @type {string}
         */
        this.existsQuery = '';
        
        /**
         * 
         * @type {string}
         */
        this.notExistsQuery = '';
    }

    /**
     * Select keyword. Specifies fields or columns to select from
     * and defaults to * if not specified
     * @param columns {string | string[]} columns to select
     * @returns {QueryBuilder}
     * @author Aaron Will Djaba
     */
    select(columns = '*') {
        this.columns = columns.toString().trim();
        console.log(this.columns);
        return this;
    }

    /**
     * From keyword. Specifies table to operate on.
     * @param table
     * @returns {QueryBuilder}
     */
    from(table) {
        this.table = table;
        return this;
    }

    /**
     * In keyword. Specifies table to operate on.
     * @param table
     * @returns {QueryBuilder}
     */
    in(table) {
        this.table = table;
        return this;
    }

    // AS method
    as(alias) {
        this.columns = `${this.columns} AS ${alias}`;
        return this;
    }

    // WHERE method
    where(conditions) {
        if (conditions) {
            if (Array.isArray(conditions)) {
                const conditionStrings = conditions.map(_condition => Object.keys(_condition).map(key => `${key} = ?`).join(' AND '));
                this.whereClause = 'WHERE ' + conditionStrings.join(' OR ');
                this.whereValues = conditions.flatMap(_condition => Object.values(_condition));
            } else {
                this.whereClause = 'WHERE ' + Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
                this.whereValues = Object.values(conditions);
            }
        }
        
        return this;
    }

    // LIMIT method
    limit(limit) {
        this.limitValue = `LIMIT ${limit}`;
        return this;
    }

    // UNION method
    union(query) {
        this.unionQuery = `UNION (${query})`;
        return this;
    }

    // UNION ALL method
    unionAll(query) {
        this.unionAllQuery = `UNION ALL (${query})`;
        return this;
    }

    /**
     * Insert keyword, inserts data into the database
     * @param data {Object}
     * @returns {Promise<*>}
     * @author Aaron Will Djaba
     */
    insert(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map(() => '?').join(', ');
        const sql = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders})`;

        return query(sql, values);
    }

    /**
     * Inserts batch data into database
     * @param data {Object[]}
     * @returns {Promise<*>}
     * @author Aaron Will Djaba
     */
    insertBatch(data) {
        const keys = Object.keys(data[0]);
        const values = data.map(item => Object.values(item));
        const placeholders = values.map(() => `(${keys.map(() => '?').join(', ')})`).join(', ');
        const flatValues = values.reduce((acc, val) => [...acc, ...val], []);
        const sql = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES ${placeholders}`;

        return query(sql, flatValues);
    }

    // UPDATE method
    update(data) {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const setValues = Object.values(data);
        const sql = `UPDATE ${this.table} SET ${setClause} ${this.whereClause}`;
        return query(sql, [...setValues, ...this.whereValues]);
    }

    // DELETE method
    delete() {
        const whereClause = Object.keys(this.whereClause).map(key => `${key} = ?`).join(' AND ');
        const whereValues = Object.values(this.whereClause);
        const sql = `DELETE FROM ${this.table} WHERE ${this.whereClause}`;

        return query(sql, whereValues);
    }

    // DELETE method for batch deletes
    deleteBatch(table, whereConditionsArray) {
        const deletePromises = whereConditionsArray.map(whereConditions => this.delete(table, whereConditions));
        return Promise.all(deletePromises);
    }

    // MAX method
    max(column) {
        this.maxColumn = `MAX(${column})`;
        return this;
    }

    // FIRST method
    first() {
        this.limitValue = 'LIMIT 1';
        return this;
    }

    // LAST method
    last() {
        this.orderByValue = 'ORDER BY id DESC';
        this.limitValue = 'LIMIT 1';
        return this;
    }

    // EXISTS method
    exists(subQuery) {
        this.existsQuery = `EXISTS (${subQuery})`;
        return this;
    }

    // NOT EXISTS method
    notExists(subQuery) {
        this.notExistsQuery = `NOT EXISTS (${subQuery})`;
        return this;
    }

    // ORDER BY method
    orderBy(column, order = 'ASC') {
        this.orderByValue = `ORDER BY ${column} ${order}`;
        return this;
    }

    // Build and execute the query
    async get() {
        const sql = `SELECT ${this.columns} FROM ${this.table} ${this.whereClause} ${this.orderByValue} ${this.limitValue} ${this.unionQuery} ${this.unionAllQuery}`;
        return await query(sql, this.whereValues);
    }

    // Build and execute the INSERT INTO query for batch inserts
    async insertBatchGetIds() {
        const keys = Object.keys(this.insertBatchData[0]);
        const sql = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES ?`;
        const values = this.insertBatchData.map((item) => Object.values(item));
        const result = await query(sql, [values]);
        return result.insertId;
    }

    // Build and execute the MAX query
    async maxGet() {
        const sql = `SELECT ${this.maxColumn} FROM ${this.table}`;
        return await query(sql);
    }

    // Build and execute the EXISTS query
    async existsGet() {
        const sql = `SELECT ${this.existsQuery}`;
        return await query(sql);
    }

    // Build and execute the NOT EXISTS query
    async notExistsGet() {
        const sql = `SELECT ${this.notExistsQuery}`;
        return await query(sql);
    }
}

export default QueryBuilder;
