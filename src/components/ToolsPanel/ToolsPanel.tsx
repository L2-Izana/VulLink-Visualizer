import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        boxSizing: 'border-box' as const,
        padding: '10px',
        overflow: 'hidden',
        position: 'relative' as const,
        width: isCollapsed ? '40px' : '400px',
        transition: 'width 0.3s ease'
    };

    const toggleButtonStyle = {
        position: 'absolute' as const,
        left: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        backgroundColor: '#4B7BEC',
        color: 'white',
        border: 'none',
        borderRadius: '4px 0 0 4px',
        padding: '0px 0px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        transition: 'all 0.2s ease',
        width: '10px',
        height: '60px'
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
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    ...toggleButtonStyle,
                    backgroundColor: isHovered ? '#3867D6' : '#4B7BEC',
                }}
                title={isCollapsed ? "Expand panel" : "Collapse panel"}
            >
                {isCollapsed ? 
                    <ChevronLeft size={20} strokeWidth={3} /> : 
                    <ChevronRight size={20} strokeWidth={3} />
                }
            </button>
            
            {!isCollapsed && (
                <>
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
                </>
            )}
        </div>
    );
};

export default ToolsPanel;