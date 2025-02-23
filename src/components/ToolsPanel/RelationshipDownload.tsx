import React, { useState, useCallback } from 'react';
import { downloadFile, convertToCSV } from '../../utils/download';
import { Relationship, RelationshipType } from '../../schema/relationships';
interface RelationshipDownloadProps {
  onQuerySelect: (query: string, purpose: string) => Promise<any>;
}

const relationshipTypes = {
  AFFECTS: {
    label: 'AFFECTS',
    properties: [
      'id',
      'type',
      'source',
      'target',
      'numOfVersion',
      'affectedVersion'
    ] as Array<keyof Relationship>,
  },
  REFERS_TO: {
    label: 'REFERS_TO',
    properties: [
      'id',
      'type',
      'source',
      'target'
    ] as Array<keyof Relationship>,
  },
  EXAMPLE_OF: {
    label: 'EXAMPLE_OF',
    properties: [
      'id',
      'type',
      'source',
      'target'
    ] as Array<keyof Relationship>,
  },
  EXPLOITS: {
    label: 'EXPLOITS',
    properties: [
      'id',
      'type',
      'source',
      'target'
    ] as Array<keyof Relationship>,
  },
  WRITES: {
    label: 'WRITES',
    properties: [
      'id',
      'type',
      'source',
      'target'
    ] as Array<keyof Relationship>,
  },
  BELONGS_TO: {
    label: 'BELONGS_TO',
    properties: [
      'id',
      'type',
      'source',
      'target'
    ] as Array<keyof Relationship>,
  }
} as const;

const RelationshipDownload: React.FC<RelationshipDownloadProps> = ({ onQuerySelect }) => {
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<keyof typeof relationshipTypes | ''>('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [format, setFormat] = useState<'json' | 'csv'>('json');

  const handleRelationshipTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const type = e.target.value as keyof typeof relationshipTypes;
      setSelectedRelationshipType(type);
      // Reset properties when the relationship type changes
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
    if (!selectedRelationshipType) return;
    setSelectedProperties(relationshipTypes[selectedRelationshipType].properties);
  }, [selectedRelationshipType]);

  const handleFormatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormat(e.target.value as 'json' | 'csv');
    },
    []
  );

  // TODO: Enhance relationship download functionality
  // Issues to address:
  // 1. Add source and target node properties to download
  // 2. Implement proper relationship property mapping
  // 3. Handle null values in relationship properties
  // 4. Add relationship direction visualization
  // 5. Improve query performance with proper indexing

  const handleDownload = useCallback(async () => {
    if (!selectedRelationshipType || selectedProperties.length === 0) return;

    // TODO: Enhance query to include source and target node properties
    // Example structure needed:
    // MATCH (source)-[r:TYPE]->(target)
    // RETURN source.prop1, r.prop1, target.prop1
    const query = `
      MATCH ()-[r:${selectedRelationshipType}]->()
      RETURN ${selectedProperties
        .map((prop) => `COALESCE(r.${prop}, '') as ${prop}`)
        .join(', ')}
    `;

    console.log('Download query:', query);

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
        downloadFile(data, `${selectedRelationshipType}_data.${format}`);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [selectedRelationshipType, selectedProperties, format, onQuerySelect]);

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
        <div style={styles.section}>
          <h4>2. Select Properties</h4>
          <button onClick={handleSelectAllProperties} style={styles.selectAllButton}>
            Select All
          </button>
          <div style={styles.checkboxGroup}>
            {relationshipTypes[selectedRelationshipType].properties.map((prop) => (
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

export default RelationshipDownload;
