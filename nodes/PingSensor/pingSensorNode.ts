import * as NodeRED from "node-red";
import { assignBaseNode } from "../baseNode";
import { PingSensorNode, PingSensorNodeConfig } from "./pingSensorTypes";
import { ConnectionsConfigNode } from "../Connections/connectionsTypes";
import { getEntityId } from "../utility";
import * as ping from "ping";

export = function PingSensorNode(RED: NodeRED.NodeAPI) {
    function register(this: PingSensorNode, config: PingSensorNodeConfig) {
        const self = this;

        //Validate the config
        let hasValidationError: boolean = false;
        if (!config.name) { self.error("Name is required"); hasValidationError = true; }
        if (!config.connectionsConfigNode) { self.error("Connections config node is required"); hasValidationError = true; }
        if (!config.ipAddress) { self.error("IP Address is required"); hasValidationError = true; }
        if (!config.interval || config.interval <= 0) { self.error("Interval must be a positive number"); hasValidationError = true; }
        if (!config.timeout || config.timeout <= 0) { self.error("Timeout must be a positive number"); hasValidationError = true; }
        if (hasValidationError) { return; }

        let lastPingChange: Date | undefined; //When was the last time the ping state changed
        let lastState: boolean | undefined; //Was it connected last time we pinged it
        let currentState: boolean | undefined; //The current state of the device
        let interval: NodeJS.Timeout;

        //Try to ping the device to see if it is connected
        let attemptPing: () => Promise<void>;

        RED.nodes.createNode(this, config);
        assignBaseNode(this);

        const connectionsConfigNode = RED.nodes.getNode(config.connectionsConfigNode) as ConnectionsConfigNode;

        //When HASS is ready
        connectionsConfigNode.hassEventReadyCallbacks[this.id] = function (msg: NodeRED.NodeMessage) {
            //Add our sensor to track if the device is found
            const setState = connectionsConfigNode.addHASSSensor({
                friendlyName: `${self.name} - Connected`,
                id: getEntityId("sensor", `${self.name}_connected`),
                defaultState: false
            });

            //Attempt to ping the device
            attemptPing = async () => {
                const now = new Date();

                //Try to ping the device
                const res = await ping.promise.probe(config.ipAddress, {
                    timeout: Math.ceil(config.interval / 1000),
                    min_reply: 1,
                });

                //If the state changed, update
                if (res.alive != lastState) {
                    lastPingChange = now;
                    lastState = res.alive;
                }

                //If the time in the current state exceeds the timeout, consider it changed
                if (currentState != lastState && lastPingChange && (now.getTime() - lastPingChange.getTime()) >= config.timeout) {
                    currentState = lastState;

                    //Update the sensor state with the latest ping result
                    setState(currentState, {
                        host: config.ipAddress
                    });
                }

                //Reschedule the next ping attempt
                interval = setTimeout(attemptPing, config.interval);
            }

            attemptPing();
        }

        //Cleanup on close
        this.on("close", function () {
            if (interval) { clearTimeout(interval); }
        });
    }

    RED.nodes.registerType("ping-sensor-node", register);
}