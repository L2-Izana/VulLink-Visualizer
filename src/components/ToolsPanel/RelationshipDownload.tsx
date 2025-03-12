import React, { useState, useCallback } from 'react';
import { downloadFile, convertToCSV } from '../../utils/download';
import { nodeTypes } from '../../schema/nodeConfigs';
import CheckboxList from './shared/CheckboxList';

interface RelationshipDownloadProps {
  /**
   * Callback function to execute a query with a given purpose.
   * @param query - The generated Cypher query.
   * @param purpose - A string indicating the query purpose (e.g., 'download').
   * @returns A Promise resolving with the query results.
   */
  onQuerySelect: (query: string, purpose: string) => Promise<any>;
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

  /**
   * Handles changes to the relationship type selection.
   */
  const handleRelationshipTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as keyof typeof relationshipTypes;
    setSelectedRelationshipType(type);
    setSelectedProperties([]);
    setSourceProperties([]);
    setTargetProperties([]);
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
      if (downloadData) {
        // Replace empty strings with null.
        const data = downloadData.map((item: any) => {
          Object.keys(item).forEach((key) => {
            if (item[key] === '') item[key] = null;
          });
          return item;
        });
        downloadFile(data, `${selectedRelationshipType}_data.json`);
      }
    } catch (error) {
      console.error('Download failed:', error);
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
    <div style={styles.container}>
      <div style={styles.section}>
        <h4>1. Select Relationship Type</h4>
        <select
          value={selectedRelationshipType}
          onChange={handleRelationshipTypeChange}
          style={styles.select}
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
              <CheckboxList
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
                label="Relationship Properties"
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
            <CheckboxList
              options={[...(nodeTypes[relationshipTypes[selectedRelationshipType].source]?.properties || [])]}
              selectedOptions={sourceProperties}
              onChange={(prop, checked) =>
                handlePropertyChange(prop, checked, setSourceProperties)
              }
              onSelectAll={() =>
                handleSelectAll(
                  nodeTypes[relationshipTypes[selectedRelationshipType].source]?.properties || [],
                  setSourceProperties
                )
              }
              label="Source Node Properties"
            />
          </div>

          {/* Target Node Properties */}
          <div style={styles.section}>
            <h4>
              4. Select Target Node Properties (
              {relationshipTypes[selectedRelationshipType].target})
            </h4>
            <CheckboxList
              options={[...(nodeTypes[relationshipTypes[selectedRelationshipType].target]?.properties || [])]}
              selectedOptions={targetProperties}
              onChange={(prop, checked) =>
                handlePropertyChange(prop, checked, setTargetProperties)
              }
              onSelectAll={() =>
                handleSelectAll(
                  nodeTypes[relationshipTypes[selectedRelationshipType].target]?.properties || [],
                  setTargetProperties
                )
              }
              label="Target Node Properties"
            />
          </div>
        </>
      )}

      <button
        onClick={handleDownload}
        disabled={isDownloadDisabled}
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
  downloadButton: {
    padding: '10px 20px',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  noPropertiesMessage: {
    color: '#666',
    fontStyle: 'italic'
  }
} as const;

export default RelationshipDownload;
