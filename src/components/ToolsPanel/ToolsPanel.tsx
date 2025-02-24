import React, { useState } from 'react';
import SampleVisualization from './SampleVisualization';
import { SubgraphQA } from './SubgraphQA';
import LLMIntegration from './LLMIntegration';
import NodeDownload from './NodeDownload';
import RelationshipDownload from './RelationshipDownload';

interface ToolsPanelProps {
    onQuerySelect: (query: string) => Promise<any>;
}

type TabType = 'samples' | 'subgraph' | 'llm' | 'nodeDownload' | 'relDownload';

const ToolsPanel: React.FC<ToolsPanelProps> = ({ onQuerySelect }) => {
    const [activeTab, setActiveTab] = useState<TabType>('samples');

    const containerStyle = {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        margin: '0 20px 20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid #eaeaea'
    };

    const tabsContainerStyle = {
        display: 'flex',
        borderBottom: '1px solid #eaeaea',
        marginBottom: '20px'
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

    return (
        <div style={containerStyle}>
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

            <div style={{ padding: '10px' }}>
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