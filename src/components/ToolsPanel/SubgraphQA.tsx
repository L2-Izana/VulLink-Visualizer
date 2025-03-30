import React, { useState } from 'react';
import PanelContainer from './shared/PanelContainer';

interface SubgraphQAProps {
  onQuerySelect: (query: string) => void;
}

interface SampleSubgraphQuery {
  name: string;
  description: string;
  question: string;
  cypher: string;
}

// Predefined queries for subgraph analysis, including a new query for Shellshock.
const predefinedQueries: SampleSubgraphQuery[] = [
  {
    name: 'EternalBlue Vulnerability Analysis',
    description: 'Explore the complete context of the EternalBlue vulnerability (CVE-2017-0144)',
    question: 'What is the complete context of the EternalBlue vulnerability?',
    cypher: `MATCH (v:Vulnerability {cveID:"CVE-2017-0144"})
MATCH (v)-[r1:AFFECTS]->(p:Product)
MATCH (p)-[r2:BELONGS_TO]->(d:Vendor)
MATCH (v)-[r3:REFERS_TO]->(dom:Domain)
MATCH (v)-[r4:EXAMPLE_OF]->(w:Weakness)
MATCH (ex:Exploit)-[r5:EXPLOITS]->(v)
MATCH (a:Author)-[r6:WRITES]->(ex)
RETURN v, r1, p, r2, d, r3, dom, r4, w, r5, ex, r6, a
LIMIT 100;`
  },
  {
    name: 'HeartBleed OpenSSL Analysis',
    description: 'Examine the infamous HeartBleed vulnerability (CVE-2014-0160) in OpenSSL',
    question: 'What systems were affected by the HeartBleed vulnerability?',
    cypher: `MATCH (v:Vulnerability {cveID:"CVE-2014-0160"})
MATCH (v)-[r1:AFFECTS]->(p:Product)
MATCH (v)-[r2:EXAMPLE_OF]->(w:Weakness)
OPTIONAL MATCH (v)-[r3:REFERS_TO]->(d:Domain)
RETURN v, r1, p, r2, w, r3, d
LIMIT 100;`
  },
  {
    name: 'Shellshock Vulnerability Risk Profile',
    description: 'Analyze the comprehensive risk profile and cyber context of the Shellshock vulnerability (CVE-2014-6271) affecting Bash.',
    question: 'What is the detailed risk profile of the Shellshock vulnerability?',
    cypher: `MATCH (v:Vulnerability {cveID:"CVE-2014-6271"})
MATCH (v)-[r1:AFFECTS]->(p:Product)
MATCH (p)-[r2:BELONGS_TO]->(d:Vendor)
OPTIONAL MATCH (v)-[r3:REFERS_TO]->(dom:Domain)
OPTIONAL MATCH (v)-[r4:EXAMPLE_OF]->(w:Weakness)
OPTIONAL MATCH (ex:Exploit)-[r5:EXPLOITS]->(v)
OPTIONAL MATCH (a:Author)-[r6:WRITES]->(ex)
RETURN v, r1, p, r2, d, r3, dom, r4, w, r5, ex, r6, a
LIMIT 100;`
  }
];

interface QueryItemProps {
  query: SampleSubgraphQuery;
  onSelect: (query: string) => void;
  isSelected: boolean;
}

const QueryItem: React.FC<QueryItemProps> = ({ query, onSelect, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  return (
    <div 
      style={{
        ...styles.queryItem,
        backgroundColor: isSelected 
          ? '#e1efff' 
          : isClicking 
            ? '#d8edff' 
            : isHovered 
              ? '#ebf5ff' 
              : '#f5f8fb',
        transform: isClicking 
          ? 'scale(0.98)' 
          : isHovered 
            ? 'translateY(-2px)' 
            : 'none',
        boxShadow: isSelected
          ? '0 0 0 2px #3c93ff'
          : isHovered && !isClicking 
            ? '0 4px 8px rgba(0,0,0,0.1)' 
            : '0 1px 3px rgba(0,0,0,0.05)',
        borderColor: isSelected ? '#7ab6ff' : '#eaeff4'
      }}
      onClick={() => onSelect(query.cypher)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsClicking(false);
      }}
      onMouseDown={() => setIsClicking(true)}
      onMouseUp={() => setIsClicking(false)}
    >
      <div style={styles.queryName}>{query.name}</div>
      <div style={styles.queryDescription}>{query.description}</div>
      <div style={styles.queryQuestion}>
        <span style={styles.questionLabel}>Question:</span> {query.question}
      </div>
    </div>
  );
};

export const SubgraphQA: React.FC<SubgraphQAProps> = ({ onQuerySelect }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (query: string, index: number) => {
    setSelectedIndex(index);
    onQuerySelect(query);
  };

  return (
    <PanelContainer
      title="Subgraph Analysis Demo"
      description="Analyze vulnerability patterns and explore relationships between different entities using pre-defined queries for subgraph pattern matching."
    >
      <div style={styles.content}>
        <div style={styles.queriesContainer}>
          <h4 style={styles.sectionTitle}>Infamous Cybersecurity Vulnerabilities</h4>
          
          {predefinedQueries.map((q, index) => (
            <QueryItem 
              key={index} 
              query={q} 
              onSelect={(query) => handleSelect(query, index)}
              isSelected={selectedIndex === index}
            />
          ))}
        </div>
      </div>
    </PanelContainer>
  );
};

const styles = {
  content: {
    padding: '15px',
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'auto',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
  },
  queriesContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  description: {
    fontSize: '13px',
    color: '#666',
    margin: '0 0 10px 0',
  },
  sectionTitle: {
    margin: '0 0 6px 0',
    fontSize: '16px',
    color: '#333',
  },
  queryItem: {
    padding: '12px',
    borderRadius: '6px',
    backgroundColor: '#f5f8fb',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #eaeff4',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'relative' as const,
  },
  queryName: {
    fontWeight: 'bold' as const,
    fontSize: '15px',
    marginBottom: '6px',
    color: '#2c3e50',
  },
  queryDescription: {
    fontSize: '13px',
    color: '#7f8c8d',
    marginBottom: '8px',
  },
  queryQuestion: {
    fontSize: '13px',
    color: '#34495e',
    backgroundColor: 'rgba(230, 236, 241, 0.5)',
    padding: '6px 8px',
    borderRadius: '4px',
    marginTop: '4px',
  },
  questionLabel: {
    fontWeight: 'bold' as const,
    color: '#476582',
  },
  selectedIndicator: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    fontSize: '11px',
    fontWeight: 'bold' as const,
    color: 'white',
    backgroundColor: '#4299e1',
    padding: '2px 6px',
    borderRadius: '10px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  }
};

export default SubgraphQA;
