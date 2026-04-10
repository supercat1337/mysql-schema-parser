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