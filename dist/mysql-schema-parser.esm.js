// @ts-check


/**
 * Validate a raw column metadata object against the expected structure and types.
 * Throws an error if the object is invalid.
 * @param {ColumnMetadataRaw} obj Raw column metadata object
 * @returns {true} If the object is valid
 * @throws {Error} If the object is invalid
 */
function assertColumnMetadataRaw(obj) {
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
 * Validate an index statistics object.
 * @param {IndexStatisticsRaw} obj
 * @returns {true}
 * @throws {Error}
 */
function assertIndexStatisticsRaw(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('IndexStatisticsRaw must be a non-null object');
    }

    /**
     * @type {Record<keyof IndexStatisticsRaw, (val: any) => boolean>}
     */
    const validators = {
        TABLE_SCHEMA: v => typeof v === 'string',
        TABLE_NAME: v => typeof v === 'string',
        INDEX_NAME: v => typeof v === 'string',
        COLUMN_NAME: v => typeof v === 'string',
        CARDINALITY: v => v === null || typeof v === 'number',
        NON_UNIQUE: v => v === 0 || v === 1,
        SEQ_IN_INDEX: v => typeof v === 'number',
        SUB_PART: v => v === null || typeof v === 'number',
        NULLABLE: v => v === 'YES' || v === 'NO',
        INDEX_TYPE: v => typeof v === 'string',
        COLLATION: v => v === 'A' || v === 'D' || v === null,
    };
    for (const [key, validator] of Object.entries(validators)) {
        // @ts-ignore
        if (key in obj && !validator(obj[key])) {
            // @ts-ignore
            throw new Error(`Invalid ${key}: ${obj[key]}`);
        }
    }
    return true;
}

/**
 * Escape a string for safe use in SQL (single quotes doubled).
 * @param {string} str Input string
 * @returns {string} Escaped string
 */
