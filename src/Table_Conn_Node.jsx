import React from 'react';

const Table_Conn_Node = ({ 
  tableId, 
  colIndex, 
  colName, 
  isSelected, 
  connection, 
  onToggle,
  onContextMenu
}) => {
  const nodeId = `${tableId}-${colIndex}`;
  
  // Style based on state
  const connectorStyle = {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 2,
    borderStyle: 'solid',
    width: 20, height: 20, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginRight: 5, fontSize: 10, fontWeight: 'bold'
  };

  let bgColor = 'transparent';
  let borderColor = '#ddd';

  if (connection) {
    connectorStyle.backgroundColor = connection.color;
    connectorStyle.borderColor = connection.color;
    connectorStyle.transform = 'scale(1.2)';
    connectorStyle.color = '#fff';
    
    // Check if this node is start or end
    if (connection.startNode === nodeId) {
      connectorStyle.border = '2px solid #2ecc71'; // Green border
      connectorStyle.boxShadow = '0 0 5px #2ecc71';
      bgColor = 'rgba(46, 204, 113, 0.1)'; // Light Green tint
      borderColor = '#2ecc71';
    } else if (connection.endNode === nodeId) {
      connectorStyle.border = '2px solid #e74c3c'; // Red border
      connectorStyle.boxShadow = '0 0 5px #e74c3c';
      bgColor = 'rgba(231, 76, 60, 0.1)'; // Light Red tint
      borderColor = '#e74c3c';
    }
  } 
  
  if (isSelected) {
    connectorStyle.backgroundColor = '#007bff';
    connectorStyle.borderColor = '#0056b3';
    connectorStyle.transform = 'scale(1.5)';
    connectorStyle.color = '#fff';
    bgColor = '#e3f2fd'; // Override with selection color
    borderColor = '#007bff';
  }

  return (
    <div 
      className={`tc-header-cell ${isSelected ? 'selected' : ''}`}
      onClick={() => onToggle(tableId, colIndex)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, connection, nodeId)}
      id={`node-${tableId}-${colIndex}`} // ID for Xarrow
      title={colName}
      style={{
        display: 'flex', alignItems: 'center', padding: '5px', 
        borderBottom: `1px solid ${borderColor}`, cursor: 'pointer',
        backgroundColor: bgColor,
        transition: 'all 0.2s'
      }}
    >
      <div style={connectorStyle}>
        {connection ? connection.serial : (isSelected ? '✓' : '')}
      </div>
      <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12}}>
        {colName}
      </span>
    </div>
  );
};

export default Table_Conn_Node;
