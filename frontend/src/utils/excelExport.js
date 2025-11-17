// utils/excelExport.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exporta datos a un archivo Excel
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {String} fileName - Nombre del archivo (sin extensión)
 * @param {String} sheetName - Nombre de la hoja
 */
export const exportToExcel = (data, fileName = 'reporte', sheetName = 'Datos') => {
  try {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Convertir datos a hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Ajustar ancho de columnas automáticamente
    const colWidths = [];
    if (data.length > 0) {
      Object.keys(data[0]).forEach((key) => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => String(row[key] || '').length)
        );
        colWidths.push({ wch: Math.min(maxLength + 2, 50) });
      });
      ws['!cols'] = colWidths;
    }
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generar archivo Excel
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Guardar archivo
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    return false;
  }
};

/**
 * Exporta múltiples hojas a un archivo Excel
 * @param {Array} sheets - Array de objetos { data: [], sheetName: '' }
 * @param {String} fileName - Nombre del archivo (sin extensión)
 */
export const exportMultipleSheetsToExcel = (sheets, fileName = 'reporte') => {
  try {
    const wb = XLSX.utils.book_new();
    
    sheets.forEach(({ data, sheetName }) => {
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Ajustar ancho de columnas
      if (data.length > 0) {
        const colWidths = [];
        Object.keys(data[0]).forEach((key) => {
          const maxLength = Math.max(
            key.length,
            ...data.map(row => String(row[key] || '').length)
          );
          colWidths.push({ wch: Math.min(maxLength + 2, 50) });
        });
        ws['!cols'] = colWidths;
      }
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error al exportar múltiples hojas a Excel:', error);
    return false;
  }
};

/**
 * Exporta tabla HTML a Excel
 * @param {String} tableId - ID de la tabla HTML
 * @param {String} fileName - Nombre del archivo (sin extensión)
 */
export const exportTableToExcel = (tableId, fileName = 'tabla') => {
  try {
    const table = document.getElementById(tableId);
    if (!table) {
      console.error(`Tabla con ID "${tableId}" no encontrada`);
      return false;
    }
    
    const wb = XLSX.utils.table_to_book(table);
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    saveAs(blob, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error al exportar tabla a Excel:', error);
    return false;
  }
};

/**
 * Formatea datos para exportación
 * @param {Array} data - Datos originales
 * @param {Object} columnMap - Mapeo de columnas { keyOriginal: 'Nuevo Nombre' }
 */
export const formatDataForExport = (data, columnMap) => {
  return data.map(row => {
    const newRow = {};
    Object.keys(columnMap).forEach(key => {
      newRow[columnMap[key]] = row[key];
    });
    return newRow;
  });
};
