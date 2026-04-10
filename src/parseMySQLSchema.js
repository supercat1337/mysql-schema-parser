// @ts-check

import { MySQLDatabase } from './MySQLDatabase.js';

/**
 * Parses a MySQL schema definition into a structured representation.
 * @param {ColumnMetadataRaw[]} schema - MySQL schema metadata array.
 * @returns {MySQLDatabase} Structured representation of the database.
 * @throws {Error} If schema is not an array or empty.
 */
export function parseMySQLSchema(schema) {
    if (!Array.isArray(schema)) throw new Error('Schema must be an array');
    if (schema.length === 0) throw new Error('Schema must not be empty');

    const databaseName = schema[0].TABLE_SCHEMA;
    return new MySQLDatabase(databaseName, schema);
}
