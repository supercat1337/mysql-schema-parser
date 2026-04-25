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

declare global {
    interface ColumnMetadataRaw extends _ColumnMetadataRaw {}
    interface ColumnMetadataParams extends _ColumnMetadataParams {}
}


type _ColumnMetadataRaw = ColumnMetadataRaw;
type _ColumnMetadataParams = ColumnMetadataParams;


// ===== New: Statistics from INFORMATION_SCHEMA.STATISTICS =====

export interface IndexStatisticsRaw {
    TABLE_SCHEMA: string;
    TABLE_NAME: string;
    INDEX_NAME: string;
    COLUMN_NAME: string;
    CARDINALITY: number | null;
    NON_UNIQUE: 0 | 1;
    SEQ_IN_INDEX: number;
    SUB_PART: number | null;
    NULLABLE: string;          // 'YES' or 'NO'
    INDEX_TYPE: string;        // 'BTREE', 'HASH', 'FULLTEXT', 'SPATIAL'
    COLLATION: 'A' | 'D' | null;
}

export interface IndexStatistics {
    tableSchema: string;
    tableName: string;
    indexName: string;
    columnName: string;
    cardinality: number | null;
    nonUnique: boolean;
    seqInIndex: number;
    subPart: number | null;
    nullable: boolean;
    indexType: string;
    collation: 'ASC' | 'DESC' | null;
}

// Extend global interfaces so they are available in JS files without imports
declare global {
    interface IndexStatisticsRaw extends _IndexStatisticsRaw {}
    interface IndexStatistics extends _IndexStatistics {}
}

type _IndexStatisticsRaw = IndexStatisticsRaw;
type _IndexStatistics = IndexStatistics;