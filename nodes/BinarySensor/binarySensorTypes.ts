import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";
import { BaseConfigNode } from "../baseConfigNode";

//Node
export interface BinarySensorNodeConfig extends NodeRED.NodeDef {
    binarySensorConfigNode: string;
}
export interface BinarySensorNode extends BaseNode { }

//Config
export interface BinarySensorConfigNodeConfig extends NodeRED.NodeDef {
    connectionsConfigNode: string;
    binarySensorEntity: string;
    luminanceEntity: string;
    minBrightnessLevel: string;
    maxBrightnessLevel: string;
    turnOffAfterMs: string;
    turnOnAfterMs: string;
    enabledByDefault: boolean;
    setDefaultOnRedeploy: boolean;
}
export interface BinarySensorConfigNode extends BaseConfigNode {}