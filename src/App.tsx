/**
 * @fileoverview Main application component that manages the Neo4j connection
 * and orchestrates the graph visualization and query interface.
 */

import React, { useState, useCallback } from 'react';
import { Neo4jService } from './services/neo4jService';
import GraphVisualization from './components/GraphVisualization';
import CypherFrame from './components/CypherFrame';
import ToolsPanel from './components/ToolsPanel/ToolsPanel';
import { GraphData, NodeData, LinkData } from './types/graph';
import { PCA } from 'ml-pca';

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
  const [selectedQuery, setSelectedQuery] = useState<string | undefined>(undefined);


  /**
 * Checks Cypher queries to ensure they don't modify the database.
 * @param query - The Cypher query to validate
 * @returns boolean - true if safe, false otherwise
 */
  const isQuerySafe = (query: string): boolean => {
    const forbiddenPatterns = [
      /\bCREATE\b/i,
      /\bMERGE\b/i,
      /\bSET\b/i,
      /\bDELETE\b/i,
      /\bREMOVE\b/i,
      /\bDETACH\b/i,
      /\bDROP\b/i,
      /\bCALL\s+db\.(?!.*schema|.*labels|.*relationshipTypes|.*constraints)/i,
    ];

    return !forbiddenPatterns.some((pattern) => pattern.test(query));
  };

  // Validate Graph Data
  const isValidGraphData = (data: any): data is GraphData => {
    return (
      data &&
      Array.isArray(data.nodes) &&
      Array.isArray(data.links) &&
      data.nodes.every((node: any) => node.id && node.label) &&
      data.links.every((link: any) => link.source && link.target)
    );
  };

  // Usage in your existing function:
  const handleRunQuery = async (
    query: string,
    purpose: 'visualization' | 'download' | 'llm' | 'schema' = 'visualization'
  ): Promise<QueryResult> => {
    setError(null);
    setWarning(null);

    if (!isQuerySafe(query)) {
      setWarning('Modification queries are not allowed for security reasons');
      return { graphData: { nodes: [], links: [] } };
    }

    try {
      switch (purpose) {
        case 'schema':
          try {
            const result = await neo4jService.executeRawQuery(query);
            
            if (result && result.length > 0) {
              // Create a simplified schema graph with just the node types
              const schemaData: GraphData = { nodes: [], links: [] };
              const nodeLabels = new Set<string>();
              const relationshipTypes = new Set<string>();
              
              // Extract node labels from result
              if (result[0].nodes && Array.isArray(result[0].nodes)) {
                result[0].nodes.forEach((node: any) => {
                  if (node.labels && Array.isArray(node.labels)) {
                    node.labels.forEach((label: string) => nodeLabels.add(label));
                  }
                });
              }
              
              // Extract relationship types from result
              if (result[0].relationships && Array.isArray(result[0].relationships)) {
                result[0].relationships.forEach((rel: any) => {
                  if (typeof rel === 'string') {
                    relationshipTypes.add(rel);
                  }
                });
              }
              
              // Create schema nodes (one per label)
              Array.from(nodeLabels).forEach(label => {
                schemaData.nodes.push({
                  id: `schema_${label}`,
                  label: label,
                  properties: { 
                    schemaNodeType: 'label',
                    name: label 
                  }
                });
              });
              
              // Create schema relationships in a circle layout
              const nodes = schemaData.nodes;
              if (nodes.length >= 2) {
                // Place nodes in a circle
                const radius = 200;
                const angleStep = (2 * Math.PI) / nodes.length;
                
                nodes.forEach((node, i) => {
                  // Add x, y positions for initial layout
                  (node as any).x = radius * Math.cos(i * angleStep);
                  (node as any).y = radius * Math.sin(i * angleStep);
                });
                
                // Define meaningful relationship pairs based on known database structure
                // This represents the actual graph schema more accurately
                const relationshipPairs: {rel: string, source: string, target: string}[] = [
                  { rel: 'EXPLOITS', source: 'Exploit', target: 'Vulnerability' },
                  { rel: 'BELONGS_TO', source: 'Product', target: 'Vendor' },
                  { rel: 'AFFECTS', source: 'Vulnerability', target: 'Product' },
                  { rel: 'REFERS_TO', source: 'Vulnerability', target: 'Domain' },
                  { rel: 'EXAMPLE_OF', source: 'Vulnerability', target: 'Weakness' },
                  { rel: 'WRITES', source: 'Author', target: 'Exploit' }
                ];
                
                // Create links based on known relationships
                relationshipPairs.forEach(({ rel, source, target }) => {
                  // Only create links if both source and target node types exist
                  const sourceNode = schemaData.nodes.find(n => n.label === source);
                  const targetNode = schemaData.nodes.find(n => n.label === target);
                  
                  if (sourceNode && targetNode) {
                    schemaData.links.push({
                      source: sourceNode.id,
                      target: targetNode.id,
                      type: rel
                    });
                  }
                });
              }
              
              setGraphData(schemaData);
              return { graphData: schemaData };
            }
            
            setWarning('Schema visualization did not return expected data format');
            return { graphData: { nodes: [], links: [] } };
          } catch (error) {
            console.error('Error processing schema visualization:', error);
            setWarning('Error processing schema visualization');
            return { graphData: { nodes: [], links: [] } };
          }
          
        case 'visualization':
          if (!query.toLowerCase().includes('limit')) {
            setWarning('Default limit is 200 nodes, or use LIMIT clause to limit your own query');
            query += ' LIMIT 200';
          } else {
            const limitMatch = query.match(/limit\s+(\d+)/i);
            if (limitMatch && parseInt(limitMatch[1]) > 200) {
              setWarning('Limit your query to 200 nodes');
              query = query.replace(/limit\s+\d+/i, 'LIMIT 200');
            }
          }
          const visualData = await neo4jService.executeQuery(query);
          if (!isValidGraphData(visualData)) {
            setWarning('Query did not return valid graph data and was ignored.');
            return { graphData: { nodes: [], links: [] } };
          }
          setGraphData(visualData);
          return { graphData: visualData };

        case 'download': {
          const downloadData = await neo4jService.executeRawQuery(query);
          return { downloadData };
        }

        case 'llm': {
          const backendUrl = `${CONFIG.backend.url}/llm_embedding?${query}`;
          const dim_size = parseInt(query.split('dim_size=')[1]);
          const response = await fetch(backendUrl);
          if (!response.ok) {
            setWarning('Failed to fetch LLM embeddings');
            return { llmData: undefined };
          }

          const data = await response.json();
          const embeddings = data.embeddings;

          if (dim_size < 32) {
            try {
              const pca = new (PCA as any)(embeddings);
              const reducedData = pca.predict(embeddings, { nComponents: dim_size });
              data.embeddings = reducedData.data;
            } catch (e) {
              const matrix = embeddings.map((row: any) => Array.isArray(row) ? row : [row]);
              const pca = new (PCA as any)(matrix);
              const reducedData = pca.predict(matrix, { nComponents: dim_size });
              data.embeddings = reducedData.data;
            }
          }
          return { llmData: data };
        }

        default:
          setWarning('Invalid query purpose');
          return { graphData: { nodes: [], links: [] } };
      }
    } catch (error: any) {
      setWarning(error.message || 'An error occurred while executing the query');
      console.error('Error running query:', error);
      return { graphData: { nodes: [], links: [] } };
    }
  };
  // This function handles the query selection from the tools panel
  // and updates the CypherFrame without executing the query yet
  const handleToolsQuerySelect = useCallback((query: string) => {
    setSelectedQuery(query);
  }, []);

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
          overflow: 'hidden',
          maxHeight: '100%' // Ensure it doesn't exceed viewport height
        }}>
          <header style={{
            backgroundColor: '#4B0082',
            color: 'white',
            padding: '15px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            flex: '0 0 auto' // Don't grow or shrink
          }}>
            <h1 style={{ margin: 0, fontSize: '1.6rem' }}>
              VulLink: An Intelligent Dynamic Open-Access Vulnerability Graph Database
            </h1>
          </header>

          {/* Graph visualization container */}
          <div style={{
            flex: '1 1 auto',
            position: 'relative',
            margin: '20px 20px 10px 20px', // Reduced bottom margin
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            minHeight: '60%', // Use percentage instead of vh
            height: 'calc(100% - 220px)' // Explicit calculation of height
          }}>
            <GraphVisualization
              data={graphData}
              onNodeClick={(node: NodeData) => setSelectedNode(node)}
            />
          </div>

          {/* Cypher query editor */}
          <div style={{
            flex: '0 0 auto',
            padding: '0 20px 20px',
            height: '180px', // Fixed height
            maxHeight: '180px'
          }}>
            <CypherFrame
              runQuery={handleRunQuery}
              error={error}
              warning={warning}
              defaultQuery={selectedQuery}
            />
          </div>
        </div>

        {/* Right side: Tools panel */}
        <div style={{
          flex: '0 0 auto',
          overflow: 'visible',
          borderLeft: '1px solid #d0e4ff',
          backgroundColor: 'white',
          transition: 'flex 0.3s ease'
        }}>
          <ToolsPanel
            onQuerySelect={(query, purpose) => {
              // If purpose is not provided, just update the CypherFrame
              if (!purpose) {
                handleToolsQuerySelect(query);
                return Promise.resolve({});
              }
              // Otherwise, also execute the query
              return handleRunQuery(query, purpose);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
