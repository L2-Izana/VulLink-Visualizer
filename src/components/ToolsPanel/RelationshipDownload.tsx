import React, { useState, useCallback } from 'react';
import { downloadFile, convertToCSV } from '../../utils/download';
import { Relationship } from '../../schema/relationships';
import { nodeTypes } from '../../schema/nodeConfigs';

interface RelationshipDownloadProps {
  onQuerySelect: (query: string, purpose: string) => Promise<any>;
}

const relationshipTypes = {
  AFFECTS: { label: 'AFFECTS', source: 'Vulnerability', target: 'Product', properties: ['numOfVersion', 'affectedVersion'] },
  REFERS_TO: { label: 'REFERS_TO', source: 'Vulnerability', target: 'Domain', properties: []},
  EXAMPLE_OF: { label: 'EXAMPLE_OF', source: 'Vulnerability', target: 'Weakness', properties: []},
  EXPLOITS: { label: 'EXPLOITS', source: 'Exploit', target: 'Vulnerability', properties: []},
  WRITES: { label: 'WRITES', source: 'Author', target: 'Exploit', properties: []},
  BELONGS_TO: { label: 'BELONGS_TO', source: 'Product', target: 'Vendor', properties: []},
} as const;

const RelationshipDownload: React.FC<RelationshipDownloadProps> = ({ onQuerySelect }) => {
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<keyof typeof relationshipTypes | ''>('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [sourceProperties, setSourceProperties] = useState<string[]>([]);
  const [targetProperties, setTargetProperties] = useState<string[]>([]);

  const handleRelationshipTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as keyof typeof relationshipTypes;
    setSelectedRelationshipType(type);
    setSelectedProperties([]);
    setSourceProperties([]);
    setTargetProperties([]);
  }, []);

  const handlePropertyChange = useCallback((prop: string, checked: boolean, setProperties: React.Dispatch<React.SetStateAction<string[]>>) => {
    setProperties((prev) => checked ? [...prev, prop] : prev.filter((p) => p !== prop));
  }, []);

  const handleSelectAll = useCallback((properties: string[], setProperties: React.Dispatch<React.SetStateAction<string[]>>) => {
    setProperties(properties);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!selectedRelationshipType || selectedProperties.length === 0) return;

    const { source, target } = relationshipTypes[selectedRelationshipType];
    const query = `
      MATCH (source:${source})-[r:${selectedRelationshipType}]->(target:${target})
      RETURN ${[...selectedProperties.map((prop) => `r.${prop} AS ${prop}`),
        ...sourceProperties.map((prop) => `source.${prop} AS source_${prop}`),
        ...targetProperties.map((prop) => `target.${prop} AS target_${prop}`)]
        .join(', ')}
    `;

    console.log('Download query:', query);

    try {
      const { downloadData } = await onQuerySelect(query, 'download');
      if (downloadData) {
        const data = downloadData.map((item: any) => {
              Object.keys(item).forEach((key) => { if (item[key] === '') item[key] = null; });
              return item;
            });
        downloadFile(data, `${selectedRelationshipType}_data.json`);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [selectedRelationshipType, selectedProperties, sourceProperties, targetProperties, onQuerySelect]);

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
            <option key={rel.label} value={rel.label}>{rel.label}</option>
          ))}
        </select>
      </div>

      {selectedRelationshipType && (
        <>
          <div style={styles.section}>
            <h4>2. Select Relationship Properties</h4>
            <div style={styles.checkboxGroup}>
              {relationshipTypes[selectedRelationshipType].properties.map((prop) => (
                <label key={prop} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(prop)}
                    onChange={(e) => handlePropertyChange(prop, e.target.checked, setSelectedProperties)}
                  />
                  {prop}
                </label>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h4>3. Select Source Node Properties ({relationshipTypes[selectedRelationshipType].source})</h4>
            <div style={styles.checkboxGroup}>
              {nodeTypes[relationshipTypes[selectedRelationshipType].source]?.properties.map((prop) => (
                <label key={prop} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={sourceProperties.includes(prop)}
                    onChange={(e) => handlePropertyChange(prop, e.target.checked, setSourceProperties)}
                  />
                  {prop}
                </label>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h4>4. Select Target Node Properties ({relationshipTypes[selectedRelationshipType].target})</h4>
            <div style={styles.checkboxGroup}>
              {nodeTypes[relationshipTypes[selectedRelationshipType].target]?.properties.map((prop) => (
                <label key={prop} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={targetProperties.includes(prop)}
                    onChange={(e) => handlePropertyChange(prop, e.target.checked, setTargetProperties)}
                  />
                  {prop}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        onClick={handleDownload}
        disabled={!selectedRelationshipType || selectedProperties.length === 0}
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
  },
  selectAllButton: {
    padding: '6px 12px',
    marginBottom: '10px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  } as React.CSSProperties
};

export default RelationshipDownload;
