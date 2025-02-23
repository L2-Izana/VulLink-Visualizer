import React from 'react';

interface SubgraphQAProps {
  onQuerySelect: (query: string) => void;
}

export const SubgraphQA: React.FC<SubgraphQAProps> = ({ onQuerySelect }) => {
  return (
    <div>
      <h3>Subgraph Pattern Analysis</h3>
      {/* Add your subgraph QA content here */}
    </div>
  );
};