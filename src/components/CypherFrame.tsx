/**
 * @fileoverview A React component that provides a Cypher query interface.
 * Allows users to input and execute Cypher queries against Neo4j database.
 */

import React, { useState } from 'react';

/** Props for the CypherFrame component */
interface CypherFrameProps {
  /** Callback function to execute the query */
  runQuery: (query: string) => void;
  /** Error message to display if query fails */
  error?: string | null;
  /** Warning message to display for query limitations */
  warning?: string | null;
}

/**
 * CypherFrame Component
 * Provides a textarea for Cypher query input and execution
 */
const CypherFrame: React.FC<CypherFrameProps> = ({ runQuery, error, warning }) => {
  const [query, setQuery] = useState('MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50');

  const handleRunQuery = () => {
    runQuery(query);
  };

  return (
    <div
      style={{
        margin: '20px',
        padding: '15px',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        borderRadius: '8px',
      }}
    >
      <h2 style={{ color: '#333' }}>Cypher Query</h2>
      {error && (
        <div style={{
          padding: '10px',
          marginBottom: '10px',
          backgroundColor: '#ffebee',
          border: '1px solid #ffcdd2',
          borderRadius: '4px',
          color: '#c62828'
        }}>
          Error: {error}
        </div>
      )}
      {warning && (
        <div style={{
          padding: '10px',
          marginBottom: '10px',
          backgroundColor: '#fff3e0',
          border: '1px solid #ffe0b2',
          borderRadius: '4px',
          color: '#e65100'
        }}>
          {warning}
        </div>
      )}
      <textarea
        rows={4}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your Cypher query here"
        style={{
          width: '100%',
          fontFamily: 'monospace',
          fontSize: '14px',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          boxSizing: 'border-box',
        }}
      />
      <br />
      <button
        onClick={handleRunQuery}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
      >
        Run Query
      </button>
    </div>
  );
};

export default CypherFrame;
