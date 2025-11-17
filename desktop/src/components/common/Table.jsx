import React from 'react';
import './Table.css';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import Button from './Button';

function Table({ columns, data, onEdit, onDelete, onView, loading = false }) {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
            {(onEdit || onDelete || onView) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
              {(onEdit || onDelete || onView) && (
                <td className="table-actions">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="small"
                      icon={<FaEye />}
                      onClick={() => onView(row)}
                    />
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="small"
                      icon={<FaEdit />}
                      onClick={() => onEdit(row)}
                    />
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="small"
                      icon={<FaTrash />}
                      onClick={() => onDelete(row)}
                    />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
