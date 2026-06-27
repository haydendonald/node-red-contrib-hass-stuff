import * as NodeRED from "node-red";
import { assignBaseNode } from "../baseNode";
import { CurtainControlNode, CurtainControlConfigNode, CurtainControlNodeConfig } from "./curtainControlTypes";

export = function CurtainControlNode(RED: NodeRED.NodeAPI) {
    function register(this: CurtainControlNode, config: CurtainControlNodeConfig) {
        RED.nodes.createNode(this, config);
        assignBaseNode(this);

        const curtainControlConfigNode = RED.nodes.getNode(config.curtainControlConfigNode) as CurtainControlConfigNode;

        //When a config node wants to send a message to the output
        curtainControlConfigNode.addMsgCallback(this.id, (msg: any) => {
            this.send(msg);
        });

        //When an input message is received
        this.on("input", (msg: any, send, done) => {
            curtainControlConfigNode.msgReceived(msg, [this.id]);
        });
    }

    RED.nodes.registerType("curtain-control-node", register);
}