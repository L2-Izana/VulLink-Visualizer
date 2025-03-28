import React from 'react';
import PanelContainer from './shared/PanelContainer';

interface SubgraphQAProps {
  onQuerySelect: (query: string) => void;
}

export const SubgraphQA: React.FC<SubgraphQAProps> = ({ onQuerySelect }) => {
  return (
    <PanelContainer
      title="Subgraph Pattern Analysis"
      description="Analyze vulnerability patterns and explore relationships between different entities using our Q&A interface for subgraph pattern matching."
    >
      <div style={styles.content}>
        {/* Add your subgraph QA content here */}
        <p style={styles.placeholder}>Content coming soon...</p>
      </div>
    </PanelContainer>
  );
};

const styles = {
  content: {
    padding: '15px',
    minHeight: '200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const
  },
  placeholder: {
    color: '#888',
    fontSize: '16px',
    fontStyle: 'italic'
  }
};