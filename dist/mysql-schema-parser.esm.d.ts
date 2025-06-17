/**
 * Database column metadata object describing a table column's structure
 */
export type ColumnMetadataRaw = {
    /**
     * Table catalog (typically 'def' in MySQL)
     */
    TABLE_CATALOG: string;
    /**
     * Database/schema name containing the table
     */
    TABLE_SCHEMA: string;
    /**
     * Name of the table
     */
    TABLE_NAME: string;
    /**
     * Name of the column
     */
    COLUMN_NAME: string;
    /**
     * Column position in table (1-based index)
     */
    ORDINAL_POSITION: number;
    /**
     * Default value for the column
     */
    COLUMN_DEFAULT: string | null;
    /**
     * Whether the column is nullable
     */
    IS_NULLABLE: "YES" | "NO";
    /**
     * Column's data type (e.g., 'int', 'varchar')
     */
    DATA_TYPE: string;
    /**
     * Maximum length for string types (in characters)
     */
    CHARACTER_MAXIMUM_LENGTH: number | null;
    /**
     * Maximum length for string types (in bytes)
     */
    CHARACTER_OCTET_LENGTH: number | null;
    /**
     * Precision for numeric types
     */
    NUMERIC_PRECISION: number | null;
    /**
     * Scale for numeric types
     */
    NUMERIC_SCALE: number | null;
    /**
     * Precision for datetime types
     */
    DATETIME_PRECISION: number | null;
    /**
     * Character set for string types
     */
    CHARACTER_SET_NAME: string | null;
    /**
     * Collation for string types
     */
    COLLATION_NAME: string | null;
    /**
     * Full column type description (e.g., 'int(10) unsigned')
     */
    COLUMN_TYPE: string;
    /**
     * Column index type (PRI=primary key, UNI=unique, etc.)
     */
    COLUMN_KEY: "PRI" | "UNI" | "MUL" | "";
    /**
     * Additional information (e.g., 'auto_increment')
     */
    EXTRA: string;
    /**
     * Comma-separated column privileges
     */
    PRIVILEGES: string;
    /**
     * Column comment
     */
    COLUMN_COMMENT: string;
    /**
     * Whether column value is generated
     */
    IS_GENERATED: "NEVER" | "ALWAYS" | string;
    /**
     * Expression for generated columns
     */
    GENERATION_EXPRESSION: string | null;
};
export type ColumnMetadataParams = {
    /**
     * - Table catalog (usually 'def')
     */
    tableCatalog: string;
    /**
     * - Database/schema name
     */
    tableSchema: string;
    /**
     * - Table name
     */
    tableName: string;
    /**
     * - Column name
     */
    columnName: string;
    /**
     * - Position in table (1-based)
     */
    ordinalPosition: number;
    /**
     * - Default value
     */
    columnDefault: string | null;
    /**
     * - Nullable status
     */
    isNullable: "YES" | "NO";
    /**
     * - Data type (e.g. 'int', 'varchar')
     */
    dataType: string;
    /**
     * - Max length for string types (characters)
     */
    characterMaximumLength: number | null;
    /**
     * - Max length for string types (bytes)
     */
    characterOctetLength: number | null;
    /**
     * - Precision for numeric types
     */
    numericPrecision: number | null;
    /**
     * - Scale for numeric types
     */
    numericScale: number | null;
    /**
     * - Precision for datetime types
     */
    datetimePrecision: number | null;
    /**
     * - Character set for string types
     */
    characterSetName: string | null;
    /**
     * - Collation for string types
     */
    collationName: string | null;
    /**
     * - Full column type (e.g. 'int(11) unsigned')
     */
    columnType: string;
    /**
     * - Key type (primary/unique/etc.)
     */
    columnKey: "PRI" | "UNI" | "MUL" | "";
    /**
     * - Extra information (e.g. 'auto_increment')
     */
    extra: string;
    /**
     * - Column privileges
     */
    privileges: string;
    /**
     * - Column comment
     */
    columnComment: string;
    /**
     * - Generation status
     */
    isGenerated: "NEVER" | "ALWAYS" | string;
    /**
     * - Generation expression
     */
    generationExpression: string | null;
};
export class MySQLDatabase {
    /**
     * Creates an instance of MySQLDatabase.
     *
     * @param {string} databaseName - The name of the database.
     * @param {ColumnMetadataRaw[]} [cols=[]] - An array of table objects with table name and columns metadata.
     */
    constructor(databaseName: string, cols?: ColumnMetadataRaw[]);
    /** @type {string} */
    databaseName: string;
    /** @type {Map<string, MySQLTable>} */
    tables: Map<string, MySQLTable>;
    /**
     * Adds a table to the database.
     *
     * @param {MySQLTable} table - The table to add.
     */
    addTable(table: MySQLTable): void;
}
export class MySQLTable {
    /**
     * Creates MySQLTable instance from table name and columns data
     * @param {string} tableName Table name
     * @param {ColumnMetadataRaw[]} columns Columns data in snake_case format
     */
    constructor(tableName: string, columns?: ColumnMetadataRaw[]);
    /** @type {string} */
    tableName: string;
    /** @type {Map<string, MySQLTableColumn>} */
    columns: Map<string, MySQLTableColumn>;
    /**
     * Adds a column to the table
     * @param {MySQLTableColumn} column The column to add
     */
    addColumn(column: MySQLTableColumn): void;
    /**
     * Get all columns in table
     * @returns {MySQLTableColumn[]}
     */
    getColumns(): MySQLTableColumn[];
    /**
     * Get column by name
     * @param {string} columnName
     * @returns {MySQLTableColumn|null}
     */
    getColumn(columnName: string): MySQLTableColumn | null;
    /**
     * Generates CREATE TABLE SQL statement based on table metadata
     * @param {Object} [options] Additional options
     * @param {string} [options.engine] Storage engine (e.g. 'InnoDB')
     * @param {string} [options.charset] Default charset (e.g. 'utf8mb4')
     * @param {string} [options.collation] Default collation (e.g. 'utf8mb4_unicode_ci')
     * @param {string} [options.comment] Table comment
     * @returns {string} CREATE TABLE SQL query
     */
    generateCreateTableQuery(options?: {
        engine?: string;
        charset?: string;
        collation?: string;
        comment?: string;
    }): string;
    #private;
}
/**
 * Class representing normalized database column metadata
 */
