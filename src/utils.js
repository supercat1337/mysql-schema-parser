// @ts-check

import { MySQLTableColumn } from './MySQLTableColumn.js';

/**
 * Validate a raw column metadata object against the expected structure and types.
 * Throws an error if the object is invalid.
 * @param {ColumnMetadataRaw} obj Raw column metadata object
 * @returns {true} If the object is valid
 * @throws {Error} If the object is invalid
 */
export function assertColumnMetadataRaw(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Input must be a non-null object');
    }

    /**
     * @type {Record<keyof ColumnMetadataRaw, (val: any) => boolean>}
     */
    const validators = {
        TABLE_CATALOG: val => typeof val === 'string',
        TABLE_SCHEMA: val => typeof val === 'string',
        TABLE_NAME: val => typeof val === 'string',
        COLUMN_NAME: val => typeof val === 'string',
        ORDINAL_POSITION: val => typeof val === 'number',
        COLUMN_DEFAULT: val => val === null || typeof val === 'string',
        IS_NULLABLE: val => val === 'YES' || val === 'NO',
        DATA_TYPE: val => typeof val === 'string',
        CHARACTER_MAXIMUM_LENGTH: val => val === null || typeof val === 'number',
        CHARACTER_OCTET_LENGTH: val => val === null || typeof val === 'number',
        NUMERIC_PRECISION: val => val === null || typeof val === 'number',
        NUMERIC_SCALE: val => val === null || typeof val === 'number',
        DATETIME_PRECISION: val => val === null || typeof val === 'number',
        CHARACTER_SET_NAME: val => val === null || typeof val === 'string',
        COLLATION_NAME: val => val === null || typeof val === 'string',
        COLUMN_TYPE: val => typeof val === 'string',
        COLUMN_KEY: val => ['PRI', 'UNI', 'MUL', ''].includes(val),
        EXTRA: val => typeof val === 'string',
        PRIVILEGES: val => typeof val === 'string',
        COLUMN_COMMENT: val => typeof val === 'string',
        IS_GENERATED: val => val === 'NEVER' || val === 'ALWAYS' || typeof val === 'string',
        GENERATION_EXPRESSION: val => val === null || typeof val === 'string',
    };

    for (const [key, validator] of Object.entries(validators)) {
        // @ts-ignore
        if (key in obj && !validator(obj[key])) {
            // @ts-ignore
            throw new Error(`Invalid ${key}: value ${obj[key]} does not match expected type`);
        }
    }

    return true;
}

/**
 * Escape a string for safe use in SQL (single quotes doubled).
 * @param {string} str Input string
 * @returns {string} Escaped string
 */
export function escapeString(str) {
    return str.replace(/'/g, "''");
}

/**
 * Format a column default value for SQL query.
 * @param {MySQLTableColumn} column Column instance
 * @returns {string} Formatted default value
 */
export function formatDefaultValue(column) {
    if (column.columnDefault === null) return 'NULL';

    if (['char', 'varchar', 'text', 'enum', 'set'].includes(column.dataType.toLowerCase())) {
        return `'${escapeString(column.columnDefault)}'`;
    }

    if (
        ['timestamp', 'datetime'].includes(column.dataType.toLowerCase()) &&
        column.columnDefault.toUpperCase() === 'CURRENT_TIMESTAMP'
    ) {
        return 'CURRENT_TIMESTAMP';
    }

    if (['blob', 'binary'].includes(column.dataType.toLowerCase())) {
        return `x'${column.columnDefault}'`;
    }

    return column.columnDefault;
}
