import React, { useState } from 'react';
import SampleVisualization from './SampleVisualization';
import { SubgraphQA } from './SubgraphQA';
import LLMIntegration from './LLMIntegration';
import NodeDownload from './NodeDownload';
import RelationshipDownload from './RelationshipDownload';

interface ToolsPanelProps {
    onQuerySelect: (query: string, purpose?: 'visualization' | 'download' | 'llm') => Promise<any>;
}

type TabType = 'samples' | 'subgraph' | 'llm' | 'nodeDownload' | 'relDownload';

const ToolsPanel: React.FC<ToolsPanelProps> = ({ onQuerySelect }) => {
    const [activeTab, setActiveTab] = useState<TabType>('samples');

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        boxSizing: 'border-box' as const,
        padding: '15px'
    };

    const tabsContainerStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '5px',
        marginBottom: '20px'
    };

    const tabStyle = (isActive: boolean) => ({
        padding: '12px 15px',
        backgroundColor: isActive ? '#1A2980' : '#d0e4ff',
        color: isActive ? 'white' : '#1A2980',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: isActive ? 'bold' : 'normal',
        textAlign: 'left' as const,
        boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
    });

    const contentStyle = {
        flex: 1,
        overflow: 'auto' as const,
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ margin: '0 0 15px 0', color: '#1A2980', textAlign: 'center' as const }}>
                Tools Panel
            </h2>
            
            <div style={tabsContainerStyle}>
                <button
                    onClick={() => setActiveTab('samples')}
                    style={tabStyle(activeTab === 'samples')}
                >
                    Sample Queries
                </button>
                <button
                    onClick={() => setActiveTab('subgraph')}
                    style={tabStyle(activeTab === 'subgraph')}
                >
                    Subgraph QA
                </button>
                <button
                    onClick={() => setActiveTab('llm')}
                    style={tabStyle(activeTab === 'llm')}
                >
                    LLM Integration
                </button>
                <button
                    onClick={() => setActiveTab('nodeDownload')}
                    style={tabStyle(activeTab === 'nodeDownload')}
                >
                    Node Download
                </button>
                <button
                    onClick={() => setActiveTab('relDownload')}
                    style={tabStyle(activeTab === 'relDownload')}
                >
                    Relationship Download
                </button>
            </div>

            <div style={contentStyle}>
                {activeTab === 'samples' && <SampleVisualization onQuerySelect={onQuerySelect} />}
                {activeTab === 'subgraph' && <SubgraphQA onQuerySelect={onQuerySelect} />}
                {activeTab === 'llm' && <LLMIntegration onQuerySelect={onQuerySelect} />}
                {activeTab === 'nodeDownload' && <NodeDownload onQuerySelect={onQuerySelect} />}
                {activeTab === 'relDownload' && <RelationshipDownload onQuerySelect={onQuerySelect} />}
            </div>
        </div>
    );
};

export default ToolsPanel;