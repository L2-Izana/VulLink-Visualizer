export interface NodeData {
  id: string;
  label: string;
  properties: any;
}

export interface LinkData {
  source: string;
  target: string;
  type?: string;
}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}
