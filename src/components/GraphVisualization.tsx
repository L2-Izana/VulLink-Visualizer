/**
 * @fileoverview A React component that visualizes graph data using Force-Directed Graph.
 * Uses react-force-graph-2d for rendering and d3 for force simulation.
 */

import React, { useState, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3';
import { GraphData, NodeData } from '../types/graph';

/** Props for the GraphVisualization component */
interface GraphVisualizationProps {
  /** Graph data containing nodes and links */
  data: GraphData;
  /** Callback function when a node is clicked */
  onNodeClick: (node: NodeData) => void;
}

/**
 * GraphVisualization Component
 * Renders an interactive force-directed graph with node details panel
 */
const GraphVisualization: React.FC<GraphVisualizationProps> = ({ data, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null); // Reference to the force graph instance
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(500);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Update containerWidth on mount and when the window resizes.
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

  // Calculate node radius based on container width.
  const baseRadius = Math.max(containerWidth / 100, 10);
  const nodeRadius = baseRadius < 10 ? 10 : baseRadius;

  // Add a collision force so that nodes maintain a minimum distance.
  useEffect(() => {
    if (graphRef.current) {
      // Add d3 forceCollide with radius: nodeRadius plus extra padding (5 pixels)
      graphRef.current.d3Force('collide', d3.forceCollide((node: any) => nodeRadius + 2));
    }
  }, [nodeRadius]);

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(node);
    onNodeClick(node);
  };

  /**
   * Gets the display ID for a node based on its type
   * @param node - The node object to get ID from
   * @returns The display ID string
   */
  const getNodeId = (node: any): string => {
    switch (node.label) {
      case 'Vulnerability':
        return node.properties.cveID;
      case 'Exploit':
        return node.properties.eid;
      case 'Weakness':
        return node.properties.cweID;
      case 'Product':
        return node.properties.productName;
      case 'Vendor':
        return node.properties.vendorName;
      case 'Author':
        return node.properties.authorName;
      case 'Domain':
        return node.properties.domainName;
      default:
        return 'Unknown';
    }
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
        ref={graphRef}
        graphData={data}
        nodeAutoColorBy="label"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={() => 0.004}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
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
            while (ctx.measureText(truncated + '...').width > maxTextWidth) {
              truncated = truncated.slice(0, -1);
            }
            displayText = truncated + '...';
          }
          ctx.fillText(displayText, node.x, node.y);
        }}
        onNodeDragEnd={(node: any) => {
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
