// Vulnerability: Unique identifier is the CVE ID.
export interface Vulnerability {
    label: "Vulnerability";
    cveID: string;                
    publishedDate: string;     
    description_value: string;      
    num_reference: number;       
    v2version: string;            
    v2baseScore: number;           
    v2accessVector: string;     
    v2accessComplexity: string;   
    v2authentication: string;     
    v2confidentialityImpact: string; 
    v2integrityImpact: string;       
    v2availabilityImpact: string;   
    v2vectorString: string;       
    v2impactScore: number;           
    v2exploitabilityScore: number;  
    v2userInteractionRequired: string; 
    v2severity: string;           
    v2obtainUserPrivilege: string;  
    v2obtainAllPrivilege: string;   
    v2acInsufInfo: string;          
    v2obtainOtherPrivilege: string; 
    v3version: string;          
    v3baseScore: number;            
    v3attackVector: string;          
    v3attackComplexity: string;      
    v3privilegesRequired: string;    
    v3userInteraction: string;       
    v3scope: string;                 
    v3confidentialityImpact: string; 
    v3integrityImpact: string;       
    v3availabilityImpact: string;   
    v3vectorString: string;          
    v3impactScore: number;           
    v3exploitabilityScore: number; 
    v3baseSeverity: string;          
  }

// Exploit: Unique identifier is the exploit ID.
export interface Exploit {
    label: "Exploit";
    eid: string; 
    exploitType: string;
    platform: string;
    exploitPublishDate: string;
}

// Weakness: Unique identifier is the CWE ID.
export interface Weakness {
    label: "Weakness";
    cweID: string; 
    description: string;
    cweName: string;
    extendedDescription: string;
    weaknessAbstraction: string;
    cweView: string;
    status: string;
}

// Product: Unique identifier is the product name.
export interface Product {
    label: "Product";
    productName: string;
    productType: string;
}

// Vendor: Unique identifier is the vendor name.
export interface Vendor {
    label: "Vendor";
    vendorName: string;
}

// Author: Unique identifier is the author name.
export interface Author {
    label: "Author";
    authorName: string;
}

// Domain: Unique identifier is the domain name.
export interface Domain {
    label: "Domain";
    domainName: string;
}

// Union type for any node in your graph.
export type GraphNode =
    | Vulnerability
    | Exploit
    | Weakness
    | Product
    | Vendor
    | Author
    | Domain;
