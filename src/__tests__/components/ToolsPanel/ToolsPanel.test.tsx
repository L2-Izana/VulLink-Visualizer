import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToolsPanel from '../../../components/ToolsPanel/ToolsPanel';

// Create mock components to isolate ToolsPanel testing
jest.mock('../../../components/ToolsPanel/SampleVisualization', () => {
  return function MockSampleVisualization() {
    return <div data-testid="mock-sample-visualization">Sample Visualization Mock</div>;
  };
});

jest.mock('../../../components/ToolsPanel/SubgraphQA', () => {
  return {
    SubgraphQA: function MockSubgraphQA() {
      return <div data-testid="mock-subgraph-qa">Subgraph QA Mock</div>;
    }
  };
});

jest.mock('../../../components/ToolsPanel/LLMIntegration', () => {
  return function MockLLMIntegration() {
    return <div data-testid="mock-llm-integration">LLM Integration Mock</div>;
  };
});

jest.mock('../../../components/ToolsPanel/NodeDownload', () => {
  return function MockNodeDownload() {
    return <div data-testid="mock-node-download">Node Download Mock</div>;
  };
});

jest.mock('../../../components/ToolsPanel/RelationshipDownload', () => {
  return function MockRelationshipDownload() {
    return <div data-testid="mock-relationship-download">Relationship Download Mock</div>;
  };
});

describe('ToolsPanel Component', () => {
  const mockOnQuerySelect = jest.fn();

  beforeEach(() => {
    mockOnQuerySelect.mockClear();
  });

  test('renders header and tab buttons', () => {
    render(<ToolsPanel onQuerySelect={mockOnQuerySelect} />);
    
    // Check if header is displayed
    expect(screen.getByText('Tools')).toBeInTheDocument();
    
    // Check if tab buttons are displayed
    expect(screen.getByText('Graph Explorer')).toBeInTheDocument();
    expect(screen.getByText('Q&A Demo')).toBeInTheDocument();
    expect(screen.getByText('LLM Integration')).toBeInTheDocument();
    expect(screen.getByText('Node Download')).toBeInTheDocument();
    expect(screen.getByText('Relationship Download')).toBeInTheDocument();
  });

  test('shows SampleVisualization component by default', () => {
    render(<ToolsPanel onQuerySelect={mockOnQuerySelect} />);
    
    // Check if SampleVisualization is shown by default
    expect(screen.getByTestId('mock-sample-visualization')).toBeInTheDocument();
    
    // Other components should not be shown
    expect(screen.queryByTestId('mock-subgraph-qa')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-llm-integration')).not.toBeInTheDocument();
  });

  test('clicking tab buttons switches the visible component', () => {
    render(<ToolsPanel onQuerySelect={mockOnQuerySelect} />);
    
    // Click on "Q&A Demo" tab
    fireEvent.click(screen.getByText('Q&A Demo'));
    expect(screen.getByTestId('mock-subgraph-qa')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-sample-visualization')).not.toBeInTheDocument();
    
    // Click on "LLM Integration" tab
    fireEvent.click(screen.getByText('LLM Integration'));
    expect(screen.getByTestId('mock-llm-integration')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-subgraph-qa')).not.toBeInTheDocument();
    
    // Click on "Node Download" tab
    fireEvent.click(screen.getByText('Node Download'));
    expect(screen.getByTestId('mock-node-download')).toBeInTheDocument();
    
    // Click on "Relationship Download" tab
    fireEvent.click(screen.getByText('Relationship Download'));
    expect(screen.getByTestId('mock-relationship-download')).toBeInTheDocument();
    
    // Return to "Graph Explorer" tab
    fireEvent.click(screen.getByText('Graph Explorer'));
    expect(screen.getByTestId('mock-sample-visualization')).toBeInTheDocument();
  });

  test('toggle button collapses and expands the panel', () => {
    render(<ToolsPanel onQuerySelect={mockOnQuerySelect} />);
    
    // Initially the panel should be expanded
    expect(screen.getByText('Tools')).toBeInTheDocument();
    
    // Find the toggle button and click it to collapse
    const toggleButton = screen.getByTitle('Collapse panel');
    fireEvent.click(toggleButton);
    
    // The "Tools" header should no longer be visible
    expect(screen.queryByText('Tools')).not.toBeInTheDocument();
    
    // The toggle button should now have title "Expand panel"
    const expandButton = screen.getByTitle('Expand panel');
    fireEvent.click(expandButton);
    
    // The "Tools" header should be visible again
    expect(screen.getByText('Tools')).toBeInTheDocument();
  });
}); 