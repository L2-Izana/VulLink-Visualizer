import React, { useState } from 'react';
import { RelationshipType } from '../schema/relationships';
import { GraphNode } from '../schema/nodes';

interface SampleVisualizationProps {
  onQuerySelect: (query: string) => void;
}

const SampleVisualization: React.FC<SampleVisualizationProps> = ({ onQuerySelect }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'nodes' | 'relationships'>('nodes');

  const containerStyle = {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    margin: '0 20px 20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: '1px solid #eaeaea'
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '10px 20px',
    backgroundColor: isActive ? '#4a90e2' : 'transparent',
    color: isActive ? 'white' : '#666',
    border: 'none',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid #2171cd' : '2px solid transparent',
    transition: 'all 0.3s ease',
    fontWeight: isActive ? '600' : '400',
    fontSize: '14px'
  });

  const buttonStyle = {
    padding: '10px 16px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '13px',
    color: '#444',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: '#4a90e2',
    color: 'white',
    border: '1px solid #4a90e2',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 6px rgba(74,144,226,0.2)'
  };

  const sampleQueries = {
    nodes: [
      { label: 'Vulnerabilities', query: 'MATCH (v:Vulnerability) RETURN v LIMIT 50' },
      { label: 'Exploits', query: 'MATCH (e:Exploit) RETURN e LIMIT 50' },
      { label: 'Products', query: 'MATCH (p:Product) RETURN p LIMIT 50' },
      { label: 'Weaknesses', query: 'MATCH (w:Weakness) RETURN w LIMIT 50' },
      { label: 'Vendors', query: 'MATCH (v:Vendor) RETURN v LIMIT 50' },
      { label: 'Authors', query: 'MATCH (a:Author) RETURN a LIMIT 50' },
      { label: 'Domains', query: 'MATCH (d:Domain) RETURN d LIMIT 50' }
    ],
    relationships: [
      { 
        label: 'Exploit -> Vulnerability', 
        query: 'MATCH (e:Exploit)-[r:EXPLOITS]->(v:Vulnerability) RETURN e, r, v LIMIT 50' 
      },
      { 
        label: 'Product -> Vendor', 
        query: 'MATCH (p:Product)-[r:BELONGS_TO]->(v:Vendor) RETURN p, r, v LIMIT 50' 
      },
      {
        label: 'Vulnerability -> Product',
        query: 'MATCH (v:Vulnerability)-[r:AFFECTS]->(p:Product) RETURN v, r, p LIMIT 50'
      },
      {
        label: 'Vulnerability -> Domain',
        query: 'MATCH (v:Vulnerability)-[r:REFERS_TO]->(d:Domain) RETURN v, r, d LIMIT 50'
      },
      {
        label: 'Vulnerability -> Weakness',
        query: 'MATCH (v:Vulnerability)-[r:EXAMPLE_OF]->(w:Weakness) RETURN v, r, w LIMIT 50'
      },
      {
        label: 'Author -> Exploit',
        query: 'MATCH (a:Author)-[r:WRITES]->(e:Exploit) RETURN a, r, e LIMIT 50'
      }
    ]
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #eaeaea' }}>
        <button
          onClick={() => setActiveCategory('nodes')}
          style={tabStyle(activeCategory === 'nodes')}
        >
          Node Queries
        </button>
        <button
          onClick={() => setActiveCategory('relationships')}
          style={tabStyle(activeCategory === 'relationships')}
        >
          Relationship Queries
        </button>
      </div>

      {activeCategory === 'nodes' && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {sampleQueries.nodes.map((item, index) => (
            <button
              key={index}
              onClick={() => onQuerySelect(item.query)}
              onMouseEnter={() => setHoveredButton(`node-${index}`)}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === `node-${index}` ? buttonHoverStyle : buttonStyle}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {activeCategory === 'relationships' && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {sampleQueries.relationships.map((item, index) => (
            <button
              key={index}
              onClick={() => onQuerySelect(item.query)}
              onMouseEnter={() => setHoveredButton(`rel-${index}`)}
              onMouseLeave={() => setHoveredButton(null)}
              style={hoveredButton === `rel-${index}` ? buttonHoverStyle : buttonStyle}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SampleVisualization;