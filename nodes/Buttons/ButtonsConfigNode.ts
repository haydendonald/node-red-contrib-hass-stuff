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

        //Validate
        let errored = false;
        if (!config.connectionsConfigNode || !connectionsConfigNode) { this.error("Connections Config Node is required"); errored = true; }
        if (!config.entityId) { this.error("Entity ID is required"); errored = true; }
        if (!config.buttonType) { this.error("Button type is required"); errored = true; }

        if (errored) { return; }


        connectionsConfigNode.hassEventStateChangeCallbacks[this.id] = function(entityId, newState, oldState) {
            if (entityId === config.entityId) {
                console.log(newState)
            }
        };


    }

    RED.nodes.registerType("buttons-config-node", register);
}