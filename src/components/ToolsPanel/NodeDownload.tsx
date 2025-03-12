import React, { useState, useCallback } from 'react';
import { downloadFile, convertToCSV } from '../../utils/download';
import { nodeTypes } from '../../schema/nodeConfigs';
import CheckboxList from './shared/CheckboxList';

interface NodeDownloadProps {
  /**
   * Callback function to execute a query with a given purpose.
   * @param query - The generated Cypher query.
   * @param purpose - A string indicating the query purpose (e.g., 'download').
   * @returns A Promise resolving with the query results.
   */
  onQuerySelect: (query: string, purpose: string) => Promise<any>;
}

/**
 * NodeDownload Component
 *
 * Provides a UI for selecting a node type and its properties, and choosing a download format (JSON or CSV).
 * Generates a Cypher query based on the selections and triggers a file download with the retrieved data.
 *
 * @param props - Component properties.
 */
const NodeDownload: React.FC<NodeDownloadProps> = ({ onQuerySelect }) => {
  // State variables to manage the selected node type, properties, and file format.
  const [selectedNodeType, setSelectedNodeType] = useState<keyof typeof nodeTypes | ''>('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [format, setFormat] = useState<'json' | 'csv'>('json');

  /**
   * Handles the change event for node type selection.
   */
  const handleNodeTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as keyof typeof nodeTypes;
    setSelectedNodeType(type);
    // Reset property selections when node type changes.
    setSelectedProperties([]);
  }, []);

  /**
   * Toggles the selection of a property.
   *
   * @param prop - The property name.
   * @param checked - Whether the property is selected.
   */
  const handlePropertyChange = useCallback(
    (prop: string, checked: boolean) => {
      setSelectedProperties((prev) =>
        checked ? [...prev, prop] : prev.filter((p) => p !== prop)
      );
    },
    []
  );

  /**
   * Selects all available properties for the chosen node type.
   */
  const handleSelectAllProperties = useCallback(() => {
    if (!selectedNodeType) return;
    setSelectedProperties(nodeTypes[selectedNodeType].properties);
  }, [selectedNodeType]);

  /**
   * Handles changes to the download format.
   *
   * @param e - The change event from the format radio button.
   */
  const handleFormatChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(e.target.value as 'json' | 'csv');
  }, []);

  /**
   * Generates the query based on the selections and triggers the file download.
   */
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
              // Convert empty strings to null in JSON format.
              Object.keys(item).forEach((key) => {
                if (item[key] === '') item[key] = null;
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
        <CheckboxList
          options={nodeTypes[selectedNodeType].properties}
          selectedOptions={selectedProperties}
          onChange={handlePropertyChange}
          onSelectAll={handleSelectAllProperties}
          label="Select Properties"
        />
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
