import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";

export interface PingSensorNodeConfig extends NodeRED.NodeDef {
    connectionsConfigNode: string;
    ipAddress: string;
    interval: number;
    timeout: number;
}
export interface PingSensorNode extends BaseNode { }