function escapeString(str) {
    return str.replace(/'/g, "''");
}

/**
 * Format a column default value for SQL query.
 * @param {MySQLTableColumn} column Column instance
 * @returns {string} Formatted default value
 */
function formatDefaultValue(column) {
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

// @ts-check


/**
 * Class representing normalized database column metadata
 */
class MySQLTableColumn {
    /** @type {string} */
    tableCatalog;
    /** @type {string} */
    tableSchema;
    /** @type {string} */
    tableName;
    /** @type {string} */
    columnName;
    /** @type {number} */
    ordinalPosition;
    /** @type {string|null} */
    columnDefault;
    /** @type {'YES'|'NO'} */
    isNullable;
    /** @type {string} */
    dataType;
    /** @type {number|null} */
    characterMaximumLength;
    /** @type {number|null} */
    characterOctetLength;
    /** @type {number|null} */
    numericPrecision;
    /** @type {number|null} */
    numericScale;
    /** @type {number|null} */
    datetimePrecision;
    /** @type {string|null} */
    characterSetName;
    /** @type {string|null} */
    collationName;
    /** @type {string} */
    columnType;
    /** @type {'PRI'|'UNI'|'MUL'|''} */
    columnKey;
    /** @type {string} */
    extra;
    /** @type {string} */
    privileges;
    /** @type {string} */
    columnComment;
    /** @type {'NEVER'|'ALWAYS'|string} */
    isGenerated;
    /** @type {string|null} */
    generationExpression;

    /**
     * Creates an instance of ColumnMetadata from raw data
     * @param {ColumnMetadataParams} [data]
     */
    constructor(data) {
        this.tableCatalog = '';
        this.tableSchema = '';
        this.tableName = '';
        this.columnName = '';
        this.ordinalPosition = 0;
        this.columnDefault = null;
        this.isNullable = 'NO';
        this.dataType = '';
        this.characterMaximumLength = null;
        this.characterOctetLength = null;
        this.numericPrecision = null;
        this.numericScale = null;
        this.datetimePrecision = null;
        this.characterSetName = null;
        this.collationName = null;
        this.columnType = '';
        this.columnKey = '';
        this.extra = '';
        this.privileges = '';
        this.columnComment = '';
        this.isGenerated = 'NEVER';
        this.generationExpression = null;

        if (!data) return;

        this.tableCatalog = data.tableCatalog;
        this.tableSchema = data.tableSchema;
        this.tableName = data.tableName;
        this.columnName = data.columnName;
        this.ordinalPosition = data.ordinalPosition;
        this.columnDefault = data.columnDefault;
        this.isNullable = data.isNullable;
        this.dataType = data.dataType;
        this.characterMaximumLength = data.characterMaximumLength;
        this.characterOctetLength = data.characterOctetLength;
        this.numericPrecision = data.numericPrecision;
        this.numericScale = data.numericScale;
        this.datetimePrecision = data.datetimePrecision;
        this.characterSetName = data.characterSetName;
        this.collationName = data.collationName;
        this.columnType = data.columnType;
        this.columnKey = data.columnKey;
        this.extra = data.extra;
        this.privileges = data.privileges;
        this.columnComment = data.columnComment;
        this.isGenerated = data.isGenerated;
        this.generationExpression = data.generationExpression;
    }

    /**
     * Import raw metadata into this object
     * @param {ColumnMetadataRaw} rawMetadata
     */
    importFromRawData(rawMetadata) {
        assertColumnMetadataRaw(rawMetadata);

        this.tableCatalog = rawMetadata.TABLE_CATALOG;
        this.tableSchema = rawMetadata.TABLE_SCHEMA;
        this.tableName = rawMetadata.TABLE_NAME;
        this.columnName = rawMetadata.COLUMN_NAME;
        this.ordinalPosition = rawMetadata.ORDINAL_POSITION;
        this.columnDefault = rawMetadata.COLUMN_DEFAULT;
        this.isNullable = rawMetadata.IS_NULLABLE;
        this.dataType = rawMetadata.DATA_TYPE;
        this.characterMaximumLength = rawMetadata.CHARACTER_MAXIMUM_LENGTH;
        this.characterOctetLength = rawMetadata.CHARACTER_OCTET_LENGTH;
        this.numericPrecision = rawMetadata.NUMERIC_PRECISION;
        this.numericScale = rawMetadata.NUMERIC_SCALE;
        this.datetimePrecision = rawMetadata.DATETIME_PRECISION;
        this.characterSetName = rawMetadata.CHARACTER_SET_NAME;
        this.collationName = rawMetadata.COLLATION_NAME;
        this.columnType = rawMetadata.COLUMN_TYPE;
        this.columnKey = rawMetadata.COLUMN_KEY;
        this.extra = rawMetadata.EXTRA;
        this.privileges = rawMetadata.PRIVILEGES;
        this.columnComment = rawMetadata.COLUMN_COMMENT;
        this.isGenerated = rawMetadata.IS_GENERATED;
        this.generationExpression = rawMetadata.GENERATION_EXPRESSION;
    }

    /**
     * Check if column is a primary key
     * @returns {boolean}
     */
    isPrimaryKey() {
        return this.columnKey === 'PRI';
    }

    /**
     * Check if column allows NULL values
     * @returns {boolean}
     */
    allowsNull() {
        return this.isNullable === 'YES';
    }

    /**
     * Check if column auto-increments
     * @returns {boolean}
     */
    isAutoIncrement() {
        return this.extra.includes('auto_increment');
    }

    /**
     * Get full column definition as string (without PRIMARY KEY constraint)
     * @returns {string}
     */
    getColumnDefinition() {
        return (
            `${this.columnName} ${this.columnType}` +
            (this.isAutoIncrement() ? ' AUTO_INCREMENT' : '') +
            (this.allowsNull() ? '' : ' NOT NULL')
        );
    }

    /**
     * Get a JSON representation of the column metadata
     * @returns {ColumnMetadataParams} JSON-serializable object with column metadata
     */
    toJSON() {
        return { ...this };
    }

    /**
     * Returns an array of allowed values if column type is enum or set, otherwise null.
     * @returns {string[] | null}
     */
    getEnumValues() {
        const match = this.columnType.match(/^(enum|set)\((.*)\)$/i);
        if (!match) return null;
        // Extract quoted values
        const values = match[2].split(',').map(v => v.trim().slice(1, -1));
        return values;
    }
}

// @ts-check


class MySQLTable {
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
        const primary = this.indexStats.get('PRIMARY');
        if (!primary || primary.length === 0) return null;
        return primary.map(col => col.columnName);
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

// @ts-check


class MySQLDatabase {
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

// @ts-check


/**
 * Parses a MySQL schema definition into a structured representation.
 * @param {ColumnMetadataRaw[]} schema - MySQL schema metadata array.
 * @returns {MySQLDatabase} Structured representation of the database.
 * @throws {Error} If schema is not an array or empty.
 */
function parseMySQLSchema(schema) {
    if (!Array.isArray(schema)) throw new Error('Schema must be an array');
    if (schema.length === 0) throw new Error('Schema must not be empty');

    const databaseName = schema[0].TABLE_SCHEMA;
    return new MySQLDatabase(databaseName, schema);
}

/**
 * Enrich a MySQLDatabase object with index statistics.
 * @param {MySQLDatabase} db - Database object to enrich
 * @param {IndexStatisticsRaw[]} indexes - Array from INFORMATION_SCHEMA.STATISTICS
 */
function enrichWithStatistics(db, indexes) {
    db.loadIndexStatistics(indexes);
}

export { MySQLDatabase, MySQLTable, MySQLTableColumn, assertColumnMetadataRaw, assertIndexStatisticsRaw, enrichWithStatistics, escapeString, formatDefaultValue, parseMySQLSchema };
