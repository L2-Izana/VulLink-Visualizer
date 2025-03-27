import {
  Vulnerability,
  Exploit,
  Weakness,
  Product,
  Vendor,
  Author,
  Domain,
} from './nodes';

export const nodeTypes = {
  Vulnerability: {
    label: 'Vulnerability',
    properties: [
      'cveID',
      'publishedDate',
      'description',
      'numOfReference',
      'v2version',
      'v2baseScore',
      'v2accessVector',
      'v2accessComplexity',
      'v2authentication',
      'v2confidentialityImpact',
      'v2integrityImpact',
      'v2availabilityImpact',
      'v2vectorString',
      'v2impactScore',
      'v2exploitabilityScore',
      'v2userInteractionRequired',
      'v2severity',
      'v2obtainUserPrivilege',
      'v2obtainAllPrivilege',
      'v2acInsufInfo',
      'v2obtainOtherPrivilege',
      'v3version',
      'v3baseScore',
      'v3attackVector',
      'v3attackComplexity',
      'v3privilegesRequired',
      'v3userInteraction',
      'v3scope',
      'v3confidentialityImpact',
      'v3integrityImpact',
      'v3availabilityImpact',
      'v3vectorString',
      'v3impactScore',
      'v3exploitabilityScore',
      'v3baseSeverity',
      'vulnerabilityType',
    ] as Array<keyof Vulnerability>
  },
  Exploit: {
    label: 'Exploit',
    properties: [
      'eid',
      'exploitType',
      'platform',
      'exploitPublishDate'
    ] as Array<keyof Exploit>
  },
  Weakness: {
    label: 'Weakness',
    properties: [
      'cweID',
      'description',
      'cweName',
      'extendedDescription',
      'weaknessAbstraction',
      'status'
    ] as Array<keyof Weakness>
  },
  Product: {
    label: 'Product',
    properties: [
      'productName',
      'productType'
    ] as Array<keyof Product>
  },
  Vendor: {
    label: 'Vendor',
    properties: [
      'vendorName'
    ] as Array<keyof Vendor>
  },
  Author: {
    label: 'Author',
    properties: [
      'authorName'
    ] as Array<keyof Author>
  },
  Domain: {
    label: 'Domain',
    properties: [
      'domainName'
    ] as Array<keyof Domain>
  }
} as const;

export type NodeType = keyof typeof nodeTypes;