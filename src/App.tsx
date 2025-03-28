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

/** Configuration for services */
const CONFIG = {
  neo4j: {
    url: process.env.REACT_APP_NEO4J_URL || 'bolt://localhost:7687',
    user: process.env.REACT_APP_NEO4J_USER || 'neo4j',
    password: process.env.REACT_APP_NEO4J_PASSWORD || 'neo4j'
  },
  backend: {
    url: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'
  }
};

const neo4jService = new Neo4jService(
  CONFIG.neo4j.url,
  CONFIG.neo4j.user,
  CONFIG.neo4j.password
);

interface QueryResult {
  graphData?: GraphData;
  downloadData?: any[];
  llmData?: Blob;  // Add this for LLM response data
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
  const handleRunQuery = async (
    query: string,
    purpose: 'visualization' | 'download' | 'llm' = 'visualization'
  ): Promise<QueryResult> => {
    setError(null);
    setWarning(null);

    try {
      switch (purpose) {
        case 'visualization':
          if (
            !query.toLowerCase().includes('limit') ||
            parseInt(query.toLowerCase().split('limit')[1]) > 100
          ) {
            setWarning('Please limit your query to 100 nodes or less using LIMIT clause.');
            return {};
          }
          const visualData = await neo4jService.executeQuery(query);
          setGraphData(visualData);
          return { graphData: visualData };

        case 'download': {
          const downloadData = await neo4jService.executeRawQuery(query);
          return { downloadData };
        }

        case 'llm': {
          const backendUrl = `${CONFIG.backend.url}/llm_embedding?${query}`;
          console.log('LLM Request URL:', backendUrl);
          const response = await fetch(backendUrl);
          if (!response.ok) {
            throw new Error('Failed to fetch LLM embeddings');
          }
          const data = await response.json();
          console.log('LLM Data:', data);
          return { llmData: data };
        }

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
        backgroundColor: '#f0f8ff', // Light blue background
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* Main content area with graph on left and tools on right */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Left side: Graph visualization and Cypher query */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 70%',
          overflow: 'hidden'
        }}>
          <header style={{
            backgroundColor: '#4B0082', // Dark purple header instead of blue
            color: 'white',
            padding: '15px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem' }}>
              VulLink: An Intelligent Dynamic Open-Access Vulnerability Graph Database
            </h1>
          </header>
          {/* Graph visualization */}
          <div style={{
            flex: 1,
            position: 'relative',
            margin: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <GraphVisualization
              data={graphData}
              onNodeClick={(node: NodeData) => setSelectedNode(node)}
            />
          </div>

          {/* Cypher query editor */}
          <div style={{ flex: '0 0 auto', padding: '0 20px 20px' }}>
            <CypherFrame
              runQuery={handleRunQuery}
              error={error}
              warning={warning}
            />
          </div>
        </div>

        {/* Right side: Tools panel */}
        <div style={{
          flex: '0 0 30%',
          maxWidth: '400px',
          overflow: 'auto',
          borderLeft: '1px solid #d0e4ff',
          backgroundColor: 'white' // White background for tools panel
        }}>
          <ToolsPanel onQuerySelect={handleRunQuery} />
        </div>
      </div>
    </div>
  );
};

export default App;
