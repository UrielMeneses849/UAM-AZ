export function LegacyTable({ columns, rows, emptyText = "No hay registros disponibles." }) {
  return (
    <div className="table-scroll">
      <table className="legacy-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="empty-cell">{emptyText}</td></tr>
          ) : rows.map((row, index) => (
            <tr key={row.id ?? index}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row, index) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

