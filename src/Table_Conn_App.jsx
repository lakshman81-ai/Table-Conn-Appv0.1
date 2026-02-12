import React, { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';
import Table_Conn_Table from './Table_Conn_Table';
import './Table_Conn_styles.css';

// Helper to generate unique colors
const generateColor = (seed) => {
  const colors = [
    '#e74c3c', '#8e44ad', '#3498db', '#16a085', '#f1c40f', 
    '#d35400', '#2c3e50', '#7f8c8d', '#c0392b', '#2980b9'
  ];
  return colors[seed % colors.length];
};

export default function Table_Conn_App() {
  const [tables, setTables] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [connections, setConnections] = useState([]);
  const [logs, setLogs] = useState([]);
  const [connectionCounter, setConnectionCounter] = useState(1);
  const [showLines, setShowLines] = useState(true);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState({ 
    visible: false, 
    x: 0, y: 0, 
    connectionId: null, 
    nodeId: null 
  });

  const updateXarrow = useXarrow();

  // Helper to add log
  const addLog = useCallback((message) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  }, []);

  // File Upload Handler
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach((file, index) => {
      Papa.parse(file, {
        preview: 3, 
        complete: (results) => {
          const newTable = {
            id: `table-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
            name: file.name,
            headers: results.data[0] || [],
            rows: results.data.slice(1, 3) 
          };
          setTables(prev => [...prev, newTable]);
          addLog(`Loaded ${file.name} with ${results.data[0]?.length || 0} columns.`);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          addLog(`Error parsing ${file.name}: ${error.message}`);
        }
      });
    });
  };

  // Toggle Node Selection
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

  // Create Connection Logic
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

  // Context Menu Handler
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

  // Context Menu Actions
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

  // Keyboard Listener (Space & Delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); 
        if (selectedNodes.size > 1) {
          createConnection();
        }
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedConnectionId) {
          setConnections(prev => prev.filter(c => c.id !== selectedConnectionId));
          addLog(`Deleted Connection: ${selectedConnectionId}`);
          setSelectedConnectionId(null);
        }
      } else if (e.code === 'Escape') {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, createConnection, selectedConnectionId, addLog, contextMenu]);

  // Handle Workspace Click (Deselect & Close Menu)
  const handleWorkspaceClick = (e) => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
    // Only deselect if clicking strictly on the background
    if (e.target.classList.contains('tc-workspace')) {
      setSelectedConnectionId(null);
    }
  };

  return (
    <div className="tc-container" onClick={handleWorkspaceClick}>
      {/* Header */}
      <div className="tc-header">
        <h2>Table Connector</h2>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
           <span style={{fontSize: 14, color: '#ccc'}}>
            {selectedConnectionId ? `Selected: ${selectedConnectionId} (Press Del to delete)` : 'Select nodes & press SPACE to group'}
          </span>
          
          <button 
            className="tc-btn"
            onClick={() => setShowLines(!showLines)}
            style={{backgroundColor: showLines ? '#28a745' : '#6c757d', padding: '8px 12px', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}
          >
            {showLines ? 'Hide Lines' : 'Connect'}
          </button>

          <label className="tc-upload-btn" style={{padding: '8px 12px', backgroundColor: '#007bff', color: 'white', borderRadius: 4, cursor: 'pointer'}}>
            Load CSVs
            <input 
              type="file" 
              accept=".csv" 
              multiple 
              onChange={handleFileUpload} 
              style={{display: 'none'}}
            />
          </label>
        </div>
      </div>

      <div className="tc-main" style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        {/* Workspace */}
        <Xwrapper>
          <div 
            className="tc-workspace" 
            onScroll={updateXarrow}
            style={{flex: 1, position: 'relative', overflow: 'auto'}}
          >
            {tables.length === 0 && (
              <div style={{textAlign: 'center', marginTop: 50, color: '#666'}}>
                <h3>No Tables Loaded</h3>
                <p>Select CSV files to begin.</p>
              </div>
            )}

            <div style={{display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start', paddingBottom: 100, padding: 20}}>
              {tables.map(table => (
                <Table_Conn_Table
                  key={table.id}
                  table={table}
                  selectedNodes={selectedNodes}
                  connections={connections}
                  onNodeClick={handleNodeClick}
                  onNodeContextMenu={handleNodeContextMenu}
                />
              ))}
            </div>

            {/* Render Lines */}
            {showLines && connections.map(conn => {
              if (conn.nodes.length < 2) return null;

              return conn.nodes.slice(0, -1).map((node, i) => {
                const startId = `node-${node.id}`;
                const endId = `node-${conn.nodes[i+1].id}`;
                const isSelected = selectedConnectionId === conn.id;

                return (
                  <Xarrow
                    key={`${conn.id}-${i}`}
                    start={startId}
                    end={endId}
                    color={conn.color}
                    strokeWidth={isSelected ? 5 : 3}
                    headSize={6}
                    curveness={0.4}
                    path="smooth"
                    startAnchor="bottom"
                    endAnchor="top"
                    labels={conn.instructions ? { middle: <div style={{background: 'white', padding: 2, border: '1px solid #ccc', fontSize: 10}}>{conn.instructions}</div> } : null}
                    passProps={{
                      onClick: (e) => {
                        e.stopPropagation(); 
                        setSelectedConnectionId(conn.id);
                        addLog(`Selected Connection: ${conn.id}`);
                      },
                      style: { cursor: 'pointer' }
                    }}
                  />
                );
              });
            })}
          </div>
        </Xwrapper>

        {/* Log Panel */}
        <div className="tc-log-panel" style={{width: 300, backgroundColor: '#222', color: '#0f0', borderLeft: '1px solid #555', display: 'flex', flexDirection: 'column'}}>
          <div style={{fontWeight: 'bold', padding: 10, borderBottom: '1px solid #444'}}>
            Active Connections
          </div>
          <div style={{flex: 1, overflowY: 'auto', padding: 10}}>
            {connections.length === 0 ? <div style={{fontStyle: 'italic', color: '#888'}}>No connections yet</div> : null}
            {connections.map(conn => (
              <div key={conn.id} style={{
                marginBottom: 10, padding: 8, 
                backgroundColor: '#2a2a2a', borderLeft: `4px solid ${conn.color}`,
                fontSize: 12
              }}>
                <div style={{fontWeight: 'bold', color: '#fff'}}>{conn.id} (Serial: {conn.serial})</div>
                <div style={{color: '#ccc', margin: '2px 0'}}>
                  Start: {conn.startNode ? 'Set' : 'Not set'} | End: {conn.endNode ? 'Set' : 'Not set'}
                </div>
                <div style={{color: '#aaa'}}>Nodes: {conn.nodes.length}</div>
                {conn.instructions && <div style={{color: '#4db6ac', marginTop: 2}}>"{conn.instructions}"</div>}
              </div>
            ))}
          </div>

          <div style={{fontWeight: 'bold', padding: 5, borderBottom: '1px solid #444', borderTop: '1px solid #444'}}>
            System Log
          </div>
          <div style={{height: 150, overflowY: 'auto', fontSize: 11, fontFamily: 'monospace', padding: 5}}>
            {logs.map((log, i) => (
              <div key={i} style={{marginBottom: 2}}>{log}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div style={{
          position: 'absolute',
          top: contextMenu.y,
          left: contextMenu.x,
          backgroundColor: '#333',
          color: 'white',
          border: '1px solid #555',
          borderRadius: 4,
          padding: 5,
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          <div 
            className="tc-context-item"
            onClick={handleSetStart}
          >
            Set as Start Node
          </div>
          <div 
            className="tc-context-item"
            onClick={handleSetEnd}
          >
            Set as End Node
          </div>
          <div 
            className="tc-context-item"
            onClick={handleAddInstruction}
          >
            Add Instructions...
          </div>
        </div>
      )}
    </div>
  );
}