export class MySQLTableColumn {
    /**
     * Creates an instance of ColumnMetadata from raw data
     * @param {ColumnMetadataParams} [data]
     */
    constructor(data?: ColumnMetadataParams);
    /**
     * Table catalog (typically 'def' in MySQL)
     * @type {string}
     */
    tableCatalog: string;
    /**
     * Database/schema name containing the table
     * @type {string}
     */
    tableSchema: string;
    /**
     * Name of the table
     * @type {string}
     */
    tableName: string;
    /**
     * Name of the column
     *  @type {string}
     */
    columnName: string;
    /**
     * Column position in table (1-based index)
     * @type {number}
     */
    ordinalPosition: number;
    /**
     * Default value for the column
     * @type {string|null}
     */
    columnDefault: string | null;
    /**
     * Whether the column is nullable
     * @type {'YES'|'NO'}
     */
    isNullable: "YES" | "NO";
    /**
     * Column's data type (e.g., 'int', 'varchar')
     * @type {string}
     */
    dataType: string;
    /**
     * Maximum length for string types (in characters)
     * @type {number|null}
     */
    characterMaximumLength: number | null;
    /**
     * Maximum length for string types (in bytes)
     * @type {number|null}
     */
    characterOctetLength: number | null;
    /**
     * Precision for numeric types
     * @type {number|null}
     */
    numericPrecision: number | null;
    /**
     * Scale for numeric types
     * @type {number|null}
     */
    numericScale: number | null;
    /**
     * Precision for datetime types
     * @type {number|null}
     */
    datetimePrecision: number | null;
    /**
     * Character set for string types
     * @type {string|null}
     */
    characterSetName: string | null;
    /**
     * Collation for string types
     * @type {string|null}
     */
    collationName: string | null;
    /**
     * Full column type description (e.g., 'int(10) unsigned')
     * @type {string}
     */
    columnType: string;
    /**
     * Column index type (PRI=primary key, UNI=unique, etc.)
     * @type {'PRI'|'UNI'|'MUL'|''}
     */
    columnKey: "PRI" | "UNI" | "MUL" | "";
    /**
     * Additional information (e.g., 'auto_increment')
     * @type {string}
     */
    extra: string;
    /**
     * Comma-separated column privileges
     * @type {string}
     */
    privileges: string;
    /**
     * Column comment
     * @type {string}
     */
    columnComment: string;
    /**
     * Whether column value is generated
     * @type {'NEVER'|'ALWAYS'|string}
     */
    isGenerated: "NEVER" | "ALWAYS" | string;
    /**
     * Expression for generated columns
     * @type {string|null}
     */
    generationExpression: string | null;
    /**
     * Import raw metadata into this object
     * @param {ColumnMetadataRaw} rawMetadata
     */
    importFromRawData(rawMetadata: ColumnMetadataRaw): void;
    /**
     * Check if column is a primary key
     * @returns {boolean}
     */
    isPrimaryKey(): boolean;
    /**
     * Check if column allows NULL values
     * @returns {boolean}
     */
    allowsNull(): boolean;
    /**
     * Check if column auto-increments
     * @returns {boolean}
     */
    isAutoIncrement(): boolean;
    /**
     * Get full column definition as string
     * @returns {string}
     */
    getColumnDefinition(): string;
    /**
     * Get a JSON representation of the column metadata
     * @returns {ColumnMetadataParams} JSON-serializable object with column metadata
     */
    toJSON(): ColumnMetadataParams;
}
/**
 * Database column metadata object describing a table column's structure
 * @typedef {Object} ColumnMetadataRaw
 * @property {string} TABLE_CATALOG Table catalog (typically 'def' in MySQL)
 * @property {string} TABLE_SCHEMA Database/schema name containing the table
 * @property {string} TABLE_NAME Name of the table
 * @property {string} COLUMN_NAME Name of the column
 * @property {number} ORDINAL_POSITION Column position in table (1-based index)
 * @property {string|null} COLUMN_DEFAULT Default value for the column
 * @property {'YES'|'NO'} IS_NULLABLE Whether the column is nullable
 * @property {string} DATA_TYPE Column's data type (e.g., 'int', 'varchar')
 * @property {number|null} CHARACTER_MAXIMUM_LENGTH Maximum length for string types (in characters)
 * @property {number|null} CHARACTER_OCTET_LENGTH Maximum length for string types (in bytes)
 * @property {number|null} NUMERIC_PRECISION Precision for numeric types
 * @property {number|null} NUMERIC_SCALE Scale for numeric types
 * @property {number|null} DATETIME_PRECISION Precision for datetime types
 * @property {string|null} CHARACTER_SET_NAME Character set for string types
 * @property {string|null} COLLATION_NAME Collation for string types
 * @property {string} COLUMN_TYPE Full column type description (e.g., 'int(10) unsigned')
 * @property {'PRI'|'UNI'|'MUL'|''} COLUMN_KEY Column index type (PRI=primary key, UNI=unique, etc.)
 * @property {string} EXTRA Additional information (e.g., 'auto_increment')
 * @property {string} PRIVILEGES Comma-separated column privileges
 * @property {string} COLUMN_COMMENT Column comment
 * @property {'NEVER'|'ALWAYS'|string} IS_GENERATED Whether column value is generated
 * @property {string|null} GENERATION_EXPRESSION Expression for generated columns
 */
