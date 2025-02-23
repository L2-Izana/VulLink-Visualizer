/**
 * @fileoverview Main application component that manages the Neo4j connection
 * and orchestrates the graph visualization and query interface.
 */

import React, { useState } from 'react';
import { Neo4jService } from './services/neo4jService';
import GraphVisualization from './components/GraphVisualization';
import CypherFrame from './components/CypherFrame';
import SampleVisualization from './components/SampleVisualization';
import { GraphData, NodeData, LinkData } from './types/graph';

/** Neo4j database connection configuration */
const NEO4J_CONFIG = {
  url: process.env.REACT_APP_NEO4J_URL || 'bolt://localhost:7687',
  user: process.env.REACT_APP_NEO4J_USER || 'neo4j',
  password: process.env.REACT_APP_NEO4J_PASSWORD || ''
};

const neo4jService = new Neo4jService(
  NEO4J_CONFIG.url,
  NEO4J_CONFIG.user,
  NEO4J_CONFIG.password
);

/**
 * Main App Component
 * Manages state and data flow between components
 */
const App: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  /**
   * Executes a Cypher query and updates the graph visualization
   * @param query - The Cypher query to execute
   */
  const handleRunQuery = async (query: string) => {
    setError(null);
    setWarning(null);

    try {
      if (!query.toLowerCase().includes('limit') || 
          parseInt(query.toLowerCase().split('limit')[1]) > 100) {
        setWarning('Please limit your query to 100 nodes or less using LIMIT clause. For larger datasets, please use the Download section.');
        return;
      }

      const graphData = await neo4jService.executeQuery(query);
      setGraphData(graphData);
    } catch (error: any) {
      setError(error.message || 'An error occurred while executing the query');
      console.error('Error running query:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#87CEEB',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Top area: Graph visualization */}
      <div style={{ flex: 1, position: 'relative', margin: '20px' }}>
        <GraphVisualization
          data={graphData}
          onNodeClick={(node: NodeData) => setSelectedNode(node)}
        />
      </div>

      {/* Middle area: Sample queries */}
      <SampleVisualization onQuerySelect={handleRunQuery} />

      {/* Bottom area: Cypher query editor */}
      <CypherFrame 
        runQuery={handleRunQuery}
        error={error}
        warning={warning}
      />
    </div>
  );
};

export default App;
