import React, { useState, useCallback } from 'react';
import { downloadFile, convertToCSV } from '../../utils/download';
import { nodeTypes } from '../../schema/nodeConfigs';
import CheckboxList from './shared/CheckboxList';
import PanelContainer from './shared/PanelContainer';

interface NodeDownloadProps {
  /**
   * Callback function to execute a query with a given purpose.
   * @param query - The generated Cypher query.
   * @param purpose - A string indicating the query purpose (e.g., 'download').
   * @returns A Promise resolving with the query results.
   */
  onQuerySelect: (query: string, purpose?: 'visualization' | 'download' | 'llm') => Promise<any>;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the change event for node type selection.
   */
  const handleNodeTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as keyof typeof nodeTypes;
    setSelectedNodeType(type);
    // Reset property selections when node type changes.
    setSelectedProperties([]);
    setError(null);
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
    setSelectedProperties([...nodeTypes[selectedNodeType].properties]);
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

    setIsLoading(true);
    setError(null);

    const query = `
      MATCH (n:${selectedNodeType}) 
      RETURN ${selectedProperties
        .map((prop) => `COALESCE(n.${prop}, '') as ${prop}`)
        .join(', ')}
    `;

    try {
      const { downloadData } = await onQuerySelect(query, 'download');
      if (downloadData && downloadData.length > 0) {
        const data =
          format === 'json'
            ? downloadData.map((item: any) => {
              // Convert empty strings to null in JSON format.
              const cleanedItem = { ...item };
              Object.keys(cleanedItem).forEach((key) => {
                if (cleanedItem[key] === '') cleanedItem[key] = null;
              });
              return cleanedItem;
            })
            : convertToCSV(downloadData);
        downloadFile(data, `${selectedNodeType}_data.${format}`);
      } else {
        setError("No data found for the selected node type and properties");
      }
    } catch (error) {
      console.error('Download failed:', error);
      setError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedNodeType, selectedProperties, format, onQuerySelect]);

  return (
    <PanelContainer
      title="Node Download"
      description="Download node data from the graph database by selecting a node type, choosing specific properties, and specifying your preferred file format."
    >
      <div style={styles.formContainer}>
        <div style={styles.section}>
          <h4>1. Select Node Type</h4>
          <select
            value={selectedNodeType}
            onChange={handleNodeTypeChange}
            style={styles.select}
            disabled={isLoading}
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
            <CheckboxList
              options={[...nodeTypes[selectedNodeType].properties]}
              selectedOptions={selectedProperties}
              onChange={handlePropertyChange}
              onSelectAll={handleSelectAllProperties}
              label="Select Properties"
              disabled={isLoading}
            />
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
                disabled={isLoading}
              />
              JSON
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="csv"
                checked={format === 'csv'}
                onChange={handleFormatChange}
                disabled={isLoading}
              />
              CSV
            </label>
          </div>
        </div>

        {error && (
          <div style={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={!selectedNodeType || selectedProperties.length === 0 || isLoading}
          style={{
            ...styles.downloadButton,
            ...((!selectedNodeType || selectedProperties.length === 0 || isLoading) 
              ? styles.disabledButton 
              : {})
          }}
        >
          {isLoading ? 'Loading...' : 'Download Data'}
        </button>
      </div>
    </PanelContainer>
  );
};

const styles = {
  formContainer: {
    padding: '15px',
    width: '100%',
    height: 'auto',
    overflow: 'visible',
    maxWidth: '100%',
    boxSizing: 'border-box' as const
  },
  section: {
    marginBottom: '20px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as const
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
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease'
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    opacity: 0.7
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px'
  }
} as const;

export default NodeDownload;
