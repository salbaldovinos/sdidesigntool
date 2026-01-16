import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, '../docs/Geoflow ES Calcs Design Tool v1.1.xlsx');

console.log('Reading Excel file:', filePath);
console.log('='.repeat(80));

const workbook = XLSX.readFile(filePath, { cellFormula: true, cellStyles: true });

console.log('\nSheet Names:', workbook.SheetNames);
console.log('='.repeat(80));

// Iterate through each sheet
workbook.SheetNames.forEach((sheetName) => {
  console.log(`\n\n${'#'.repeat(80)}`);
  console.log(`SHEET: ${sheetName}`);
  console.log('#'.repeat(80));

  const sheet = workbook.Sheets[sheetName];
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');

  console.log(`Range: ${sheet['!ref']}`);
  console.log(`Rows: ${range.e.r - range.s.r + 1}, Cols: ${range.e.c - range.s.c + 1}`);

  // Get all cells with values or formulas
  const cells = [];
  for (let row = range.s.r; row <= Math.min(range.e.r, 50); row++) { // Limit to first 50 rows
    for (let col = range.s.c; col <= Math.min(range.e.c, 20); col++) { // Limit to first 20 cols
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = sheet[cellRef];

      if (cell) {
        const cellInfo = {
          ref: cellRef,
          value: cell.v,
          type: cell.t,
          formula: cell.f || null,
        };

        if (cell.f || cell.v !== undefined) {
          cells.push(cellInfo);
        }
      }
    }
  }

  // Print cells with formulas
  const formulaCells = cells.filter(c => c.formula);
  if (formulaCells.length > 0) {
    console.log('\n--- CELLS WITH FORMULAS ---');
    formulaCells.forEach(c => {
      console.log(`${c.ref}: "${c.formula}" => ${c.value}`);
    });
  }

  // Print as readable table
  console.log('\n--- SHEET DATA (first 50 rows) ---');
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  jsonData.slice(0, 50).forEach((row, idx) => {
    const nonEmpty = row.filter(c => c !== '');
    if (nonEmpty.length > 0) {
      console.log(`Row ${idx + 1}: ${JSON.stringify(row.slice(0, 15))}`);
    }
  });
});
