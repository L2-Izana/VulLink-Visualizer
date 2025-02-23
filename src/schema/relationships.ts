// src/schema/Relationship.ts

// Define the possible relationship types.
export type RelationshipType =
  | "AFFECTS"     // Vulnerability -> Product (has additional properties)
  | "REFERS_TO"   // Vulnerability -> Domain
  | "EXAMPLE_OF"  // Vulnerability -> Weakness
  | "EXPLOITS"    // Exploit -> Vulnerability
  | "WRITES"      // Author -> Exploit
  | "BELONGS_TO"; // Product -> Vendor

// Define a specialized interface for the "AFFECTS" relationship.
export interface AffectsRelationship {
  id: string;               // Unique relationship identifier
  type: "AFFECTS";
  source: string;           // Unique identifier for the Vulnerability node (e.g., cveID)
  target: string;           // Unique identifier for the Product node (e.g., productName)
  numOfVersion: number;     // Number of versions affected
  affectedVersion: string;  // Specific affected version
}

// Define a generic interface for all other relationship types (which have no extra properties).
export interface GenericRelationship {
  id: string;               // Unique relationship identifier
  type: "REFERS_TO" | "EXAMPLE_OF" | "EXPLOITS" | "WRITES" | "BELONGS_TO";
  source: string;           // Unique identifier for the source node
  target: string;           // Unique identifier for the target node
}

// Union type for any relationship in your graph.
export type Relationship = AffectsRelationship | GenericRelationship;
