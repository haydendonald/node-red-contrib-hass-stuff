import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";
import { BaseConfigNode } from "../baseConfigNode";

export interface LightControlNodeConfig extends NodeRED.NodeDef {
    configNode: string;
}
export interface LightControlNode extends BaseNode { }


export interface LightControlConfigNodeConfig extends NodeRED.NodeDef { }
export interface LightControlConfigNode extends BaseConfigNode { }