import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";
import { BaseConfigNode } from "../baseConfigNode";

//Node
export interface CurtainControlNodeConfig extends NodeRED.NodeDef {
    curtainControlConfigNode: string;
}
export interface CurtainControlNode extends BaseNode { }

//Config
export interface CurtainControlConfigNodeConfig extends NodeRED.NodeDef {
    connectionsConfigNode: string;
    coverEntity: string;
    luminanceEntity: string;
    curtainClosedLuminance: string;
    curtainHalfLuminance: string;
    halfPosition: number;
    enabledByDefault: boolean;
    setDefaultOnRedeploy: boolean;
}
export interface CurtainControlConfigNode extends BaseConfigNode {}