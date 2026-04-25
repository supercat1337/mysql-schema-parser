// @ts-check

import { MySQLTable } from './MySQLTable.js';

export class MySQLDatabase {
    /** @type {string} */
    databaseName;
    /** @type {Map<string, MySQLTable>} */
    tables = new Map();

    /**
     * Creates an instance of MySQLDatabase.
     * @param {string} databaseName - The name of the database.
     * @param {ColumnMetadataRaw[]} [cols=[]] - Array of raw column metadata.
     */
    constructor(databaseName, cols = []) {
        this.databaseName = databaseName;

        // Verify all columns belong to this database
        for (const col of cols) {
            if (col.TABLE_SCHEMA !== databaseName) {
                throw new Error(
                    `Column ${col.COLUMN_NAME} belongs to schema ${col.TABLE_SCHEMA}, expected ${databaseName}`
                );
            }
        }

        const tableNames = new Set(cols.map(col => col.TABLE_NAME));

        for (const tableName of tableNames) {
            const tableCols = cols.filter(col => col.TABLE_NAME === tableName);
            if (tableCols.length === 0) continue;
            const table = new MySQLTable(tableName, tableCols);
            this.addTable(table);
        }
    }

    /**
     * Load index statistics for all tables in the database.
     * @param {IndexStatisticsRaw[]} indexesStats - Array from INFORMATION_SCHEMA.STATISTICS
     */
    loadIndexStatistics(indexesStats) {
        for (const idxStat of indexesStats) {
            const table = this.tables.get(idxStat.TABLE_NAME);
            if (table) {
                table.addIndexStatistics(idxStat);
            }
        }
    }

    /**
     * Adds a table to the database.
     * @param {MySQLTable} table - The table to add.
     */
    addTable(table) {
        this.tables.set(table.tableName, table);
    }

    /**
     * Get all table names in the database
     * @returns {string[]} An array of table names
     */
    getTableNames() {
        return Array.from(this.tables.keys());
    }

    /**
     * Returns JSON representation of the whole database
     * @returns {Object}
     */
    toJSON() {
        return {
            databaseName: this.databaseName,
            tables: Object.fromEntries(
                Array.from(this.tables.entries()).map(([name, table]) => [name, table.toJSON()])
            ),
        };
    }
}
