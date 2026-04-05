import * as NodeRED from "node-red";
import { LightControlConfigNode, LightControlNode, LightControlNodeConfig } from "./lightControlTypes";
import { assignBaseNode } from "../baseNode";

export = function LightControlNode(RED: NodeRED.NodeAPI) {
    function register(this: LightControlNode, config: LightControlNodeConfig) {
        RED.nodes.createNode(this, config);
        assignBaseNode(this);

        const lightControlConfigNode = RED.nodes.getNode(config.lightControlConfigNode) as LightControlConfigNode;

        //When a config node wants to send a message to the output
        lightControlConfigNode.addMsgCallback(this.id, (msg: any) => {
            this.send(msg);
        });

        //When an input message is received
        this.on("input", (msg: any, send, done) => {
            lightControlConfigNode.msgReceived(msg, [this.id]);
        });
    }

    RED.nodes.registerType("light-control-node", register);
}