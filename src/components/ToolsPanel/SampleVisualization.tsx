import React, { useState } from 'react';
import PanelContainer from './shared/PanelContainer';

interface SampleVisualizationProps {
  onQuerySelect: (query: string, purpose?: 'visualization' | 'download' | 'llm' | 'schema') => void;
}

const SampleVisualization: React.FC<SampleVisualizationProps> = ({ onQuerySelect }) => {
  const [tooltipInfo, setTooltipInfo] = useState<{ text: string; x: number; y: number } | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  const handleClick = (query: string, buttonId: string) => {
    setClickedButton(buttonId);
    
    // Special case for schema visualization
    if (buttonId === 'schema') {
      // Only execute the query with schema purpose, don't update CypherFrame
      onQuerySelect(query, 'schema');
    } else {
      // For regular queries, update the CypherFrame
      onQuerySelect(query);
    }

    // Reset the clicked state after a short delay for visual feedback
    setTimeout(() => {
      setClickedButton(null);
    }, 300);
  };

  const handleInfoHover = (e: React.MouseEvent, text: string) => {
    setTooltipInfo({
      text,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleInfoLeave = () => {
    setTooltipInfo(null);
  };

  const sampleQueries = {
    schema: 'CALL db.schema.visualization()',
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
        source: 'Exploit',
        relationship: 'EXPLOITS',
        target: 'Vulnerability',
        query: 'MATCH (e:Exploit)-[r:EXPLOITS]->(v:Vulnerability) RETURN e, r, v LIMIT 50'
      },
      {
        source: 'Product',
        relationship: 'BELONGS_TO',
        target: 'Vendor',
        query: 'MATCH (p:Product)-[r:BELONGS_TO]->(v:Vendor) RETURN p, r, v LIMIT 50'
      },
      {
        source: 'Vulnerability',
        relationship: 'AFFECTS',
        target: 'Product',
        query: 'MATCH (v:Vulnerability)-[r:AFFECTS]->(p:Product) RETURN v, r, p LIMIT 50'
      },
      {
        source: 'Vulnerability',
        relationship: 'REFERS_TO',
        target: 'Domain',
        query: 'MATCH (v:Vulnerability)-[r:REFERS_TO]->(d:Domain) RETURN v, r, d LIMIT 50'
      },
      {
        source: 'Vulnerability',
        relationship: 'EXAMPLE_OF',
        target: 'Weakness',
        query: 'MATCH (v:Vulnerability)-[r:EXAMPLE_OF]->(w:Weakness) RETURN v, r, w LIMIT 50'
      },
      {
        source: 'Author',
        relationship: 'WRITES',
        target: 'Exploit',
        query: 'MATCH (a:Author)-[r:WRITES]->(e:Exploit) RETURN a, r, e LIMIT 50'
      }
    ]
  };

  const getButtonStyle = (buttonId: string, isRelationship = false) => {
    const isHovered = hoveredButton === buttonId;
    const isClicked = clickedButton === buttonId;

    return {
      ...styles.button,
      ...(isRelationship ? styles.relationshipButton : styles.nodeButton),
      ...(isHovered ? (isRelationship ? styles.relationshipButtonHovered : styles.nodeButtonHovered) : {}),
      ...(isClicked ? (isRelationship ? styles.relationshipButtonClicked : styles.nodeButtonClicked) : {})
    };
  };

  return (
    <PanelContainer
      title="Graph Explorer"
      description="Explore the VulLink Graph Database by selecting node types or relationships. Click any button to visualize examples in the graph and discover connections."
    >
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <button
          onClick={() => handleClick(sampleQueries.schema, 'schema')}
          onMouseEnter={(e) => {
            setHoveredButton('schema');
            handleInfoHover(e, 'Visualize the schema of the graph database');
          }}
          onMouseLeave={() => {
            setHoveredButton(null);
            handleInfoLeave();
          }}
          style={{
            ...styles.schemaButton,
            ...(hoveredButton === 'schema' ? styles.schemaButtonHovered : {}),
            ...(clickedButton === 'schema' ? styles.schemaButtonClicked : {})
          }}
        >
          Visualize Database Schema
        </button>
      </div>
      
      <div style={styles.tableLayout}>
        <div style={styles.tableRow}>
          <div style={styles.tableHeader}>Relationships</div>
          <div style={styles.tableHeader}>Nodes</div>
        </div>

        <div style={styles.tableContent}>
          {/* Left side: Relationships */}
          <div style={styles.tableCell}>
            <div style={styles.buttonGrid}>
              {sampleQueries.relationships.map((item, index) => {
                const buttonId = `rel_${index}`;
                return (
                  <div key={index} style={styles.buttonWrapper}>
                    <button
                      onClick={() => handleClick(item.query, buttonId)}
                      onMouseEnter={(e) => {
                        setHoveredButton(buttonId);
                        handleInfoHover(e, `${item.source} ―[${item.relationship}]⟶ ${item.target}`);
                      }}
                      onMouseLeave={() => {
                        setHoveredButton(null);
                        handleInfoLeave();
                      }}
                      style={getButtonStyle(buttonId, true)}
                    >
                      {item.relationship}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side: Nodes */}
          <div style={styles.tableCell}>
            <div style={styles.buttonGrid}>
              {sampleQueries.nodes.map((item, index) => {
                const buttonId = `node_${index}`;
                return (
                  <button
                    key={index}
                    onClick={() => handleClick(item.query, buttonId)}
                    onMouseEnter={() => setHoveredButton(buttonId)}
                    onMouseLeave={() => setHoveredButton(null)}
                    style={getButtonStyle(buttonId)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {tooltipInfo && (
        <div style={{
          ...styles.tooltip,
          left: tooltipInfo.x,
          top: tooltipInfo.y
        }}>
          {tooltipInfo.text}
        </div>
      )}
    </PanelContainer>
  );
};

const styles = {
  tableLayout: {
    width: '100%',
    height: 'auto',
    overflow: 'auto',
    maxWidth: '100%',
    boxSizing: 'border-box' as const
  },
  tableRow: {
    display: 'flex',
    borderBottom: '1px solid #e0e0e0',
    background: '#3498db',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const
  },
  tableHeader: {
    flex: '1 1 50%',
    padding: '12px 15px',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    fontSize: '14px',
    color: 'white',
    borderRight: '1px solid rgba(255,255,255,0.2)'
  },
  tableContent: {
    display: 'flex',
    minHeight: '300px',
    background: 'white',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const
  },
  tableCell: {
    flex: '1 1 50%',
    padding: '15px',
    borderRight: '1px solid #e0e0e0'
  },
  buttonGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  buttonWrapper: {
    position: 'relative' as const
  },
  button: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
    fontWeight: '500' as const,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  relationshipButton: {
    background: '#3498db',
    color: 'white',
    borderLeft: '4px solid #2980b9'
  },
  nodeButton: {
    background: '#2ecc71',
    color: 'white',
    borderLeft: '4px solid #27ae60'
  },
  relationshipButtonHovered: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    background: '#3498db',
    filter: 'brightness(110%)'
  },
  nodeButtonHovered: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    background: '#2ecc71',
    filter: 'brightness(110%)'
  },
  relationshipButtonClicked: {
    transform: 'translateY(0px)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    background: '#2980b9'
  },
  nodeButtonClicked: {
    transform: 'translateY(0px)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    background: '#27ae60'
  },
  schemaButton: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    background: '#9b59b6',
    color: 'white',
    borderLeft: '4px solid #8e44ad',
    boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    textAlign: 'center' as const,
    width: 'auto',
    minWidth: 'max-content',
    display: 'inline-block'
  },
  schemaButtonHovered: {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
    filter: 'brightness(110%)'
  },
  schemaButtonClicked: {
    transform: 'translateY(0px)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    background: '#8e44ad'
  },
  tooltip: {
    position: 'fixed' as const,
    backgroundColor: 'rgba(44, 62, 80, 0.95)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    zIndex: 1000,
    transform: 'translate(10px, 10px)',
    pointerEvents: 'none' as const,
    maxWidth: '250px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    borderLeft: '3px solid #3498db'
  }
};

export default SampleVisualization;