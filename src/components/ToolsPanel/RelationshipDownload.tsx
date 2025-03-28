import React, { useState, useCallback } from 'react';
import { downloadFile, convertToCSV } from '../../utils/download';
import { nodeTypes } from '../../schema/nodeConfigs';
import PropertyButton from './shared/PropertyButton';
import PanelContainer from './shared/PanelContainer';

interface RelationshipDownloadProps {
  /**
   * Callback function to execute a query with a given purpose.
   * @param query - The generated Cypher query.
   * @param purpose - A string indicating the query purpose (e.g., 'download').
   * @returns A Promise resolving with the query results.
   */
  onQuerySelect: (query: string, purpose?: 'visualization' | 'download' | 'llm') => Promise<any>;
}

const relationshipTypes = {
  AFFECTS: { label: 'AFFECTS', source: 'Vulnerability', target: 'Product', properties: ['numOfVersion', 'affectedVersion'] },
  REFERS_TO: { label: 'REFERS_TO', source: 'Vulnerability', target: 'Domain', properties: [] },
  EXAMPLE_OF: { label: 'EXAMPLE_OF', source: 'Vulnerability', target: 'Weakness', properties: [] },
  EXPLOITS: { label: 'EXPLOITS', source: 'Exploit', target: 'Vulnerability', properties: [] },
  WRITES: { label: 'WRITES', source: 'Author', target: 'Exploit', properties: [] },
  BELONGS_TO: { label: 'BELONGS_TO', source: 'Product', target: 'Vendor', properties: [] },
} as const;

/**
 * RelationshipDownload Component
 *
 * Provides a UI to select a relationship type, its properties, and the properties
 * of its source and target nodes. It then generates a Cypher query based on the selections
 * and downloads the query results as a JSON file.
 *
 * @param props - Component properties.
 */
