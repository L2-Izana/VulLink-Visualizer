import React, { useState, useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3';
import { GraphData, NodeData } from '../types/graph';

interface GraphVisualizationProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
}

const containerStyle: React.CSSProperties = {
  height: '100%',
  border: '1px solid #ccc',
  margin: '0px',
  borderRadius: '8px',
  backgroundColor: '#fff',
  position: 'relative',
  overflow: 'hidden'
};

const detailPanelStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  right: '0',
  maxWidth: '280px',
  maxHeight: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '0 12px 0 0',
  padding: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(200, 200, 200, 0.8)',
  zIndex: 10,
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column'
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
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
        setContainerHeight(rect.height);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    // Add a ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  const baseRadius = Math.max(containerWidth / 50, 10);
  const nodeRadius = baseRadius < 10 ? 10 : baseRadius;

  // Add collision force with extra padding
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('collide', d3.forceCollide((node: any) => nodeRadius*1.5));
    }
  }, [nodeRadius]);

  // Add force configuration with increased distance and strength
  useEffect(() => {
    if (graphRef.current) {
      // Calculate link distance based on relationship label length
      graphRef.current.d3Force('link')
        .distance((link: any) => {
          // Estimate text width (approximately 6px per character)
          const label = link.type || '';
          const estimatedTextWidth = label.length * 6;
          // Make link 2 times longer than the text width, with minimum length
          return Math.max(estimatedTextWidth * 2, 60);
        })
        .strength(0.5);

      // Adjust charge force for better node separation
      graphRef.current.d3Force('charge')
        .strength(-500)
        .distanceMax(300);

      // Add center force to keep the graph centered
      graphRef.current.d3Force('center')
        .strength(0.05);

      // Adjust collision force for better spacing
      graphRef.current.d3Force('collide', d3.forceCollide()
        .radius(nodeRadius * 1.8)
        .strength(0.5)
      );
    }
  }, [nodeRadius, data]);

  // Force graph to update when container size changes
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('center').strength(0.05);
      graphRef.current.d3Force('charge').strength(-500);
      graphRef.current.d3Force('link').distance(100);
      graphRef.current.d3Force('collide', d3.forceCollide().radius(nodeRadius * 1.5));
    }
  }, [containerWidth, containerHeight, nodeRadius]);

  const handleNodeClick = useCallback((node: NodeData) => {
    // Check if this is a schema node (starts with schema_) - these should not be clickable
    if (node.id.toString().startsWith('schema_')) {
      // Do nothing for schema nodes
      return;
    }
    
    // If the same node is clicked again, close the panel
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(null);
    } else {
      // Otherwise, select the new node
      setSelectedNode(node);
      onNodeClick(node);
    }
  }, [selectedNode, onNodeClick]);

  const getNodeId = useCallback((node: any): string => {
    const { id, label, properties } = node;
    
    // For schema nodes, just return the label
    if (id.toString().startsWith('schema_')) {
      return label;
    }
    
    // For regular nodes, use the usual logic
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

  // Render relationship labels on links
  const renderLinkLabel = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    if (!link.source || !link.target) return;
    
    const start = { x: link.source.x, y: link.source.y };
    const end = { x: link.target.x, y: link.target.y };
    
    // Find the middle point of the link
    const middleX = start.x + (end.x - start.x) / 2;
    const middleY = start.y + (end.y - start.y) / 2;
    
    // Calculate rotation angle for the text
    const textAngle = Math.atan2(end.y - start.y, end.x - start.x);
    
    // Draw relationship label
    ctx.save();
    ctx.translate(middleX, middleY);
    
    // Only rotate text if it's not upside down (improves readability)
    if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
      ctx.rotate(textAngle + Math.PI);
    } else {
      ctx.rotate(textAngle);
    }
    
    ctx.font = '5px Sans-Serif';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add a background to make the text more readable
    const label = link.type || '';
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(-textWidth/2 - 4, -7, textWidth + 8, 14);
    
    // Draw the text
    ctx.fillStyle = '#555';
    ctx.fillText(label, 0, 0);
    ctx.restore();
    
    // Draw arrowhead at the end of the link
    const arrowLength = 4;
    const arrowWidth = 4;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    
    // Calculate position for the arrow (a bit before the target node to avoid overlap)
    const nodeOffset = nodeRadius + 1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const targetX = end.x - (dx / dist) * nodeOffset;
    const targetY = end.y - (dy / dist) * nodeOffset;
    
    ctx.save();
    ctx.beginPath();
    ctx.translate(targetX, targetY);
    ctx.rotate(angle);
    
    // Draw the arrowhead
    ctx.moveTo(-arrowLength, -arrowWidth/2);
    ctx.lineTo(0, 0);
    ctx.lineTo(-arrowLength, arrowWidth/2);
    ctx.lineTo(-arrowLength, -arrowWidth/2);
    
    ctx.fillStyle = '#666';
    ctx.fill();
    ctx.restore();
  }, [nodeRadius]);

  const renderNode = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const isSchemaNode = node.id.toString().startsWith('schema_');
    const nodeId = getNodeId(node);
    const fontSize = isSchemaNode ? Math.min(nodeRadius / 2.5, 12) : Math.min(nodeRadius / 3, 8);
    
    // Different styling for schema nodes
    if (isSchemaNode) {
      // Schema nodes get a distinctive style
      ctx.fillStyle = '#5D478B'; // Medium purple
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius * 1.2, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.strokeStyle = '#FFD700'; // Gold border
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw label text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'white';
      ctx.fillText(nodeId, node.x, node.y);
      return;
    }
    
    // Regular nodes styling (unchanged)
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
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={() => 0.004}
        linkWidth={1.5}
        linkColor={() => "#999"}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={renderNode}
        linkCanvasObject={renderLinkLabel}
        linkCanvasObjectMode={() => "after"}
        nodeRelSize={nodeRadius}
        width={containerWidth}
        height={containerHeight}
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.2}
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
          <div style={{ 
            flex: '0 1 auto',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            paddingRight: '8px',
            width: '100%',
            minWidth: 'fit-content'
          }}>
            {Object.entries(selectedNode.properties).map(([key, value]) => (
              <div key={key} style={detailItemStyle}>
                <span style={detailKeyStyle}>{key}</span>
                <span style={detailValueStyle}>
                  {typeof value === 'string' 
                    ? value 
                    : JSON.stringify(value).replace(/"/g, '')}
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
