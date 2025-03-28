import React, { ReactNode } from 'react';

interface PanelContainerProps {
  /** Title of the panel */
  title: string;
  /** Description text that explains the functionality */
  description: string;
  /** Main content of the panel */
  children: ReactNode;
  /** Optional background color override */
  backgroundColor?: string;
}

/**
 * PanelContainer Component
 *
 * A consistent container for all tool panels with standardized styling
 * including a title with bottom border, description, and content area.
 */
const PanelContainer: React.FC<PanelContainerProps> = ({
  title,
  description,
  children,
  backgroundColor = '#f8f8f8'
}) => {
  return (
    <div style={{...styles.container, background: backgroundColor}}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
      <div style={styles.content} className="panel-content">
        {children}
      </div>
      <style>{`
        .panel-content {
          overflow-y: auto !important;
          overflow-x: hidden !important;
          max-width: 100% !important;
          width: 100% !important;
        }
        .panel-content div {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: '10px',
    fontFamily: 'Arial, sans-serif',
    position: 'relative' as const,
    borderRadius: '10px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden'
  },
  title: {
    fontSize: '18px',
    margin: '0 0 15px 0',
    color: '#2c3e50',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    borderBottom: '2px solid #3498db',
    paddingBottom: '8px'
  },
  description: {
    fontSize: '13px',
    color: '#5a6a7a',
    margin: '0 0 15px 0',
    textAlign: 'center' as const,
    lineHeight: '1.5',
    maxWidth: '95%',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  content: {
    flex: '1 1 auto',
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    maxWidth: '100%'
  }
};

export default PanelContainer; 