/**
 * @typedef {Object} ColumnMetadataParams
 * @property {string} tableCatalog - Table catalog (usually 'def')
 * @property {string} tableSchema - Database/schema name
 * @property {string} tableName - Table name
 * @property {string} columnName - Column name
 * @property {number} ordinalPosition - Position in table (1-based)
 * @property {string|null} columnDefault - Default value
 * @property {'YES'|'NO'} isNullable - Nullable status
 * @property {string} dataType - Data type (e.g. 'int', 'varchar')
 * @property {number|null} characterMaximumLength - Max length for string types (characters)
 * @property {number|null} characterOctetLength - Max length for string types (bytes)
 * @property {number|null} numericPrecision - Precision for numeric types
 * @property {number|null} numericScale - Scale for numeric types
 * @property {number|null} datetimePrecision - Precision for datetime types
 * @property {string|null} characterSetName - Character set for string types
 * @property {string|null} collationName - Collation for string types
 * @property {string} columnType - Full column type (e.g. 'int(11) unsigned')
 * @property {'PRI'|'UNI'|'MUL'|''} columnKey - Key type (primary/unique/etc.)
 * @property {string} extra - Extra information (e.g. 'auto_increment')
 * @property {string} privileges - Column privileges
 * @property {string} columnComment - Column comment
 * @property {'NEVER'|'ALWAYS'|string} isGenerated - Generation status
 * @property {string|null} generationExpression - Generation expression
 */
/**
 * Validate a raw column metadata object against the expected structure and types.
 * Throws an error if the object is invalid.
 * @param {ColumnMetadataRaw} obj Raw column metadata object
 * @returns {true} If the object is valid
 * @throws {Error} If the object is invalid
 */
export function assertColumnMetadataRaw(obj: ColumnMetadataRaw): true;
/**
 * Parses a MySQL schema definition into a structured representation
 *
 * @param {ColumnMetadataRaw[]} schema - MySQL schema definition
 * @returns {MySQLDatabase} Structured representation of the database
 */
export function parseMySQLSchema(schema: ColumnMetadataRaw[]): MySQLDatabase;
