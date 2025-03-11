import React, { useState, useCallback } from 'react';
import { downloadFile, convertToCSV } from '../../utils/download';

import { nodeTypes, NodeType } from '../../schema/nodeConfigs';
interface NodeDownloadProps {
  onQuerySelect: (query: string, purpose: string) => Promise<any>;
}
const NodeDownload: React.FC<NodeDownloadProps> = ({ onQuerySelect }) => {
  const [selectedNodeType, setSelectedNodeType] = useState<keyof typeof nodeTypes | ''>('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [format, setFormat] = useState<'json' | 'csv'>('json');

  const handleNodeTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const type = e.target.value as keyof typeof nodeTypes;
      setSelectedNodeType(type);
      // Reset properties if node type changes
      setSelectedProperties([]);
    },
    []
  );

  const handlePropertyChange = useCallback(
    (prop: string, checked: boolean) => {
      setSelectedProperties((prev) =>
        checked ? [...prev, prop] : prev.filter((p) => p !== prop)
      );
    },
    []
  );

  const handleSelectAllProperties = useCallback(() => {
    if (!selectedNodeType) return;
    setSelectedProperties(nodeTypes[selectedNodeType].properties);
  }, [selectedNodeType]);

  const handleFormatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormat(e.target.value as 'json' | 'csv');
    },
    []
  );

  const handleDownload = useCallback(async () => {
    if (!selectedNodeType || selectedProperties.length === 0) return;

    const query = `
      MATCH (n:${selectedNodeType}) 
      RETURN ${selectedProperties
        .map((prop) => `COALESCE(n.${prop}, '') as ${prop}`)
        .join(', ')}
    `;

    try {
      const { downloadData } = await onQuerySelect(query, 'download');
      if (downloadData) {
        const data =
          format === 'json'
            ? downloadData.map((item: any) => {
                // Convert empty strings back to null for JSON format
                Object.keys(item).forEach((key) => {
                  if (item[key] === '') {
                    item[key] = null;
                  }
                });
                return item;
              })
            : convertToCSV(downloadData);
        downloadFile(data, `${selectedNodeType}_data.${format}`);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [selectedNodeType, selectedProperties, format, onQuerySelect]);

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h4>1. Select Node Type</h4>
        <select
          value={selectedNodeType}
          onChange={handleNodeTypeChange}
          style={styles.select}
        >
          <option value="">Select a node type...</option>
          {Object.values(nodeTypes).map((type) => (
            <option key={type.label} value={type.label}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {selectedNodeType && (
        <div style={styles.section}>
          <h4>2. Select Properties</h4>
          <button
            onClick={handleSelectAllProperties}
            style={styles.selectAllButton}
          >
            Select All
          </button>
          <div style={styles.checkboxGroup}>
            {nodeTypes[selectedNodeType].properties.map((prop) => (
              <label key={prop} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedProperties.includes(prop)}
                  onChange={(e) => handlePropertyChange(prop, e.target.checked)}
                />
                {prop}
              </label>
            ))}
          </div>
        </div>
      )}

      <div style={styles.section}>
        <h4>3. Select Format</h4>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="json"
              checked={format === 'json'}
              onChange={handleFormatChange}
            />
            JSON
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="csv"
              checked={format === 'csv'}
              onChange={handleFormatChange}
            />
            CSV
          </label>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={!selectedNodeType || selectedProperties.length === 0}
        style={styles.downloadButton}
      >
        Download Data
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  section: {
    marginBottom: '20px'
  },
  select: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  selectAllButton: {
    padding: '6px 12px',
    marginBottom: '10px',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  radioGroup: {
    display: 'flex',
    gap: '20px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  downloadButton: {
    padding: '10px 20px',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  } as React.CSSProperties
};

export default NodeDownload;
