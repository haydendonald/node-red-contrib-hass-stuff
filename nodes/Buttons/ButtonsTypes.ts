import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";
import { BaseConfigNode } from "../baseConfigNode";

//Node
export interface ButtonsNodeConfig extends NodeRED.NodeDef {
    ButtonsConfigNode: string;
}
export interface ButtonsNode extends BaseNode { }

//Config
export interface ButtonsConfigNodeConfig extends NodeRED.NodeDef {
    connectionsConfigNode: string;
}
export interface ButtonsConfigNode extends BaseConfigNode {}