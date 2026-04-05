import * as NodeRED from "node-red";
import { assignBaseNode } from "../baseNode";
import { ConnectionsConfigNode, ConnectionsNode, ConnectionsNodeConfig, Topics } from "./connectionsTypes";

export = function ConnectionsNode(RED: NodeRED.NodeAPI) {
    function register(this: ConnectionsNode, config: ConnectionsNodeConfig) {
        RED.nodes.createNode(this, config);
        assignBaseNode(this);

        const connectionsConfigNode = RED.nodes.getNode(config.connectionsConfigNode) as ConnectionsConfigNode;

        //When a config node wants to send a message to the output
        connectionsConfigNode.addMsgCallback(this.id, (msg: any) => {
            this.send(msg);
        });

        this.on("input", (msg: any, send, done) => {
            connectionsConfigNode.msgReceived(msg, [this.id]);
        });
    }

    RED.nodes.registerType("connections-node", register);
}