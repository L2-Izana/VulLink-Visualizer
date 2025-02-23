import React, { useState } from 'react';
import neo4j, { Driver, Session } from 'neo4j-driver';
import GraphVisualization from './components/GraphVisualization';
import CypherFrame from './components/CypherFrame';
import { GraphData, NodeData, LinkData } from './types/graph';

// Connect to your local Neo4j database
const driver: Driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'Vanly180705!')
);

const App: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleRunQuery = async (query: string) => {
    const session: Session = driver.session();
    const nodesMap = new Map<string, NodeData>();
    const links: LinkData[] = [];
    setError(null);
    setWarning(null);

    try {
      // Check query limit
      if (!query.toLowerCase().includes('limit') || 
          parseInt(query.toLowerCase().split('limit')[1]) > 100) {
        setWarning('Please limit your query to 100 nodes or less using LIMIT clause. For larger datasets, please use the Download section.');
        return;
      }

      const result = await session.run(query);
      result.records.forEach(record => {
        record.forEach(value => {
          // Check if the value is a node
          if (value.identity && value.labels) {
            const nodeId = value.identity.toString();
            if (!nodesMap.has(nodeId)) {
              nodesMap.set(nodeId, {
                id: nodeId,
                label: value.labels[0],
                properties: value.properties,
              });
            }
          }
          // Check if the value is a relationship
          if (value.start && value.end) {
            links.push({
              source: value.start.toString(),
              target: value.end.toString(),
              type: value.type,
            });
          }
        });
      });
      setGraphData({ nodes: Array.from(nodesMap.values()), links });
    } catch (error: any) {
      setError(error.message || 'An error occurred while executing the query');
      console.error('Error running query:', error);
    } finally {
      await session.close();
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
