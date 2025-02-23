import React, { useState, useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3';
import { GraphData, NodeData } from '../types/graph';

interface GraphVisualizationProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
}

const containerStyle: React.CSSProperties = {
  height: '500px',
  border: '1px solid #ccc',
  margin: '0px',
  borderRadius: '8px',
  backgroundColor: '#fff',
  position: 'relative',
  overflow: 'hidden'
};

const detailPanelStyle: React.CSSProperties = {
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
  transition: 'all 0.3s ease'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
  borderBottom: '1px solid #eee',
  paddingBottom: '8px'
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '16px',
  color: '#2c3e50',
  fontWeight: 600
};

const closeButtonStyle: React.CSSProperties = {
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
};

const detailItemStyle: React.CSSProperties = {
  marginBottom: '8px',
  padding: '6px',
  backgroundColor: 'rgba(247, 248, 249, 0.7)',
  borderRadius: '6px'
};

const detailKeyStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'block',
  marginBottom: '2px'
};

const detailValueStyle: React.CSSProperties = {
  color: '#2c3e50',
  fontSize: '14px',
  wordBreak: 'break-word'
};

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ data, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(500);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Update container dimensions on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const baseRadius = Math.max(containerWidth / 50, 10);
  const nodeRadius = baseRadius < 10 ? 10 : baseRadius;

  // Add collision force with extra padding
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('collide', d3.forceCollide((node: any) => nodeRadius+2));
    }
  }, [nodeRadius]);

  // Add force configuration
  useEffect(() => {
    if (graphRef.current) {
      // Decrease link distance and increase strength for tighter connections
      graphRef.current.d3Force('link')
        .distance(() => 20) // Reduced from default
        .strength(1); // Increased link strength

      // Adjust charge force for closer node placement
      graphRef.current.d3Force('charge')
        .strength(-200) // More negative value brings nodes closer
        .distanceMax(100); // Reduced maximum distance

      // Add stronger center force to prevent drift
      graphRef.current.d3Force('center')
        .strength(1); // Increased centering force

      // Adjust collision force for minimal spacing
      graphRef.current.d3Force('collide', d3.forceCollide()
        .radius(nodeRadius + 2) // Reduced padding
        .strength(0.8) // Slightly reduced collision strength for closer packing
      );
    }
  }, [nodeRadius, data]);

  const handleNodeClick = useCallback((node: NodeData) => {
    setSelectedNode(node);
    onNodeClick(node);
  }, [onNodeClick]);

  const handleNodeDragEnd = useCallback((node: any) => {
    node.x = Math.max(nodeRadius, Math.min(containerWidth - nodeRadius, node.x));
    node.y = Math.max(nodeRadius, Math.min(containerHeight - nodeRadius, node.y));
  }, [nodeRadius, containerWidth, containerHeight]);

  const getNodeId = useCallback((node: any): string => {
    const { label, properties } = node;
    switch (label) {
      case 'Vulnerability':
        return properties.cveID;
      case 'Exploit':
        return properties.eid;
      case 'Weakness':
        return properties.cweID;
      case 'Product':
        return properties.productName;
      case 'Vendor':
        return properties.vendorName;
      case 'Author':
        return properties.authorName;
      case 'Domain':
        return properties.domainName;
      default:
        return 'Unknown';
    }
  }, []);

  const renderNode = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const nodeId = getNodeId(node);
    const fontSize = Math.min(nodeRadius / 3, 8);
    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.fillStyle = '#000';

    const maxTextWidth = nodeRadius * 1.6;
    let displayText = nodeId;
    if (ctx.measureText(nodeId).width > maxTextWidth) {
      let truncated = nodeId;
      while (ctx.measureText(truncated + '...').width > maxTextWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
      }
      displayText = truncated + '...';
    }
    ctx.fillText(displayText, node.x, node.y);
  }, [getNodeId, nodeRadius]);

  return (
    <div ref={containerRef} style={containerStyle}>
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeAutoColorBy="label"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={() => 0.004}
        onNodeClick={handleNodeClick}
        onNodeDragEnd={handleNodeDragEnd}
        nodeCanvasObject={renderNode}
        nodeRelSize={nodeRadius}
        width={containerWidth}
        height={containerHeight}
      />

      {selectedNode && (
        <div style={detailPanelStyle}>
          <div style={headerStyle}>
            <h3 style={titleStyle}>{selectedNode.label}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              style={closeButtonStyle}
              onMouseOver={(e) => (e.currentTarget.style.background = '#e9ecef')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#f8f9fa')}
            >
              ✕
            </button>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', scrollbarWidth: 'thin', paddingRight: '8px' }}>
            {Object.entries(selectedNode.properties).map(([key, value]) => (
              <div key={key} style={detailItemStyle}>
                <span style={detailKeyStyle}>{key}</span>
                <span style={detailValueStyle}>{JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;
