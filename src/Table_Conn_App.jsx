import React, { useState, useEffect } from 'react';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';
import Table_Conn_Table from './Table_Conn_Table';
import './Table_Conn_styles.css';
import useLogs from './hooks/useLogs';
import useTables from './hooks/useTables';
import useConnections from './hooks/useConnections';

export default function Table_Conn_App() {
  const { logs, addLog } = useLogs();
  const { tables, handleFileUpload } = useTables(addLog);
  const {
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
  } = useConnections(tables, addLog);

  const [showLines, setShowLines] = useState(true);
  const updateXarrow = useXarrow();

  // Keyboard Listener (Space & Delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); 
        if (selectedNodes.size > 1) {
          createConnection();
        }
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        deleteConnection();
      } else if (e.code === 'Escape') {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, createConnection, deleteConnection, contextMenu, setContextMenu]);

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
          <div style={{
            fontSize: 10, color: '#666', textAlign: 'right', padding: 5, borderTop: '1px solid #444'
          }}>
            ver.12-02-26 time 19.25
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
