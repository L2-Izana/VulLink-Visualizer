import React from 'react';
import { render, act } from '@testing-library/react';
import App from '../../App';

// Mock the Neo4jService
jest.mock('../../services/neo4jService', () => {
  return {
    Neo4jService: jest.fn().mockImplementation(() => {
      return {
        executeQuery: jest.fn().mockResolvedValue({ nodes: [], links: [] }),
        executeRawQuery: jest.fn().mockImplementation((query) => {
          if (query === 'CALL db.schema.visualization()') {
            return Promise.resolve([{
              nodes: [
                { labels: ['Vulnerability'], properties: { name: 'Vulnerability' } },
                { labels: ['Exploit'], properties: { name: 'Exploit' } },
                { labels: ['Product'], properties: { name: 'Product' } },
                { labels: ['Vendor'], properties: { name: 'Vendor' } }
              ],
              relationships: ['EXPLOITS', 'AFFECTS', 'BELONGS_TO']
            }]);
          }
          return Promise.resolve([]);
        })
      };
    })
  };
});

// Mock the graph visualization component
jest.mock('../../components/GraphVisualization', () => {
  return function MockGraphVisualization(props: any) {
    // Capture the data passed to the component for testing
    return (
      <div data-testid="mock-graph-visualization">
        <div data-testid="graph-data">{JSON.stringify(props.data)}</div>
      </div>
    );
  };
});

// Mock other components
jest.mock('../../components/CypherFrame', () => {
  return function MockCypherFrame() {
    return <div data-testid="mock-cypher-frame">Cypher Frame</div>;
  };
});

jest.mock('../../components/ToolsPanel/ToolsPanel', () => {
  return function MockToolsPanel(props: any) {
    // Expose the onQuerySelect function for testing
    return (
      <div data-testid="mock-tools-panel">
        <button
          data-testid="trigger-schema-visualization"
          onClick={() => props.onQuerySelect('CALL db.schema.visualization()', 'schema')}
        >
          Trigger Schema Visualization
        </button>
      </div>
    );
  };
});

describe('Schema Visualization', () => {
  test('processes schema data correctly', async () => {
    const rendered = render(<App />);
    
    // Use act to handle async updates
    await act(async () => {
      // Trigger schema visualization
      const triggerButton = rendered.getByTestId('trigger-schema-visualization');
      triggerButton.click();
    });
    
    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Get the data passed to the GraphVisualization component
    const graphDataElement = rendered.container.querySelector('[data-testid="graph-data"]');
    expect(graphDataElement).not.toBeNull();
    
    // Use type assertion since we've verified it's not null
    const graphData = JSON.parse((graphDataElement as HTMLElement).textContent || '{}');
    
    // Debug what's in graphData
    console.log('DEBUG graphData:', JSON.stringify(graphData, null, 2));
    
    // Check that nodes were processed correctly
    expect(graphData.nodes.length).toBeGreaterThan(0);
    expect(graphData.nodes.some((node: any) => node.id.includes('Vulnerability'))).toBeTruthy();
    expect(graphData.nodes.some((node: any) => node.id.includes('Exploit'))).toBeTruthy();
    expect(graphData.nodes.some((node: any) => node.id.includes('Product'))).toBeTruthy();
    
    // Check that each node has proper structure with schemaNodeType property
    graphData.nodes.forEach((node: any) => {
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('label');
      expect(node).toHaveProperty('properties');
      expect(node.properties).toHaveProperty('schemaNodeType', 'label');
    });
    
    // Check that relationships were processed correctly
    expect(graphData.links.length).toBeGreaterThan(0);
    
    // Check that each link has proper structure
    graphData.links.forEach((link: any) => {
      expect(link).toHaveProperty('source');
      expect(link).toHaveProperty('target');
      expect(link).toHaveProperty('type');
      expect(['EXPLOITS', 'AFFECTS', 'BELONGS_TO']).toContain(link.type);
    });
  });
}); 