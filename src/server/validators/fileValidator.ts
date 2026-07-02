import { Row } from '../types';

export function isFileEmpty(rows: Row[]): boolean {
  return rows.length === 0;
}
