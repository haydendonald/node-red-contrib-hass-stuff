import * as NodeRED from "node-red";
import { assignBaseNode } from "../baseNode";
import { PIRControlNode, PIRControlConfigNode, PIRControlNodeConfig } from "./PIRControlTypes";

export = function PIRControlNode(RED: NodeRED.NodeAPI) {
    function register(this: PIRControlNode, config: PIRControlNodeConfig) {
        RED.nodes.createNode(this, config);
        assignBaseNode(this);

        const PIRControlConfigNode = RED.nodes.getNode(config.PIRControlConfigNode) as PIRControlConfigNode;

        //When a config node wants to send a message to the output
        PIRControlConfigNode.addMsgCallback(this.id, (msg: any) => {
            this.send(msg);
        });

        //When an input message is received
        this.on("input", (msg: any, send, done) => {
            PIRControlConfigNode.msgReceived(msg, [this.id]);
        });
    }

    RED.nodes.registerType("PIR-control-node", register);
}