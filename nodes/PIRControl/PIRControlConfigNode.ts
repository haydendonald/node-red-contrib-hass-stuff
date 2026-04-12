import * as NodeRED from "node-red";
import { assignBaseConfigNode } from "../baseConfigNode";
import { PIRControlConfigNode, PIRControlConfigNodeConfig } from "./PIRControlTypes";
import { ConnectionsConfigNode } from "../Connections/connectionsTypes";
import { getEntityId } from "../utility";

export = function PIRControlConfigNode(RED: NodeRED.NodeAPI) {
    const register = function (this: PIRControlConfigNode, config: PIRControlConfigNodeConfig) {
        const self = this;

        let PIROccupancyState: any;
        let luminanceState: any;
        let enabledState: string;

        let detectedTimeout: NodeJS.Timeout;
        let notDetectedTimeout: NodeJS.Timeout;
        
        let sentOnState: boolean = false;

        RED.nodes.createNode(this, config);
        assignBaseConfigNode(this);

        //When NodeRED redeploys
        self.on("close", function (done: any) {
            clearTimeout(detectedTimeout);
            clearTimeout(notDetectedTimeout);
            done();
        });

        const connectionsConfigNode = RED.nodes.getNode(config.connectionsConfigNode) as ConnectionsConfigNode;

        let errored = false;
        if (!config.connectionsConfigNode || !connectionsConfigNode) { this.error("Connections Config Node is required"); errored = true; }
        if (!config.PIROccupancyEntity) { this.error("PIR occupancy entity is required"); errored = true; }
        if (!config.enabledByDefault) { this.error("Enabled by default is required"); errored = true; }

        if (errored) { return; }

        //When HASS is ready
        connectionsConfigNode.hassEventReadyCallbacks[this.id] = function (msg: NodeRED.NodeMessage) {
            //Get the current state of the occupancy sensor
            connectionsConfigNode.getHASSEntityState(config.PIROccupancyEntity, (payload, data) => {
                PIROccupancyState = data.data;
            });

            //If there is a luminance entity get it's state
            if (config.luminanceEntity && config.luminanceEntity != "") {
                connectionsConfigNode.getHASSEntityState(config.luminanceEntity, (payload, data) => {
                    luminanceState = data.data;
                });
            }

            //Add the enabled input boolean
            connectionsConfigNode.addHASSInputBoolean({
                friendlyName: `${self.name} - Enabled`,
                id: getEntityId("input_boolean", `${self.name}_enabled`),
                defaultState: config.enabledByDefault ? "on" : "off",
                creationCallback: (state: any, response: any) => {
                    enabledState = state;
                },
                changedCallback: (state: any, serviceData: any) => {
                    enabledState = state;
                }
            });
        }

        //When a state change happens in home assistant
        connectionsConfigNode.hassEventStateChangeCallbacks[this.id] = function (entityId: string, oldState: any, newState: any) {
            switch (entityId) {
                case config.PIROccupancyEntity: {
                    PIROccupancyState = newState;
                    handle();
                    break;
                }
                case config.luminanceEntity: {
                    luminanceState = newState;
                    break;
                }
            }
        }

        function handle() {
            //Don't do anything if the PIR is disabled
            if (enabledState == "off") { return; }

            //Don't do anything if the luminance is not enough
            if (sentOnState == false && config.minBrightnessLevel && parseInt(luminanceState.state) < parseInt(config.minBrightnessLevel)) { return; }

            //Don't do anything if the luminance is too much
            if (sentOnState == false && config.maxBrightnessLevel && parseInt(luminanceState.state) > parseInt(config.maxBrightnessLevel)) { return; }

            const msg = {
                payload: {
                    PIROccupancyState,
                    enabledState,
                    luminanceState
                }
            }

            //Send the detected event
            if (PIROccupancyState.state == "on") {
                clearTimeout(notDetectedTimeout);
                if (config.turnOnAfterMs) {
                    detectedTimeout = setTimeout(() => {
                        sendDetectedMsg(msg);
                    }, parseInt(config.turnOnAfterMs));
                }
                else {
                    sendDetectedMsg(msg);
                }
            }

            //Send the not detected event
            if (PIROccupancyState.state == "off") {
                clearTimeout(detectedTimeout);
                if (config.turnOffAfterMs) {
                    notDetectedTimeout = setTimeout(() => {
                        sendNotDetectedMsg(msg);
                    }, parseInt(config.turnOffAfterMs));
                }
                else {
                    sendNotDetectedMsg(msg);
                }
            }
        }

        function sendDetectedMsg(msg: any) {
            sentOnState = true;
            self.sendMsg([msg]);
        }

        function sendNotDetectedMsg(msg: any) {
            sentOnState = false;
            self.sendMsg([undefined, msg]);
        }
    }

    RED.nodes.registerType("PIR-control-config-node", register);
}