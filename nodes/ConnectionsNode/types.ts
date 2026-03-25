import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";

export interface ConnectionsNodeConfig extends NodeRED.NodeDef {
    lightControlConfigNode: string;
}
export interface ConnectionsNode extends BaseNode { }