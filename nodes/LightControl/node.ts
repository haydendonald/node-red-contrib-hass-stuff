import * as NodeRED from "node-red";
import { LightControlConfigNode, LightControlNode, LightControlNodeConfig } from "./types";
import { assignBaseNode } from "../baseNode";

export = function LightControl(RED: NodeRED.NodeAPI) {
    function register(this: LightControlNode, config: LightControlNodeConfig) {
        RED.nodes.createNode(this, config);
        assignBaseNode(this);

        const configNode = RED.nodes.getNode(config.configNode) as LightControlConfigNode;

        //When a config node wants to send a message to the output
        configNode.addMsgCallback(this.id, (msg: NodeRED.NodeMessage) => {
            this.send(msg);
        });

        //When an input message is received
        this.on("input", (msg: NodeRED.NodeMessage, send, done) => {
            configNode.msgReceived(msg, this.id);
        });
    }

    RED.nodes.registerType("light-control", register);
}