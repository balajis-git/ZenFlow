const ExcelJS = require('exceljs');

const styleHeaderRow = (row) => {
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }, // Royal Blue
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 11,
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  row.height = 25;
};

const styleDataRows = (worksheet) => {
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
      cell.alignment = { vertical: 'middle' };
    });
    row.height = 20;
  });
};

const generateExcelReport = async (res, title, headers, rows) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  worksheet.addRow(headers);
  rows.forEach((row) => worksheet.addRow(row));

  styleHeaderRow(worksheet.getRow(1));

  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = Math.max(maxLength + 3, 12);
  });

  styleDataRows(worksheet);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${title.toLowerCase().replace(/ /g, '_')}_report.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  generateExcelReport,
};
