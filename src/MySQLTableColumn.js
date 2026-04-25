// @ts-check

import { assertColumnMetadataRaw } from './utils.js';

/**
 * Class representing normalized database column metadata
 */
export class MySQLTableColumn {
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
