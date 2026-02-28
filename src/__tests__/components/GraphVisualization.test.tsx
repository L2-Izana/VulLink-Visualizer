import React from 'react';
import { render, screen } from '@testing-library/react';
import GraphVisualization from '../../components/GraphVisualization';

// Mock the react-force-graph-2d component
jest.mock('react-force-graph-2d', () => {
  return function MockForceGraph2D(props: any) {
    return (
      <div data-testid="mock-force-graph">
        <button 
          data-testid="mock-node-click" 
          onClick={() => props.onNodeClick({ 
            id: 'test-node-1', 
            label: 'TestNode', 
            properties: { name: 'Test Node', description: 'A test node' } 
          })}
        >
          Mock Node Click
        </button>
      </div>
    );
  };
});

describe('GraphVisualization Component', () => {
  const mockData = {
    nodes: [
      { id: 'node1', label: 'Vulnerability', properties: { cveID: 'CVE-2023-1234', name: 'Test Vulnerability' } },
      { id: 'node2', label: 'Exploit', properties: { eid: 'EID-5678', name: 'Test Exploit' } }
    ],
    links: [
      { source: 'node1', target: 'node2', type: 'EXPLOITS' }
    ]
  };

  const mockOnNodeClick = jest.fn();

  beforeEach(() => {
    mockOnNodeClick.mockClear();
  });

  test('renders the graph visualization component', () => {
    render(<GraphVisualization data={mockData} onNodeClick={mockOnNodeClick} />);
    
    // Check if the force graph is rendered
    expect(screen.getByTestId('mock-force-graph')).toBeInTheDocument();
  });

  test('handles node click and passes node data to onNodeClick callback', () => {
    render(<GraphVisualization data={mockData} onNodeClick={mockOnNodeClick} />);
    
    // Simulate a node click
    const mockNodeClickButton = screen.getByTestId('mock-node-click');
    mockNodeClickButton.click();
    
    // Check if onNodeClick was called with the correct node data
    expect(mockOnNodeClick).toHaveBeenCalledTimes(1);
    expect(mockOnNodeClick).toHaveBeenCalledWith({
      id: 'test-node-1',
      label: 'TestNode',
      properties: { name: 'Test Node', description: 'A test node' }
    });
  });

  test('handles empty data gracefully', () => {
    const emptyData = { nodes: [], links: [] };
    render(<GraphVisualization data={emptyData} onNodeClick={mockOnNodeClick} />);
    
    // Should still render without errors
    expect(screen.getByTestId('mock-force-graph')).toBeInTheDocument();
  });
}); 