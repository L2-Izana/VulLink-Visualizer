import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the Neo4jService
jest.mock('../services/neo4jService', () => {
  return {
    Neo4jService: jest.fn().mockImplementation(() => {
      return {
        executeQuery: jest.fn().mockResolvedValue({ nodes: [], links: [] }),
        executeRawQuery: jest.fn().mockResolvedValue([])
      };
    })
  };
});

// Mock child components to simplify testing
jest.mock('../components/GraphVisualization', () => {
  return function MockGraphVisualization(props: any) {
    return <div data-testid="mock-graph-visualization">Graph Visualization</div>;
  };
});

jest.mock('../components/CypherFrame', () => {
  return function MockCypherFrame(props: any) {
    return <div data-testid="mock-cypher-frame">Cypher Frame</div>;
  };
});

jest.mock('../components/ToolsPanel/ToolsPanel', () => {
  return function MockToolsPanel(props: any) {
    return <div data-testid="mock-tools-panel">Tools Panel</div>;
  };
});

describe('App Component', () => {
  test('renders main application components', () => {
    render(<App />);
    
    // Check if the main header is displayed
    expect(screen.getByText(/vullink: an intelligent dynamic open-access vulnerability graph database/i)).toBeInTheDocument();
    
    // Check if main components are rendered
    expect(screen.getByTestId('mock-graph-visualization')).toBeInTheDocument();
    expect(screen.getByTestId('mock-cypher-frame')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tools-panel')).toBeInTheDocument();
  });
});

// Add test for utility functions in App
describe('App Utility Functions', () => {
  // We can't directly test the private functions in App, but we could extract them
  // and test them if needed. This is a placeholder for such tests.
  
  test('placeholder for future utility function tests', () => {
    expect(true).toBeTruthy();
  });
}); 