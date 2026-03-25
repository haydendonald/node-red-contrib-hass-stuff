import * as NodeRED from "node-red";
import { assignBaseNode } from "../baseNode";
import { ConnectionsNode, ConnectionsNodeConfig } from "./types";

export = function LightControl(RED: NodeRED.NodeAPI) {
    function register(this: ConnectionsNode, config: ConnectionsNodeConfig) {
        RED.nodes.createNode(this, config);
        assignBaseNode(this);

        //Find out nodes
        const configNodes = [];

        for (const id of [
            config.lightControlConfigNode
        ]) {
            if (id && id != "") {
                const node = RED.nodes.getNode(id);
                if (!node) { continue; }
                configNodes.push(node);
            }
        }

        //Check that we have nodes
        if (configNodes.length === 0) {
            this.error("No config nodes found");
            return;
        }

        this.on("input", (msg: NodeRED.NodeMessage, send, done) => {
            console.log(msg);
        });

        // const configNode = RED.nodes.getNode(config.configNode) as ConnectionsNode;

        //When a config node wants to send a message to the output
        // configNode.addMsgCallback(this.id, (msg: NodeRED.NodeMessage) => {
        //     this.send(msg);
        // });

        // //When an input message is received
        // this.on("input", (msg: NodeRED.NodeMessage, send, done) => {
        //     configNode.msgReceived(msg, this.id);
        // });
    }

    RED.nodes.registerType("connections-node", register);
}