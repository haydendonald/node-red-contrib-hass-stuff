import * as NodeRED from "node-red";

export interface BaseNode extends NodeRED.Node { }
export function assignBaseNode(node: BaseNode) { }