const RelationshipDownload: React.FC<RelationshipDownloadProps> = ({ onQuerySelect }) => {
  // State variables for the selected relationship and node properties.
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<keyof typeof relationshipTypes | ''>('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [sourceProperties, setSourceProperties] = useState<string[]>([]);
  const [targetProperties, setTargetProperties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles changes to the relationship type selection.
   */
  const handleRelationshipTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as keyof typeof relationshipTypes;
    setSelectedRelationshipType(type);
    setSelectedProperties([]);
    setSourceProperties([]);
    setTargetProperties([]);
    setError(null);
  }, []);

  /**
   * Toggles the selection of a property.
   *
   * @param prop - The property name.
   * @param checked - Whether the checkbox is checked.
   * @param setProperties - Setter for the corresponding properties state.
   */
  const handlePropertyChange = useCallback(
    (
      prop: string,
      checked: boolean,
      setProperties: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
      setProperties((prev) => (checked ? [...prev, prop] : prev.filter((p) => p !== prop)));
    },
    []
  );

  /**
   * Selects all provided properties.
   *
   * @param properties - An array of property names.
   * @param setProperties - Setter for the corresponding properties state.
   */
  const handleSelectAll = useCallback(
    (
      properties: readonly string[],
      setProperties: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
      setProperties([...properties]);
    },
    []
  );

  /**
   * Clears all selected properties.
   *
   * @param setProperties - Setter for the corresponding properties state.
   */
  const handleDiscardAll = useCallback(
    (
      setProperties: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
      setProperties([]);
    },
    []
  );

  /**
   * Generates the query based on the selections and triggers the download.
   */
  const handleDownload = useCallback(async () => {
    if (!selectedRelationshipType) return;
    
    // For relationship types with no properties, require at least some node properties
    const hasRelProperties = relationshipTypes[selectedRelationshipType].properties.length > 0;
    if ((hasRelProperties && selectedProperties.length === 0) || 
        (!hasRelProperties && sourceProperties.length === 0 && targetProperties.length === 0)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const { source, target } = relationshipTypes[selectedRelationshipType];
    const query = `
      MATCH (source:${source})-[r:${selectedRelationshipType}]->(target:${target})
      RETURN ${[
        ...selectedProperties.map((prop) => `r.${prop} AS ${prop}`),
        ...sourceProperties.map((prop) => `source.${prop} AS source_${prop}`),
        ...targetProperties.map((prop) => `target.${prop} AS target_${prop}`)
      ].join(', ')}
    `;
    console.log('Download query:', query);

    try {
      const { downloadData } = await onQuerySelect(query, 'download');
      if (downloadData && downloadData.length > 0) {
        // Replace empty strings with null.
        const data = downloadData.map((item: any) => {
          const cleanedItem = { ...item };
          Object.keys(cleanedItem).forEach((key) => {
            if (cleanedItem[key] === '') cleanedItem[key] = null;
          });
          return cleanedItem;
        });
        downloadFile(data, `${selectedRelationshipType}_data.json`);
      } else {
        setError("No data found for the selected relationship type and properties");
      }
    } catch (error) {
      console.error('Download failed:', error);
      setError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedRelationshipType,
    selectedProperties,
    sourceProperties,
    targetProperties,
    onQuerySelect,
  ]);

  // Determine if the download button should be disabled
  const isDownloadDisabled = !selectedRelationshipType || 
    (relationshipTypes[selectedRelationshipType].properties.length > 0 && selectedProperties.length === 0) ||
    (relationshipTypes[selectedRelationshipType].properties.length === 0 && 
     sourceProperties.length === 0 && targetProperties.length === 0);

  return (
    <PanelContainer
      title="Relationship Download"
      description="Download relationship data from the graph database by selecting a relationship type and choosing properties from both the relationship and its connected nodes."
    >
      <div style={styles.formContainer}>
        <div style={styles.section}>
          <h4>1. Select Relationship Type</h4>
          <select
            value={selectedRelationshipType}
            onChange={handleRelationshipTypeChange}
            style={styles.select}
            disabled={isLoading}
          >
            <option value="">Select a relationship type...</option>
            {Object.values(relationshipTypes).map((rel) => (
              <option key={rel.label} value={rel.label}>
                {rel.label}
              </option>
            ))}
          </select>
        </div>

        {selectedRelationshipType && (
          <>
            {/* Relationship Properties */}
            <div style={styles.section}>
              <h4>2. Select Relationship Properties</h4>
              {relationshipTypes[selectedRelationshipType].properties.length > 0 ? (
                <PropertyButton
                  options={[...relationshipTypes[selectedRelationshipType].properties]}
                  selectedOptions={selectedProperties}
                  onChange={(prop, checked) =>
                    handlePropertyChange(prop, checked, setSelectedProperties)
                  }
                  onSelectAll={() =>
                    handleSelectAll(
                      relationshipTypes[selectedRelationshipType].properties,
                      setSelectedProperties
                    )
                  }
                  onDiscardAll={() => handleDiscardAll(setSelectedProperties)}
                  label="Relationship Properties"
                  disabled={isLoading}
                />
              ) : (
                <p style={styles.noPropertiesMessage}>No properties to select</p>
              )}
            </div>

            {/* Source Node Properties */}
            <div style={styles.section}>
              <h4>
                3. Select Source Node Properties (
                {relationshipTypes[selectedRelationshipType].source})
              </h4>
              <PropertyButton
                options={
                  relationshipTypes[selectedRelationshipType].source in nodeTypes
                    ? [...nodeTypes[relationshipTypes[selectedRelationshipType].source as keyof typeof nodeTypes].properties]
                    : []
                }
                selectedOptions={sourceProperties}
                onChange={(prop, checked) =>
                  handlePropertyChange(prop, checked, setSourceProperties)
                }
                onSelectAll={() =>
                  handleSelectAll(
                    relationshipTypes[selectedRelationshipType].source in nodeTypes
                      ? nodeTypes[relationshipTypes[selectedRelationshipType].source as keyof typeof nodeTypes].properties
                      : [],
                    setSourceProperties
                  )
                }
                onDiscardAll={() => handleDiscardAll(setSourceProperties)}
                label="Source Node Properties"
                disabled={isLoading}
              />
            </div>

            {/* Target Node Properties */}
            <div style={styles.section}>
              <h4>
                4. Select Target Node Properties (
                {relationshipTypes[selectedRelationshipType].target})
              </h4>
              <PropertyButton
                options={
                  relationshipTypes[selectedRelationshipType].target in nodeTypes
                    ? [...nodeTypes[relationshipTypes[selectedRelationshipType].target as keyof typeof nodeTypes].properties]
                    : []
                }
                selectedOptions={targetProperties}
                onChange={(prop, checked) =>
                  handlePropertyChange(prop, checked, setTargetProperties)
                }
                onSelectAll={() =>
                  handleSelectAll(
                    relationshipTypes[selectedRelationshipType].target in nodeTypes
                      ? nodeTypes[relationshipTypes[selectedRelationshipType].target as keyof typeof nodeTypes].properties
                      : [],
                    setTargetProperties
                  )
                }
                onDiscardAll={() => handleDiscardAll(setTargetProperties)}
                label="Target Node Properties"
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {error && (
          <div style={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={isDownloadDisabled || isLoading}
          style={{
            ...styles.downloadButton,
            ...(isDownloadDisabled || isLoading ? styles.disabledButton : {})
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
    boxSizing: 'border-box' as const,
    wordWrap: 'break-word' as const
  },
  select: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    boxSizing: 'border-box' as const
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
  },
  noPropertiesMessage: {
    fontStyle: 'italic',
    color: '#888'
  }
};

export default RelationshipDownload;
