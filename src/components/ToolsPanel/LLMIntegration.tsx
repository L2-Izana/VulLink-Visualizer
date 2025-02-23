import React from 'react';

interface LLMIntegrationProps {
  onQuerySelect: (query: string) => void;
}

export const LLMIntegration: React.FC<LLMIntegrationProps> = ({ onQuerySelect }) => {
  return (
    <div>
      <h3>LLM Vulnerability Text Embedding</h3>
      {/* Add your subgraph QA content here */}
    </div>
  );
};