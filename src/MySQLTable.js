// @ts-check

import { MySQLTableColumn } from './MySQLTableColumn.js';
import { escapeString, formatDefaultValue } from './utils.js';

export class MySQLTable {
    /** @type {string} */
    tableName;
    /** @type {Map<string, MySQLTableColumn>} */
    columns = new Map();

    /**
     * Creates MySQLTable instance from table name and columns data
     * @param {string} tableName Table name
     * @param {ColumnMetadataRaw[]} columns Columns data in snake_case format
     */
    constructor(tableName, columns = []) {
        this.tableName = tableName;

        for (let i = 0; i < columns.length; i++) {
            let column = new MySQLTableColumn();

            if (columns[i].TABLE_NAME !== tableName) {
                continue;
            }

            column.importFromRawData(columns[i]);
            this.columns.set(columns[i].COLUMN_NAME, column);
        }
    }

    /**
     * Adds a column to the table
     * @param {MySQLTableColumn} column The column to add
     */
    addColumn(column) {
        this.columns.set(column.columnName, column);
    }

    /**
     * Get all columns in table, sorted by ordinal position
     * @returns {MySQLTableColumn[]}
     */
    getColumns() {
        return Array.from(this.columns.values()).sort(
            (a, b) => a.ordinalPosition - b.ordinalPosition
        );
    }

    /**
     * Get column by name
     * @param {string} columnName
     * @returns {MySQLTableColumn|null}
     */
    getColumn(columnName) {
        return this.columns.get(columnName) || null;
    }

    /**
     * Generates CREATE TABLE SQL statement based on table metadata
     * @param {Object} [options] Additional options
     * @param {string} [options.engine] Storage engine (e.g. 'InnoDB')
     * @param {string} [options.charset] Default charset (e.g. 'utf8mb4')
     * @param {string} [options.collation] Default collation (e.g. 'utf8mb4_unicode_ci')
     * @param {string} [options.comment] Table comment
     * @returns {string} CREATE TABLE SQL query
     */
    generateCreateTableQuery(options = {}) {
        const columns = this.getColumns();
        if (columns.length === 0) {
            throw new Error(`Table ${this.tableName} has no columns`);
        }

        const columnDefinitions = [];
        const primaryKeys = [];
        const uniqueKeys = [];
        const indexes = [];

        for (const column of columns) {
            let definition = column.getColumnDefinition();

            // DEFAULT
            if (column.columnDefault !== null) {
                const defaultValue = formatDefaultValue(column);
                definition += ` DEFAULT ${defaultValue}`;
            }

            // COMMENT
            if (column.columnComment) {
                definition += ` COMMENT '${escapeString(column.columnComment)}'`;
            }

            columnDefinitions.push(definition);

            // Indexes
            if (column.isPrimaryKey()) {
                primaryKeys.push(`\`${column.columnName}\``);
            } else if (column.columnKey === 'UNI') {
                uniqueKeys.push(`\`${column.columnName}\``);
            } else if (column.columnKey === 'MUL') {
                indexes.push(`\`${column.columnName}\``);
            }
        }

        if (primaryKeys.length > 0) {
            columnDefinitions.push(`PRIMARY KEY (${primaryKeys.join(', ')})`);
        }

        for (const uniqueCol of uniqueKeys) {
            const colNameClean = uniqueCol.replace(/`/g, '');
            const idxName = `${this.tableName}_${colNameClean}_unique`.slice(0, 64);
            columnDefinitions.push(`UNIQUE KEY \`${idxName}\` (${uniqueCol})`);
        }

        for (const idxCol of indexes) {
            columnDefinitions.push(`KEY ${idxCol}`);
        }

        let query = `CREATE TABLE \`${this.tableName}\` (\n  `;
        query += columnDefinitions.join(',\n  ');
        query += '\n)';

        if (options.engine) {
            query += ` ENGINE=${options.engine}`;
        }

        const charset = options.charset || columns[0].characterSetName || 'utf8mb4';
        const collation = options.collation || columns[0].collationName || 'utf8mb4_unicode_ci';
        query += ` DEFAULT CHARSET=${charset} COLLATE=${collation}`;

        if (options.comment) {
            query += ` COMMENT='${escapeString(options.comment)}'`;
        }

        return query + ';';
    }

    /**
     * Gets an array of column names in the table
     * @returns {string[]}
     */
    getColumnNames() {
        return Array.from(this.columns.keys());
    }

    /**
     * Returns JSON representation of the table
     * @returns {Object}
     */
    toJSON() {
        return {
            tableName: this.tableName,
            columns: Object.fromEntries(
                Array.from(this.columns.entries()).map(([name, col]) => [name, col.toJSON()])
            ),
        };
    }
}
