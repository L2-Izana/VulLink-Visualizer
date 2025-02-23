import React, { useState, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData, NodeData } from '../types/graph';

interface GraphVisualizationProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ data, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(500);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Update containerWidth on mount and whenever the window resizes.
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setContainerHeight(containerRef.current.offsetHeight);
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate node radius based on container width. Adjust the divisor as needed.
  const baseRadius = containerWidth / 200;
  const nodeRadius = baseRadius < 5 ? 5 : baseRadius;

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node);
    onNodeClick(node);
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: '500px',
        border: '1px solid #ccc',
        margin: '10px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <ForceGraph2D
        graphData={data}
        nodeAutoColorBy="label"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={() => 0.004}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = '#000';
          ctx.fillText(label, node.x + nodeRadius + 3, node.y + nodeRadius / 2);
        }}
        onNodeDragEnd={(node: any) => {
          // Constrain node position within bounds
          node.x = Math.max(nodeRadius, Math.min(containerWidth - nodeRadius, node.x));
          node.y = Math.max(nodeRadius, Math.min(containerHeight - nodeRadius, node.y));
        }}
        nodeRelSize={nodeRadius}
        width={containerWidth}
        height={containerHeight}
      />
      
      {selectedNode && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            maxWidth: '280px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(200, 200, 200, 0.8)',
            zIndex: 10,
            transition: 'all 0.3s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              borderBottom: '1px solid #eee',
              paddingBottom: '8px'
            }}
          >
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px',
              color: '#2c3e50',
              fontWeight: 600 
            }}>
              {selectedNode.label}
            </h3>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                border: 'none',
                background: '#f8f9fa',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e9ecef'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8f9fa'}
            >
              ✕
            </button>
          </div>
          
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            paddingRight: '8px'
          }}>
            {Object.entries(selectedNode.properties).map(([key, value]) => (
              <div 
                key={key}
                style={{
                  marginBottom: '8px',
                  padding: '6px',
                  backgroundColor: 'rgba(247, 248, 249, 0.7)',
                  borderRadius: '6px'
                }}
              >
                <span style={{ 
                  color: '#666',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '2px'
                }}>
                  {key}
                </span>
                <span style={{ 
                  color: '#2c3e50',
                  fontSize: '14px',
                  wordBreak: 'break-word'
                }}>
                  {JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;
