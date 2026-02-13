import { useState, useCallback } from 'react';

// Helper to generate unique colors
const generateColor = (seed) => {
  const colors = [
    '#e74c3c', '#8e44ad', '#3498db', '#16a085', '#f1c40f',
    '#d35400', '#2c3e50', '#7f8c8d', '#c0392b', '#2980b9'
  ];
  return colors[seed % colors.length];
};

export default function useConnections(tables, addLog) {
  const [connections, setConnections] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [connectionCounter, setConnectionCounter] = useState(1);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0, y: 0,
    connectionId: null,
    nodeId: null
  });

  const handleNodeClick = (tableId, colIndex) => {
    const nodeId = `${tableId}-${colIndex}`;
    setSelectedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
    // Close context menu if open
    if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
  };

  const createConnection = useCallback(() => {
    if (selectedNodes.size < 2) return;

    const newConnId = `C${connectionCounter}`;
    const newNodes = Array.from(selectedNodes).map(nodeId => {
      const [tableId, colIndex] = nodeId.split('-');
      const table = tables.find(t => t.id === tableId);
      const headerName = table ? table.headers[parseInt(colIndex)] : 'Unknown';

      return {
        id: nodeId,
        tableId,
        colIndex: parseInt(colIndex),
        tableName: table ? table.name : 'Unknown',
        headerName
      };
    });

    const newConnection = {
      id: newConnId,
      serial: connectionCounter,
      color: generateColor(connectionCounter),
      nodes: newNodes,
      instructions: '',
      startNode: null,
      endNode: null
    };

    setConnections(prev => [...prev, newConnection]);
    setConnectionCounter(prev => prev + 1);
    setSelectedNodes(new Set());

    const names = newNodes.map(n => `${n.tableName}(${n.headerName})`).join(', ');
    addLog(`Group Created: ${newConnId} linking [${names}]`);
  }, [selectedNodes, connectionCounter, tables, addLog]);

  // Context Menu Handlers
  const handleNodeContextMenu = (e, connection, nodeId) => {
    e.preventDefault();
    if (!connection) return; // Only show context menu if node is part of a connection

    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      connectionId: connection.id,
      nodeId: nodeId
    });
  };

  const handleSetStart = () => {
    setConnections(prev => prev.map(c =>
      c.id === contextMenu.connectionId ? { ...c, startNode: contextMenu.nodeId } : c
    ));
    setContextMenu({ ...contextMenu, visible: false });
    addLog(`Connection ${contextMenu.connectionId}: Start Node set.`);
  };

  const handleSetEnd = () => {
    setConnections(prev => prev.map(c =>
      c.id === contextMenu.connectionId ? { ...c, endNode: contextMenu.nodeId } : c
    ));
    setContextMenu({ ...contextMenu, visible: false });
    addLog(`Connection ${contextMenu.connectionId}: End Node set.`);
  };

  const handleAddInstruction = () => {
    const instruction = prompt("Enter instruction for this connection:");
    if (instruction !== null) {
      setConnections(prev => prev.map(c =>
        c.id === contextMenu.connectionId ? { ...c, instructions: instruction } : c
      ));
      addLog(`Connection ${contextMenu.connectionId}: Instruction updated.`);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const deleteConnection = useCallback(() => {
     if (selectedConnectionId) {
          setConnections(prev => prev.filter(c => c.id !== selectedConnectionId));
          addLog(`Deleted Connection: ${selectedConnectionId}`);
          setSelectedConnectionId(null);
        }
  }, [selectedConnectionId, addLog]);

  return {
    connections,
    selectedNodes,
    selectedConnectionId,
    setSelectedConnectionId,
    contextMenu,
    setContextMenu,
    handleNodeClick,
    createConnection,
    handleNodeContextMenu,
    handleSetStart,
    handleSetEnd,
    handleAddInstruction,
    deleteConnection
  };
}
