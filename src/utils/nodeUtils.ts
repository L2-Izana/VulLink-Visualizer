import { NodeData } from '../types/graph';

export const getNodeId = (node: NodeData): string => {
  switch (node.label) {
    case 'Vulnerability':
      return node.properties.cveID;
    case 'Exploit':
      return node.properties.eid;
    case 'Weakness':
      return node.properties.cweID;
    case 'Product':
      return node.properties.productName;
    case 'Vendor':
      return node.properties.vendorName;
    case 'Author':
      return node.properties.authorName;
    case 'Domain':
      return node.properties.domainName;
    default:
      return 'Unknown';
  }
};