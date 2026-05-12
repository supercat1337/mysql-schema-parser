// @ts-check

import { MySQLTableColumn } from './MySQLTableColumn.js';
import { escapeString, formatDefaultValue } from './utils.js';

export class MySQLTable {
    /** @type {string} */
    tableName;
    /** @type {Map<string, MySQLTableColumn>} */
    columns = new Map();
    /** @type {Map<string, IndexStatistics[]>} */
    indexStats = new Map();

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
     * Adds index statistics for this table.
     * @param {IndexStatisticsRaw} idxRaw
     */
    addIndexStatistics(idxRaw) {
        const idxName = idxRaw.INDEX_NAME;
        if (!this.indexStats.has(idxName)) {
            this.indexStats.set(idxName, []);
        }
        const columns = this.indexStats.get(idxName);
        if (!columns) return;

        /** @type {null|"ASC"|"DESC"} */
        let collation = null;
        if (idxRaw.COLLATION === 'A') collation = 'ASC';
        else if (idxRaw.COLLATION === 'D') collation = 'DESC';

        const newStat = {
            tableSchema: idxRaw.TABLE_SCHEMA,
            tableName: idxRaw.TABLE_NAME,
            indexName: idxName,
            columnName: idxRaw.COLUMN_NAME,
            cardinality: idxRaw.CARDINALITY,
            nonUnique: idxRaw.NON_UNIQUE === 1,
            seqInIndex: idxRaw.SEQ_IN_INDEX,
            subPart: idxRaw.SUB_PART,
            nullable: idxRaw.NULLABLE === 'YES',
            indexType: idxRaw.INDEX_TYPE,
            collation: collation,
        };
        columns.push(newStat);
        columns.sort((a, b) => a.seqInIndex - b.seqInIndex);
    }

    /**
     * Returns all indexes of the table.
     * @returns {Map<string, IndexStatistics[]>}
     */
    getIndexes() {
        return this.indexStats;
    }

    /**
     * Returns index by name.
     * @param {string} indexName
     * @returns {IndexStatistics[] | null}
     */
    getIndex(indexName) {
        return this.indexStats.get(indexName) || null;
    }

    /**
     * Returns cardinality of the index (usually for the first column).
     * @param {string} indexName
     * @returns {number | null}
     */
    getIndexCardinality(indexName) {
        const idx = this.indexStats.get(indexName);
        if (!idx || idx.length === 0) return null;
        return idx[0].cardinality;
    }

    /**
     * Returns the column names of the primary key, or null if no primary key exists.
     * For composite primary keys, returns all columns in order.
     * @returns {string[] | null}
     */
    getPrimaryKey() {
        const useIndexStats = this.indexStats.size > 0;
        if (useIndexStats) {
            const primary = this.indexStats.get('PRIMARY');
            if (!primary || primary.length === 0) return null;
            return primary.map(col => col.columnName);
        }

        /** @type {string[]} */
        let primaryKeys = [];
        let columns = this.getColumns();
        for (const column of columns) {
            if (column.isPrimaryKey()) {
                primaryKeys.push(column.columnName);
            }
        }

        if (primaryKeys.length === 0) return null;
        return primaryKeys;
    }

    /**
     * Generates CREATE TABLE SQL statement based on table metadata.
     * Uses index statistics if available, otherwise falls back to columnKey.
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

        // If index statistics are available, use them for PRIMARY KEY and indexes
        const useIndexStats = this.indexStats.size > 0;

        if (useIndexStats) {
            for (const [idxName, idxColumns] of this.indexStats.entries()) {
                const colNames = idxColumns.map(col => `\`${col.columnName}\``);
                const isNonUnique = idxColumns[0].nonUnique;
                const idxType = idxColumns[0].indexType.toUpperCase();

                if (idxName === 'PRIMARY') {
                    primaryKeys.push(...colNames);
                } else if (!isNonUnique) {
                    // UNIQUE KEY
                    uniqueKeys.push({ name: idxName, columns: colNames });
                } else {
                    // Ordinary index, possibly with type (FULLTEXT, SPATIAL)
                    indexes.push({ name: idxName, columns: colNames, type: idxType });
                }
            }
        }

        // Build column definitions (always from columns metadata)
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

            // Fallback: if no index stats, use columnKey (backward compatibility)
            if (!useIndexStats) {
                if (column.isPrimaryKey()) {
                    primaryKeys.push(`\`${column.columnName}\``);
                } else if (column.columnKey === 'UNI') {
                    uniqueKeys.push({
                        name: `${this.tableName}_${column.columnName}_unique`,
                        columns: [`\`${column.columnName}\``],
                    });
                } else if (column.columnKey === 'MUL') {
                    indexes.push({
                        name: `idx_${column.columnName}`,
                        columns: [`\`${column.columnName}\``],
                        type: 'BTREE',
                    });
                }
            }
        }

        // Add PRIMARY KEY
        if (primaryKeys.length > 0) {
            columnDefinitions.push(`PRIMARY KEY (${primaryKeys.join(', ')})`);
        }

        // Add UNIQUE keys
        for (const uk of uniqueKeys) {
            const idxName = uk.name.slice(0, 64);
            columnDefinitions.push(`UNIQUE KEY \`${idxName}\` (${uk.columns.join(', ')})`);
        }

        // Add indexes (FULLTEXT, SPATIAL, or regular)
        for (const idx of indexes) {
            const idxName = idx.name.slice(0, 64);
            if (idx.type === 'FULLTEXT') {
                columnDefinitions.push(`FULLTEXT KEY \`${idxName}\` (${idx.columns.join(', ')})`);
            } else if (idx.type === 'SPATIAL') {
                columnDefinitions.push(`SPATIAL KEY \`${idxName}\` (${idx.columns.join(', ')})`);
            } else {
                columnDefinitions.push(`KEY \`${idxName}\` (${idx.columns.join(', ')})`);
            }
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
