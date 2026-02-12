import React from 'react';
import Table_Conn_Node from './Table_Conn_Node';

const Table_Conn_Table = ({ 
  table, 
  onNodeClick, 
  onNodeContextMenu,
  selectedNodes, 
  connections 
}) => {
  const { id, name, headers, rows } = table;

  return (
    <div className="tc-table-wrapper" style={{width: 300, position: 'relative', margin: 20}}>
      <div className="tc-table-header" style={{
        backgroundColor: '#333', 
        color: 'white', 
        padding: 8, 
        borderTopLeftRadius: 6, 
        borderTopRightRadius: 6,
        fontWeight: 'bold',
        fontSize: 14
      }}>
        {name}
      </div>
      
      <div className="tc-grid" style={{
        border: '1px solid #ccc', 
        borderBottomLeftRadius: 6, 
        borderBottomRightRadius: 6,
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        {/* Header Row */}
        <div className="tc-row" style={{display: 'flex', borderBottom: '2px solid #ccc', backgroundColor: '#f8f9fa'}}>
          {headers.map((header, index) => {
            const nodeId = `${id}-${index}`;
            const isSelected = selectedNodes.has(nodeId);
            
            // Check if this node is part of any connection
            const connection = connections.find(c => 
              c.nodes.some(n => n.id === nodeId)
            );

            return (
              <div key={index} style={{flex: 1, minWidth: 0, padding: 2}}>
                <Table_Conn_Node
                  tableId={id}
                  colIndex={index}
                  colName={header}
                  isSelected={isSelected}
                  connection={connection}
                  onToggle={onNodeClick} 
                  onContextMenu={onNodeContextMenu}
                />
              </div>
            );
          })}
        </div>

        {/* Data Rows */}
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="tc-row" style={{display: 'flex', borderBottom: '1px solid #eee'}}>
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className="tc-cell" style={{
                flex: 1, minWidth: 0, padding: 5, fontSize: 11, 
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }} title={cell}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table_Conn_Table;
