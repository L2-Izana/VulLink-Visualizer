import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SampleVisualization from '../../../components/ToolsPanel/SampleVisualization';

describe('SampleVisualization Component', () => {
  const mockOnQuerySelect = jest.fn();

  beforeEach(() => {
    mockOnQuerySelect.mockClear();
  });

  test('renders the component with header', () => {
    render(<SampleVisualization onQuerySelect={mockOnQuerySelect} />);
    
    // Check if the header is displayed
    expect(screen.getByText('Graph Explorer')).toBeInTheDocument();
    expect(screen.getByText(/explore the vullink graph database/i)).toBeInTheDocument();
  });

  test('renders schema visualization button', () => {
    render(<SampleVisualization onQuerySelect={mockOnQuerySelect} />);
    
    // Check if the schema button is displayed
    const schemaButton = screen.getByText('Visualize Database Schema');
    expect(schemaButton).toBeInTheDocument();
  });

  test('renders relationship and node buttons', () => {
    render(<SampleVisualization onQuerySelect={mockOnQuerySelect} />);
    
    // Check if relationship buttons are displayed
    expect(screen.getByText('EXPLOITS')).toBeInTheDocument();
    expect(screen.getByText('BELONGS_TO')).toBeInTheDocument();
    expect(screen.getByText('AFFECTS')).toBeInTheDocument();
    
    // Check if node buttons are displayed
    expect(screen.getByText('Vulnerabilities')).toBeInTheDocument();
    expect(screen.getByText('Exploits')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  test('clicking schema button calls onQuerySelect with schema purpose', () => {
    render(<SampleVisualization onQuerySelect={mockOnQuerySelect} />);
    
    const schemaButton = screen.getByText('Visualize Database Schema');
    fireEvent.click(schemaButton);
    
    // Check if onQuerySelect was called with correct parameters
    expect(mockOnQuerySelect).toHaveBeenCalledTimes(1);
    expect(mockOnQuerySelect).toHaveBeenCalledWith('CALL db.schema.visualization()', 'schema');
  });

  test('clicking relationship button calls onQuerySelect with query', () => {
    render(<SampleVisualization onQuerySelect={mockOnQuerySelect} />);
    
    const exploitsButton = screen.getByText('EXPLOITS');
    fireEvent.click(exploitsButton);
    
    // Check if onQuerySelect was called with correct parameters
    expect(mockOnQuerySelect).toHaveBeenCalledTimes(1);
    expect(mockOnQuerySelect).toHaveBeenCalledWith(expect.stringContaining('MATCH (e:Exploit)-[r:EXPLOITS]->(v:Vulnerability)'));
  });

  test('clicking node button calls onQuerySelect with query', () => {
    render(<SampleVisualization onQuerySelect={mockOnQuerySelect} />);
    
    const vulnerabilitiesButton = screen.getByText('Vulnerabilities');
    fireEvent.click(vulnerabilitiesButton);
    
    // Check if onQuerySelect was called with correct parameters
    expect(mockOnQuerySelect).toHaveBeenCalledTimes(1);
    expect(mockOnQuerySelect).toHaveBeenCalledWith(expect.stringContaining('MATCH (v:Vulnerability)'));
  });
}); 