import React, { useState } from 'react';

interface SampleVisualizationProps {
  onQuerySelect: (query: string) => void;
}

const SampleVisualization: React.FC<SampleVisualizationProps> = ({ onQuerySelect }) => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'relationships'>('nodes');
  const [tooltipInfo, setTooltipInfo] = useState<{ text: string; x: number; y: number } | null>(null);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const [clickedButton, setClickedButton] = useState<number | null>(null);

  const handleClick = (query: string, index: number) => {
    setClickedButton(index);
    onQuerySelect(query);
    
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

  const getButtonStyle = (index: number) => {
    return {
      ...styles.button,
      ...(hoveredButton === index ? styles.buttonHovered : {}),
      ...(clickedButton === index ? styles.buttonClicked : {})
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.tabs}>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'nodes' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('nodes')}
        >
          Nodes
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'relationships' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('relationships')}
        >
          Relationships
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'nodes' && (
          <div style={styles.buttonGrid}>
            {sampleQueries.nodes.map((item, index) => (
              <button
                key={index}
                onClick={() => handleClick(item.query, index)}
                onMouseEnter={() => setHoveredButton(index)}
                onMouseLeave={() => setHoveredButton(null)}
                style={getButtonStyle(index)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'relationships' && (
          <div style={styles.buttonGrid}>
            {sampleQueries.relationships.map((item, index) => (
              <div key={index} style={styles.buttonWrapper}>
                <button
                  onClick={() => handleClick(item.query, index)}
                  onMouseEnter={(e) => {
                    setHoveredButton(index);
                    handleInfoHover(e, `${item.source} ―[${item.relationship}]⟶ ${item.target}`);
                  }}
                  onMouseLeave={() => {
                    setHoveredButton(null);
                    handleInfoLeave();
                  }}
                  style={getButtonStyle(index)}
                >
                  {item.relationship}
                </button>
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    position: 'relative' as const
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    marginBottom: '20px'
  },
  tabButton: {
    padding: '10px 15px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'normal' as const,
    color: '#555'
  },
  activeTab: {
    borderBottom: '2px solid #4B0082',
    fontWeight: 'bold' as const,
    color: '#4B0082'
  },
  content: {
    marginTop: '20px'
  },
  buttonGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px'
  },
  buttonWrapper: {
    position: 'relative' as const
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
    minWidth: '120px',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease'
  },
  buttonHovered: {
    backgroundColor: '#e0e0e0',
    transform: 'translateY(-2px)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  buttonClicked: {
    backgroundColor: '#d0d0d0',
    transform: 'translateY(0px)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  tooltip: {
    position: 'fixed' as const,
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    zIndex: 1000,
    transform: 'translate(10px, 10px)',
    pointerEvents: 'none' as const,
    maxWidth: '250px'
  }
};

export default SampleVisualization;