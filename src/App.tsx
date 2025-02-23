/**
 * @fileoverview Main application component that manages the Neo4j connection
 * and orchestrates the graph visualization and query interface.
 */

import React, { useState } from 'react';
import { Neo4jService } from './services/neo4jService';
import GraphVisualization from './components/GraphVisualization';
import CypherFrame from './components/CypherFrame';
import ToolsPanel from './components/ToolsPanel/ToolsPanel';
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

interface QueryResult {
  graphData?: GraphData;
  downloadData?: any[];
}

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
   * Executes different types of Cypher queries based on the purpose
   * @param query - The Cypher query to execute
   * @param purpose - The purpose of the query (visualization, download, etc.)
   */
  const handleRunQuery = async (query: string, purpose: 'visualization' | 'download' = 'visualization'): Promise<QueryResult> => {
    setError(null);
    setWarning(null);

    try {
      switch (purpose) {
        case 'visualization':
          if (!query.toLowerCase().includes('limit') || 
              parseInt(query.toLowerCase().split('limit')[1]) > 100) {
            setWarning('Please limit your query to 100 nodes or less using LIMIT clause.');
            return {};
          }
          const visualData = await neo4jService.executeQuery(query);
          setGraphData(visualData);
          return { graphData: visualData };

        case 'download':
          // if (!query.toLowerCase().includes('limit')) {
          //   query += ' LIMIT 1000'; // Default limit for downloads
          // }
          const downloadData = await neo4jService.executeRawQuery(query);
          return { downloadData };

        default:
          throw new Error('Invalid query purpose');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while executing the query');
      console.error('Error running query:', error);
      throw error;
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

      {/* Middle area: Tools panel with all sections */}
      <ToolsPanel onQuerySelect={handleRunQuery} />

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
