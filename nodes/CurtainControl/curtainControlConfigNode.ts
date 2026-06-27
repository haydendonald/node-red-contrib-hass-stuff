import * as NodeRED from "node-red";
import { assignBaseConfigNode } from "../baseConfigNode";
import { CurtainControlConfigNode, CurtainControlConfigNodeConfig } from "./curtainControlTypes";
import { ConnectionsConfigNode } from "../Connections/connectionsTypes";
import { getEntityId } from "../utility";

export = function CurtainControlConfigNode(RED: NodeRED.NodeAPI) {
    const register = function (this: CurtainControlConfigNode, config: CurtainControlConfigNodeConfig) {
        const self = this;

        let coverState: any;
        let luminanceState: any;
        let enabledState: string;
        let wantedPositionState: string;

        //Every minute check if we need to do anything
        let checkerInterval = setInterval(() => {
            handle();
        }, 60000);

        RED.nodes.createNode(this, config);
        assignBaseConfigNode(this);

        //Cleanup on close
        this.on("close", function () {
            if (checkerInterval) { clearInterval(checkerInterval); }
        });

        const connectionsConfigNode = RED.nodes.getNode(config.connectionsConfigNode) as ConnectionsConfigNode;

        let errored = false;
        if (!config.connectionsConfigNode || !connectionsConfigNode) { this.error("Connections Config Node is required"); errored = true; }
        if (!config.coverEntity) { this.error("Cover entity is required"); errored = true; }
        if (config.enabledByDefault === undefined) { this.error("Enabled by default is required"); errored = true; }
        if (config.setDefaultOnRedeploy === undefined) { this.error("Set default on redeploy is required"); errored = true; }

        if (errored) { return; }

        //When HASS is ready
        connectionsConfigNode.hassEventReadyCallbacks[this.id] = function (msg: NodeRED.NodeMessage) {
            //Get the current state of the cover entity
            connectionsConfigNode.getHASSEntityState(config.coverEntity, (payload, data) => {
                coverState = data.data;
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
                forceDefaultStateOnCreation: config.setDefaultOnRedeploy,
                creationCallback: (state: any, response: any) => {
                    enabledState = state;
                },
                changedCallback: (state: any, serviceData: any) => {
                    enabledState = state;
                }
            });

            //Add a select to select the wanted state of the curtain
            connectionsConfigNode.addHASSSelect({
                friendlyName: `${self.name} - Position`,
                id: getEntityId("select", `${self.name}_position`),
                options: [
                    "Open",
                    "Half",
                    "Close"
                ],
                defaultState: "Close",
                creationCallback: (state: any, response: NodeRED.NodeMessage) => {
                    wantedPositionState = state;
                },
                activatedCallback: (state: string, serviceData: any, response: NodeRED.NodeMessage) => {
                    wantedPositionState = state;
                    handle();
                }
            });
        }

        //When a state change happens in home assistant
        connectionsConfigNode.hassEventStateChangeCallbacks[this.id] = function (entityId: string, oldState: any, newState: any) {
            switch (entityId) {
                case config.coverEntity: {
                    coverState = newState;
                    break;
                }
                case config.luminanceEntity: {
                    luminanceState = newState;
                    break;
                }
            }
        }

        function conditionsMatches(config: string): boolean {
            if (config == "[disabled]") { return false; }
            if (config == "") { return false; }

            const luminance = luminanceState?.state ? parseFloat(luminanceState.state) : null;
            if (!luminance) { return false; }
            const hourOfDay = new Date().getHours();

            //Get the operator between luminance and time
            const isAnd = config.includes(" and ");
            const isOr = config.includes(" or ");
            if (isAnd && isOr) {
                self.error("Luminance config cannot contain both 'and' and 'or'");
                return false;
            }
            if (!isAnd && !isOr) {
                self.error("Luminance config must contain either 'and' or 'or'");
                return false;
            }

            const luminanceConfig = isAnd ? config.split(" and ")[0] : config.split(" or ")[0];
            const timeConfig = isAnd ? config.split(" and ")[1] : config.split(" or ")[1];

            const checkConditions = (value: number, config: string): boolean => {
                const ranges = config.split(",");
                for (const range of ranges) {
                    //Disabled
                    if (range === "[disabled]") { return true; }
                    //More than
                    else if (range.startsWith("<")) {
                        if (value < parseFloat(range.substring(1))) { return true; }
                    }
                    //Less than
                    else if (range.startsWith(">")) {
                        if (value > parseFloat(range.substring(1))) { return true; }
                    }
                    //Range
                    else if (range.includes("-")) {
                        const [min, max] = range.split("-").map(parseFloat);
                        if (value >= min && value <= max) { return true; }
                    }
                }
                return false;
            }

            const luminanceMatches = checkConditions(luminance, luminanceConfig);
            const timeMatches = checkConditions(hourOfDay, timeConfig);

            if (isAnd) {
                return luminanceMatches && timeMatches;
            } else {
                return luminanceMatches || timeMatches;
            }
        }

        function handle() {
            let position = wantedPositionState;

            //Don't do anything if we are disabled
            if (enabledState == "on") {
                //Override the position if we are not closed and any of the conditions match
                if (position != "Close") {
                    //If the luminance matches the curtain closed luminance config, force the position to close
                    if (conditionsMatches(config.curtainClosedLuminance)) { position = "Close"; }

                    //If the luminance matches the curtain half luminance config, force the position to half
                    else if (conditionsMatches(config.curtainHalfLuminance)) { position = "Half"; }
                }
            }

            //Control the curtain!
            switch (position) {
                case "Open": {
                    //Don't do it if the curtain is already open
                    if (coverState?.attributes?.current_position == 100) { return; }

                    connectionsConfigNode.sendHASSAction("cover.open_cover", { entity_id: [config.coverEntity] }, {});
                    break;
                }
                case "Half": {
                    //Don't do it if the curtain is already half
                    if (coverState?.attributes?.current_position == config.halfPosition) { return; }

                    connectionsConfigNode.sendHASSAction("cover.set_cover_position", { entity_id: [config.coverEntity] }, {
                        position: config.halfPosition
                    });
                    break;
                }
                case "Close": {
                    //Don't do it if the curtain is already closed
                    if (coverState?.attributes?.current_position == 0) { return; }

                    connectionsConfigNode.sendHASSAction("cover.close_cover", { entity_id: [config.coverEntity] }, {});
                    break;
                }
            }
        }
    }

    RED.nodes.registerType("curtain-control-config-node", register);
}