import * as NodeRED from "node-red";
import { assignBaseConfigNode } from "../baseConfigNode";
import { ConnectionsConfigNode } from "../Connections/connectionsTypes";
import { ButtonsConfigNode, ButtonsConfigNodeConfig } from "./ButtonsTypes";

export = function ButtonsConfigNode(RED: NodeRED.NodeAPI) {
    const register = function (this: ButtonsConfigNode, config: ButtonsConfigNodeConfig) {
        const self = this;

        RED.nodes.createNode(this, config);
        assignBaseConfigNode(this);

        const connectionsConfigNode = RED.nodes.getNode(config.connectionsConfigNode) as ConnectionsConfigNode;

        // let errored = false;
        // if (!config.connectionsConfigNode || !connectionsConfigNode) { this.error("Connections Config Node is required"); errored = true; }
        // if (!config.PIROccupancyEntity) { this.error("PIR occupancy entity is required"); errored = true; }
        // if (!config.enabledByDefault) { this.error("Enabled by default is required"); errored = true; }

        // if (errored) { return; }
    }

    RED.nodes.registerType("buttons-config-node", register);
}