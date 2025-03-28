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
        padding: '10px',
        overflow: 'hidden'
    };

    const tabsContainerStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        marginBottom: '15px'
    };

    const tabStyle = (isActive: boolean) => ({
        padding: '10px 12px',
        backgroundColor: isActive ? '#1A2980' : '#d0e4ff',
        color: isActive ? 'white' : '#1A2980',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: isActive ? 'bold' : 'normal',
        textAlign: 'left' as const,
        boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
        fontSize: '0.9rem'
    });

    const contentStyle = {
        flex: 1,
        overflowY: 'auto' as const,
        overflowX: 'hidden' as const,
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '0',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column' as const,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box' as const
    };

    return (
        <div style={containerStyle}>            
            <div style={tabsContainerStyle}>
                <button
                    onClick={() => setActiveTab('samples')}
                    style={tabStyle(activeTab === 'samples')}
                >
                    Graph Explorer
                </button>
                <button
                    onClick={() => setActiveTab('subgraph')}
                    style={tabStyle(activeTab === 'subgraph')}
                >
                    Q&A Demo
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