// 1. Обязательно добавляем export, чтобы файл стал модулем.
// Это позволит использовать блок 'declare global'.
export interface ColumnMetadataRaw {
    TABLE_CATALOG: string;
    TABLE_SCHEMA: string;
    TABLE_NAME: string;
    COLUMN_NAME: string;
    ORDINAL_POSITION: number;
    COLUMN_DEFAULT: string | null;
    IS_NULLABLE: 'YES' | 'NO';
    DATA_TYPE: string;
    CHARACTER_MAXIMUM_LENGTH: number | null;
    CHARACTER_OCTET_LENGTH: number | null;
    NUMERIC_PRECISION: number | null;
    NUMERIC_SCALE: number | null;
    DATETIME_PRECISION: number | null;
    CHARACTER_SET_NAME: string | null;
    COLLATION_NAME: string | null;
    COLUMN_TYPE: string;
    COLUMN_KEY: 'PRI' | 'UNI' | 'MUL' | '';
    EXTRA: string;
    PRIVILEGES: string;
    COLUMN_COMMENT: string;
    IS_GENERATED: 'NEVER' | 'ALWAYS' | string;
    GENERATION_EXPRESSION: string | null;
}

export interface ColumnMetadataParams {
    tableCatalog: string;
    tableSchema: string;
    tableName: string;
    columnName: string;
    ordinalPosition: number;
    columnDefault: string | null;
    isNullable: 'YES' | 'NO';
    dataType: string;
    characterMaximumLength: number | null;
    characterOctetLength: number | null;
    numericPrecision: number | null;
    numericScale: number | null;
    datetimePrecision: number | null;
    characterSetName: string | null;
    collationName: string | null;
    columnType: string;
    columnKey: 'PRI' | 'UNI' | 'MUL' | '';
    extra: string;
    privileges: string;
    columnComment: string;
    isGenerated: 'NEVER' | 'ALWAYS' | string;
    generationExpression: string | null;
}

// 2. Теперь блок declare global сработает без ошибок TS2669
declare global {
    // Мы объявляем эти интерфейсы в глобальной области, 
    // чтобы JS-файлы в src/ видели их без импортов.
    interface ColumnMetadataRaw extends _ColumnMetadataRaw {}
    interface ColumnMetadataParams extends _ColumnMetadataParams {}
}

// Технический алиас, чтобы избежать прямой рекурсии в declare global
type _ColumnMetadataRaw = ColumnMetadataRaw;
type _ColumnMetadataParams = ColumnMetadataParams;

/* From MySQLDatabase.d.ts */
export class MySQLDatabase {
    /**
     * Creates an instance of MySQLDatabase.
     * @param {string} databaseName - The name of the database.
     * @param {ColumnMetadataRaw[]} [cols=[]] - Array of raw column metadata.
     */
    constructor(databaseName: string, cols?: ColumnMetadataRaw[]);
    /** @type {string} */
    databaseName: string;
    /** @type {Map<string, MySQLTable>} */
    tables: Map<string, MySQLTable>;
    /**
     * Adds a table to the database.
     * @param {MySQLTable} table - The table to add.
     */
    addTable(table: MySQLTable): void;
    /**
     * Get all table names in the database
     * @returns {string[]} An array of table names
     */
    getTableNames(): string[];
    /**
     * Returns JSON representation of the whole database
     * @returns {Object}
     */
    toJSON(): any;
}

/* From MySQLTable.d.ts */
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
     * Get all columns in table, sorted by ordinal position
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
    /**
     * Gets an array of column names in the table
     * @returns {string[]}
     */
    getColumnNames(): string[];
    /**
     * Returns JSON representation of the table
     * @returns {Object}
     */
    toJSON(): any;
}

/* From MySQLTableColumn.d.ts */
/**
 * Class representing normalized database column metadata
 */
export class MySQLTableColumn {
    /**
     * Creates an instance of ColumnMetadata from raw data
     * @param {ColumnMetadataParams} [data]
     */
    constructor(data?: ColumnMetadataParams);
    /** @type {string} */
    tableCatalog: string;
    /** @type {string} */
    tableSchema: string;
    /** @type {string} */
    tableName: string;
    /** @type {string} */
    columnName: string;
    /** @type {number} */
    ordinalPosition: number;
    /** @type {string|null} */
    columnDefault: string | null;
    /** @type {'YES'|'NO'} */
    isNullable: "YES" | "NO";
    /** @type {string} */
    dataType: string;
    /** @type {number|null} */
    characterMaximumLength: number | null;
    /** @type {number|null} */
    characterOctetLength: number | null;
    /** @type {number|null} */
    numericPrecision: number | null;
    /** @type {number|null} */
    numericScale: number | null;
    /** @type {number|null} */
    datetimePrecision: number | null;
    /** @type {string|null} */
    characterSetName: string | null;
    /** @type {string|null} */
    collationName: string | null;
    /** @type {string} */
    columnType: string;
    /** @type {'PRI'|'UNI'|'MUL'|''} */
    columnKey: "PRI" | "UNI" | "MUL" | "";
    /** @type {string} */
    extra: string;
    /** @type {string} */
    privileges: string;
    /** @type {string} */
    columnComment: string;
    /** @type {'NEVER'|'ALWAYS'|string} */
    isGenerated: "NEVER" | "ALWAYS" | string;
    /** @type {string|null} */
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
     * Get full column definition as string (without PRIMARY KEY constraint)
     * @returns {string}
     */
    getColumnDefinition(): string;
    /**
     * Get a JSON representation of the column metadata
     * @returns {ColumnMetadataParams} JSON-serializable object with column metadata
     */
    toJSON(): ColumnMetadataParams;
}

/* From parseMySQLSchema.d.ts */
/**
 * Parses a MySQL schema definition into a structured representation.
 * @param {ColumnMetadataRaw[]} schema - MySQL schema metadata array.
 * @returns {MySQLDatabase} Structured representation of the database.
 * @throws {Error} If schema is not an array or empty.
 */
export function parseMySQLSchema(schema: ColumnMetadataRaw[]): MySQLDatabase;

/* From utils.d.ts */
/**
 * Validate a raw column metadata object against the expected structure and types.
 * Throws an error if the object is invalid.
 * @param {ColumnMetadataRaw} obj Raw column metadata object
 * @returns {true} If the object is valid
 * @throws {Error} If the object is invalid
 */
export function assertColumnMetadataRaw(obj: ColumnMetadataRaw): true;
/**
 * Escape a string for safe use in SQL (single quotes doubled).
 * @param {string} str Input string
 * @returns {string} Escaped string
 */
export function escapeString(str: string): string;
/**
 * Format a column default value for SQL query.
 * @param {MySQLTableColumn} column Column instance
 * @returns {string} Formatted default value
 */
export function formatDefaultValue(column: MySQLTableColumn): string;
