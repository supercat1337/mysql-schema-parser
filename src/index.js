// @ts-check

// Export classes
export { MySQLDatabase } from './MySQLDatabase.js';
export { MySQLTable } from './MySQLTable.js';
export { MySQLTableColumn } from './MySQLTableColumn.js';

// Export utilities
export { assertColumnMetadataRaw, escapeString, formatDefaultValue } from './utils.js';

// Export main parser function
export { parseMySQLSchema } from './parseMySQLSchema.js';
