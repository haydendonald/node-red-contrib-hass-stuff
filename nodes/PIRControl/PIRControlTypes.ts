import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";
import { BaseConfigNode } from "../baseConfigNode";

//Node
export interface PIRControlNodeConfig extends NodeRED.NodeDef {
    PIRControlConfigNode: string;
}
export interface PIRControlNode extends BaseNode { }

//Config
export interface PIRControlConfigNodeConfig extends NodeRED.NodeDef {
    connectionsConfigNode: string;
    PIROccupancyEntity: string;
    luminanceEntity: string;
    minBrightnessLevel: string;
    maxBrightnessLevel: string;
    turnOffAfterMs: string;
    turnOnAfterMs: string;
    enabledByDefault: string;
}
export interface PIRControlConfigNode extends BaseConfigNode {}