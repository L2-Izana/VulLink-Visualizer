// import React, { useState, useCallback } from 'react';
// import { 
//   RelationshipType, 
//   AffectsRelationship,
//   GenericRelationship,
//   Relationship 
// } from '../../schema/relationships';
// import { 
//   Vulnerability, 
//   Product, 
//   Weakness, 
//   Exploit, 
//   Author, 
//   Domain, 
//   Vendor 
// } from '../../schema/nodes';
// import { downloadFile, convertToCSV } from '../../utils/download';

// interface RelationshipTypeConfig {
//   type: RelationshipType;
//   source: string;
//   target: string;
//   // Exclude the keys "id", "type", "source", and "target" from the union of keys
//   properties: Array<Exclude<keyof (AffectsRelationship | GenericRelationship), 'id' | 'type' | 'source' | 'target'>>;
// }

// const relationshipConfigs: Record<RelationshipType, RelationshipTypeConfig> = {
//   AFFECTS: {
//     type: 'AFFECTS',
//     source: 'Vulnerability',
//     target: 'Product',
//     properties: Object.keys({} as AffectsRelationship) as Array<keyof AffectsRelationship>
//   },
//   REFERS_TO: {
//     type: 'REFERS_TO',
//     source: 'Vulnerability',
//     target: 'Domain',
//     properties: Object.keys({} as GenericRelationship) as Array<keyof GenericRelationship>
//   },
//   EXAMPLE_OF: {
//     type: 'EXAMPLE_OF',
//     source: 'Vulnerability',
//     target: 'Weakness',
//     properties: Object.keys({} as GenericRelationship) as Array<keyof GenericRelationship>
//   },
//   EXPLOITS: {
//     type: 'EXPLOITS',
//     source: 'Exploit',
//     target: 'Vulnerability',
//     properties: Object.keys({} as GenericRelationship) as Array<keyof GenericRelationship>
//   },
//   WRITES: {
//     type: 'WRITES',
//     source: 'Author',
//     target: 'Exploit',
//     properties: Object.keys({} as GenericRelationship) as Array<keyof GenericRelationship>
//   },
//   BELONGS_TO: {
//     type: 'BELONGS_TO',
//     source: 'Product',
//     target: 'Vendor',
//     properties: Object.keys({} as GenericRelationship) as Array<keyof GenericRelationship>
//   }
// } as const;

// interface RelationshipDownloadProps {
//   onQuerySelect: (query: string) => Promise<any>;
// }

// export const RelationshipDownload: React.FC<RelationshipDownloadProps> = ({ onQuerySelect }) => {
//   const [selectedRelType, setSelectedRelType] = useState<RelationshipType | ''>('');
//   const [format, setFormat] = useState<'json' | 'csv'>('json');

//   const handleRelTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedRelType(e.target.value as RelationshipType);
//   }, []);

//   const handleFormatChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormat(e.target.value as 'json' | 'csv');
//   }, []);

//   const handleDownload = useCallback(async () => {
//     if (!selectedRelType) return;

//     const config = relationshipConfigs[selectedRelType];
//     const query = `
//       MATCH (source:${config.source})-[r:${selectedRelType}]->(target:${config.target})
//       RETURN source, r, target LIMIT 1000
//     `;

//     try {
//       const result = await onQuerySelect(query);
//       const data = format === 'json' ? result : convertToCSV(result);
//       downloadFile(data, `${selectedRelType}_relationships.${format}`);
//     } catch (error) {
//       console.error('Download failed:', error);
//     }
//   }, [selectedRelType, format, onQuerySelect]);

//   return (
//     <div style={styles.container}>
//       <div style={styles.section}>
//         <h4>1. Select Relationship Type</h4>
//         <select 
//           value={selectedRelType}
//           onChange={handleRelTypeChange}
//           style={styles.select}
//         >
//           <option value="">Select a relationship type...</option>
//           {Object.entries(relationshipConfigs).map(([type, config]) => (
//             <option key={type} value={type}>
//               {`${config.source} ${type} ${config.target}`}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div style={styles.section}>
//         <h4>2. Select Format</h4>
//         <div style={styles.radioGroup}>
//           <label style={styles.radioLabel}>
//             <input
//               type="radio"
//               value="json"
//               checked={format === 'json'}
//               onChange={handleFormatChange}
//             />
//             JSON
//           </label>
//           <label style={styles.radioLabel}>
//             <input
//               type="radio"
//               value="csv"
//               checked={format === 'csv'}
//               onChange={handleFormatChange}
//             />
//             CSV
//           </label>
//         </div>
//       </div>

//       <button
//         onClick={handleDownload}
//         disabled={!selectedRelType}
//         style={styles.downloadButton}
//       >
//         Download Relationships
//       </button>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     padding: '20px'
//   },
//   section: {
//     marginBottom: '20px'
//   },
//   select: {
//     width: '100%',
//     padding: '8px',
//     borderRadius: '4px',
//     border: '1px solid #ddd'
//   },
//   radioGroup: {
//     display: 'flex',
//     gap: '20px'
//   },
//   radioLabel: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px'
//   },
//   downloadButton: {
//     padding: '10px 20px',
//     backgroundColor: '#4a90e2',
//     color: 'white',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     // Note: Pseudo-selectors like ':disabled' won't work with inline styles.
//   }
// };

// export default RelationshipDownload;
import React from 'react';

interface RelationshipDownloadProps {
  onQuerySelect: (query: string) => void;
}

export const RelationshipDownload: React.FC<RelationshipDownloadProps> = ({ onQuerySelect }) => {
  return (
    <div>
      <h3>LLM Vulnerability Text Embedding</h3>
      {/* Add your subgraph QA content here */}
    </div>
  );
};