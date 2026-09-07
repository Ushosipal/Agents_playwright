import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { LoginData } from '../types/login';

export function readExcelSync(filePath: string): LoginData[] {
  const jsonPath = path.resolve(__dirname, '../../testData/loginData.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as LoginData[];
      return parsed.map((d) => ({
        testCaseId: d.testCaseId || '',
        username: String(d.username || '').trim(),
        password: String(d.password || 'secret_sauce'),
        expectedResult: String(d.expectedResult || '').trim().toLowerCase(),
      }));
    } catch {
      // fall through to Excel parsing if JSON is invalid
    }
  }

  const resolved = path.resolve(filePath);
  const workbook = xlsx.readFile(resolved);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const raw = xlsx.utils.sheet_to_json(sheet, { defval: '' }) as any[];

  return raw.map((row) => ({
    testCaseId: row.testCaseId || row.TestCaseId || row['Test Case ID'] || '',
    username: String(row.username || row.Username || row['user-name'] || row.user || '').trim(),
    password: String(row.password || row.Password || 'secret_sauce'),
    expectedResult: String(row.expectedResult || row.ExpectedResult || row.expected || '').trim().toLowerCase(),
  }));
}
