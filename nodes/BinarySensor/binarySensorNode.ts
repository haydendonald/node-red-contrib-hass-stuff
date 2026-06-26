import * as NodeRED from "node-red";
import { assignBaseNode } from "../baseNode";
import { BinarySensorNode, BinarySensorConfigNode, BinarySensorNodeConfig } from "./binarySensorTypes";

export = function BinarySensorNode(RED: NodeRED.NodeAPI) {
    function register(this: BinarySensorNode, config: BinarySensorNodeConfig) {
        RED.nodes.createNode(this, config);
        assignBaseNode(this);

        const binarySensorConfigNode = RED.nodes.getNode(config.binarySensorConfigNode) as BinarySensorConfigNode;

        //When a config node wants to send a message to the output
        binarySensorConfigNode.addMsgCallback(this.id, (msg: any) => {
            this.send(msg);
        });

        //When an input message is received
        this.on("input", (msg: any, send, done) => {
            binarySensorConfigNode.msgReceived(msg, [this.id]);
        });
    }

    RED.nodes.registerType("binary-sensor-node", register);
}