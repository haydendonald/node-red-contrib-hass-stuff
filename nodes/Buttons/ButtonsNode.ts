import * as NodeRED from "node-red";
import { assignBaseNode } from "../baseNode";
import { ButtonsNode, ButtonsNodeConfig, ButtonsConfigNode } from "./ButtonsTypes";

export = function ButtonsNode(RED: NodeRED.NodeAPI) {
    function register(this: ButtonsNode, config: ButtonsNodeConfig) {
        RED.nodes.createNode(this, config);
        assignBaseNode(this);

        const ButtonsConfigNode = RED.nodes.getNode(config.ButtonsConfigNode) as ButtonsConfigNode;
        //When a config node wants to send a message to the output
        ButtonsConfigNode.addMsgCallback(this.id, (msg: any) => {
            this.send(msg);
        });

        //When an input message is received
        this.on("input", (msg: any, send, done) => {
            ButtonsConfigNode.msgReceived(msg, [this.id]);
        });
    }

    RED.nodes.registerType("buttons-node", register);
}