// src/index.js
function assertColumnMetadataRaw(obj) {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("Input must be a non-null object");
  }
  const requiredKeys = [
    "TABLE_CATALOG",
    "TABLE_SCHEMA",
    "TABLE_NAME",
    "COLUMN_NAME",
    "ORDINAL_POSITION",
    "IS_NULLABLE",
    "DATA_TYPE",
    "COLUMN_TYPE",
    "COLUMN_KEY",
    "EXTRA",
    "PRIVILEGES",
    "COLUMN_COMMENT",
    "IS_GENERATED"
  ];
  for (const key of requiredKeys) {
    if (!(key in obj)) {
      throw new Error(`Missing required field: ${key}`);
    }
  }
  const validators = {
    TABLE_CATALOG: (val) => typeof val === "string" || `Expected string, got ${typeof val}`,
    TABLE_SCHEMA: (val) => typeof val === "string" || `Expected string, got ${typeof val}`,
    TABLE_NAME: (val) => typeof val === "string" || `Expected string, got ${typeof val}`,
    COLUMN_NAME: (val) => typeof val === "string" || `Expected string, got ${typeof val}`,
    ORDINAL_POSITION: (val) => typeof val === "number" || `Expected number, got ${typeof val}`,
    COLUMN_DEFAULT: (val) => val === null || typeof val === "string" || `Expected string or null, got ${typeof val}`,
    IS_NULLABLE: (val) => val === "YES" || val === "NO" || `Expected 'YES' or 'NO', got ${val}`,
    DATA_TYPE: (val) => typeof val === "string" || `Expected string, got ${typeof val}`,
    CHARACTER_MAXIMUM_LENGTH: (val) => val === null || typeof val === "number" || `Expected number or null, got ${typeof val}`,
    CHARACTER_OCTET_LENGTH: (val) => val === null || typeof val === "number" || `Expected number or null, got ${typeof val}`,
    NUMERIC_PRECISION: (val) => val === null || typeof val === "number" || `Expected number or null, got ${typeof val}`,
    NUMERIC_SCALE: (val) => val === null || typeof val === "number" || `Expected number or null, got ${typeof val}`,
    DATETIME_PRECISION: (val) => val === null || typeof val === "number" || `Expected number or null, got ${typeof val}`,
    CHARACTER_SET_NAME: (val) => val === null || typeof val === "string" || `Expected string or null, got ${typeof val}`,
    COLLATION_NAME: (val) => val === null || typeof val === "string" || `Expected string or null, got ${typeof val}`,
    COLUMN_TYPE: (val) => typeof val === "string" || `Expected string, got ${typeof val}`,
    COLUMN_KEY: (val) => ["PRI", "UNI", "MUL", ""].includes(val) || `Expected 'PRI', 'UNI', 'MUL' or empty string, got ${val}`,
    EXTRA: (val) => typeof val === "string" || `Expected string, got ${typeof val}`,
    PRIVILEGES: (val) => typeof val === "string" || `Expected string, got ${typeof val}`,
    COLUMN_COMMENT: (val) => typeof val === "string" || `Expected string, got ${typeof val}`,
    IS_GENERATED: (val) => val === "NEVER" || val === "ALWAYS" || typeof val === "string" || `Expected 'NEVER', 'ALWAYS' or string, got ${val}`,
    GENERATION_EXPRESSION: (val) => val === null || typeof val === "string" || `Expected string or null, got ${typeof val}`
  };
  for (const [key, validator] of Object.entries(validators)) {
    const validationResult = validator(obj[key]);
    if (typeof validationResult === "string") {
      throw new Error(`Invalid ${key}: ${validationResult}`);
    }
  }
  return true;
}
var MySQLTableColumn = class {
  /**
   * Table catalog (typically 'def' in MySQL)
   * @type {string}
   */
  tableCatalog;
  /**
   * Database/schema name containing the table
   * @type {string}
   */
  tableSchema;
  /**
   * Name of the table
   * @type {string}
   */
  tableName;
  /**
   * Name of the column
   *  @type {string}
   */
  columnName;
  /**
   * Column position in table (1-based index)
   * @type {number}
   */
  ordinalPosition;
  /**
   * Default value for the column
   * @type {string|null}
   */
  columnDefault;
  /**
   * Whether the column is nullable
   * @type {'YES'|'NO'}
   */
  isNullable;
  /**
   * Column's data type (e.g., 'int', 'varchar')
   * @type {string}
   */
  dataType;
  /**
   * Maximum length for string types (in characters)
   * @type {number|null}
   */
  characterMaximumLength;
  /**
   * Maximum length for string types (in bytes)
   * @type {number|null}
   */
  characterOctetLength;
  /**
   * Precision for numeric types
   * @type {number|null}
   */
  numericPrecision;
  /**
   * Scale for numeric types
   * @type {number|null}
   */
  numericScale;
  /**
   * Precision for datetime types
   * @type {number|null}
   */
  datetimePrecision;
  /**
   * Character set for string types
   * @type {string|null}
   */
  characterSetName;
  /**
   * Collation for string types
   * @type {string|null}
   */
  collationName;
  /**
   * Full column type description (e.g., 'int(10) unsigned')
   * @type {string}
   */
  columnType;
  /**
   * Column index type (PRI=primary key, UNI=unique, etc.)
   * @type {'PRI'|'UNI'|'MUL'|''}
   */
  columnKey;
  /**
   * Additional information (e.g., 'auto_increment')
   * @type {string}
   */
  extra;
  /**
   * Comma-separated column privileges
   * @type {string}
   */
  privileges;
  /**
   * Column comment
   * @type {string}
   */
  columnComment;
  /**
   * Whether column value is generated
   * @type {'NEVER'|'ALWAYS'|string}
   */
  isGenerated;
  /**
   * Expression for generated columns
   * @type {string|null}
   */
  generationExpression;
  /**
   * Creates an instance of ColumnMetadata from raw data
   * @param {ColumnMetadataParams} [data]
   */
  constructor(data) {
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
    return this.columnKey === "PRI";
  }
  /**
   * Check if column allows NULL values
   * @returns {boolean}
   */
  allowsNull() {
    return this.isNullable === "YES";
  }
  /**
   * Check if column auto-increments
   * @returns {boolean}
   */
  isAutoIncrement() {
    return this.extra.includes("auto_increment");
  }
  /**
   * Get full column definition as string
   * @returns {string}
   */
  getColumnDefinition() {
    return `${this.columnName} ${this.columnType}` + (this.isPrimaryKey() ? " PRIMARY KEY" : "") + (this.isAutoIncrement() ? " AUTO_INCREMENT" : "") + (this.allowsNull() ? "" : " NOT NULL");
  }
  /**
   * Get a JSON representation of the column metadata
   * @returns {ColumnMetadataParams} JSON-serializable object with column metadata
   */
  toJSON() {
    return {
      ...this
    };
  }
};
var MySQLDatabase = class {
  /** @type {string} */
  databaseName;
  /** @type {Map<string, MySQLTable>} */
  tables = /* @__PURE__ */ new Map();
  /**
   * Creates an instance of MySQLDatabase.
   *
   * @param {string} databaseName - The name of the database.
   * @param {ColumnMetadataRaw[]} [cols=[]] - An array of table objects with table name and columns metadata.
   */
  constructor(databaseName, cols = []) {
    this.databaseName = databaseName;
    let tableNames = /* @__PURE__ */ new Set();
    for (let i = 0; i < cols.length; i++) {
      tableNames.add(cols[i].TABLE_NAME);
    }
    for (let tableName of tableNames) {
      let tableCols = cols.filter((col) => col.TABLE_NAME === tableName);
      if (tableCols.length === 0) {
        continue;
      }
      let table = new MySQLTable(tableName, tableCols);
      this.addTable(table);
    }
  }
  /**
   * Adds a table to the database.
   *
   * @param {MySQLTable} table - The table to add.
   */
  addTable(table) {
    this.tables.set(table.tableName, table);
  }
};
var MySQLTable = class {
  /** @type {string} */
  tableName;
  /** @type {Map<string, MySQLTableColumn>} */
  columns = /* @__PURE__ */ new Map();
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
   * Get all columns in table
   * @returns {MySQLTableColumn[]}
   */
  getColumns() {
    return Array.from(this.columns.values());
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
      let definition = `\`${column.columnName}\` ${column.columnType}`;
      if (!column.allowsNull()) {
        definition += " NOT NULL";
      }
      if (column.columnDefault !== null) {
        const defaultValue = this.#formatDefaultValue(column);
        definition += ` DEFAULT ${defaultValue}`;
      }
      if (column.isAutoIncrement()) {
        definition += " AUTO_INCREMENT";
      }
      if (column.columnComment) {
        definition += ` COMMENT '${this.#escapeString(
          column.columnComment
        )}'`;
      }
      columnDefinitions.push(definition);
      if (column.isPrimaryKey()) {
        primaryKeys.push(`\`${column.columnName}\``);
      } else if (column.columnKey === "UNI") {
        uniqueKeys.push(`\`${column.columnName}\``);
      } else if (column.columnKey === "MUL") {
        indexes.push(`\`${column.columnName}\``);
      }
    }
    if (primaryKeys.length > 0) {
      columnDefinitions.push(`PRIMARY KEY (${primaryKeys.join(", ")})`);
    }
    for (const uniqueCol of uniqueKeys) {
      columnDefinitions.push(
        `UNIQUE KEY \`${uniqueCol.replace(
          /`/g,
          ""
        )}_unique\` (${uniqueCol})`
      );
    }
    let query = `CREATE TABLE \`${this.tableName}\` (
  `;
    query += columnDefinitions.join(",\n  ");
    query += "\n)";
    if (options.engine) {
      query += ` ENGINE=${options.engine}`;
    }
    const charset = options.charset || columns[0].characterSetName || "utf8mb4";
    const collation = options.collation || columns[0].collationName || "utf8mb4_unicode_ci";
    query += ` DEFAULT CHARSET=${charset} COLLATE=${collation}`;
    if (options.comment) {
      query += ` COMMENT='${this.#escapeString(options.comment)}'`;
    }
    return query + ";";
  }
  /**
   * Formats default value for SQL query
   * @param {MySQLTableColumn} column
   * @returns {string}
   */
  #formatDefaultValue(column) {
    if (column.columnDefault === null) return "NULL";
    if (["char", "varchar", "text", "enum", "set"].includes(
      column.dataType.toLowerCase()
    )) {
      return `'${this.#escapeString(column.columnDefault)}'`;
    }
    if (["timestamp", "datetime"].includes(column.dataType.toLowerCase()) && column.columnDefault.toUpperCase() === "CURRENT_TIMESTAMP") {
      return "CURRENT_TIMESTAMP";
    }
    if (["blob", "binary"].includes(column.dataType.toLowerCase())) {
      return `x'${column.columnDefault}'`;
    }
    return column.columnDefault;
  }
  /**
   * Escapes string for SQL
   * @param {string} str
   * @returns {string}
   */
  #escapeString(str) {
    return str.replace(/'/g, "''").replace(/\\/g, "\\\\");
  }
};
function parseMySQLSchema(schema) {
  if (!Array.isArray(schema)) throw new Error("Schema must be an array");
  if (schema.length === 0) throw new Error("Schema must not be empty");
  let databaseName = schema[0].TABLE_SCHEMA;
  return new MySQLDatabase(databaseName, schema);
}
export {
  MySQLDatabase,
  MySQLTable,
  MySQLTableColumn,
  assertColumnMetadataRaw,
  parseMySQLSchema
};
