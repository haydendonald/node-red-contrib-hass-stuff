import * as NodeRED from "node-red";
import { LightControlConfigNode, LightControlConfigNodeConfig } from "./types";
import { assignBaseConfigNode } from "../baseConfigNode";

export = function LightControlConfig(RED: NodeRED.NodeAPI) {
    const register = function(this: LightControlConfigNode, config: LightControlConfigNodeConfig) {
        RED.nodes.createNode(this, config);
        assignBaseConfigNode(this);


        this.msgReceived = function(msg: NodeRED.NodeMessage, senderId?: string) {





        }
    }

    RED.nodes.registerType("light-control-config", register);
}