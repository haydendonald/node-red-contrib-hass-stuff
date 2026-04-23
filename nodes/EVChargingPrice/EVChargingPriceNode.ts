import * as NodeRED from "node-red";
import { assignBaseNode } from "../baseNode";
import { EVChargingPriceNode, EVChargingPriceNodeConfig } from "./EVChargingPriceTypes";
import { ConnectionsConfigNode } from "../Connections/connectionsTypes";
import { getEntityId } from "../utility";

export = function EVChargingPriceNode(RED: NodeRED.NodeAPI) {
    function register(this: EVChargingPriceNode, config: EVChargingPriceNodeConfig) {
        const self = this;

        //Validate the config
        let hasValidationError: boolean = false;
        if (!config.connectionsConfigNode) { self.error("Connections config node is required"); hasValidationError = true; }
        if (!config.priceEntityId) { self.error("Price entity ID is required"); hasValidationError = true; }
        if (!config.chargingEntityId) { self.error("Charging entity ID is required"); hasValidationError = true; }
        if (!config.homeEntityId) { self.error("Home entity ID is required"); hasValidationError = true; }
        if (!config.chargeRate || parseFloat(config.chargeRate) <= 0) { self.error("Charge rate must be a positive number"); hasValidationError = true; }
        if (!config.peakRate || parseFloat(config.peakRate) <= 0) { self.error("Peak rate must be a positive number"); hasValidationError = true; }
        if (!config.offPeakRate || parseFloat(config.offPeakRate) <= 0) { self.error("Off-peak rate must be a positive number"); hasValidationError = true; }
        if (!config.peakRateHours) { self.error("Peak rate hours are required"); hasValidationError = true; }
        if (!config.peakRateDays) { self.error("Peak rate days are required"); hasValidationError = true; }
        if (hasValidationError) { return; }

        let chargingState: string;
        let homeState: string;
        let priceState: string;
        let startedChargingAtHomeState: string;
        let startedChargingAt: any;
        let finishedChargingAt: any;

        //Set the price value
        function setPrice(value: number) {
            connectionsConfigNode.sendHASSAction("input_number.set_value", {
                entity_id: [config.priceEntityId]
            }, { value });
        }

        RED.nodes.createNode(this, config);
        assignBaseNode(this);

        const connectionsConfigNode = RED.nodes.getNode(config.connectionsConfigNode) as ConnectionsConfigNode;

        //When HASS is ready
        connectionsConfigNode.hassEventReadyCallbacks[this.id] = function (msg: NodeRED.NodeMessage) {
            // Get the current state of the charger
            connectionsConfigNode.getHASSEntityState(config.chargingEntityId, (payload, data) => {
                chargingState = data.data.state;

                if (chargingState == "Charging") {
                    startedChargingAt = data.data.last_changed;
                }
                else {
                    finishedChargingAt = data.data.last_changed;
                }
            });

            // Get the current state of the home
            connectionsConfigNode.getHASSEntityState(config.homeEntityId, (payload, data) => { homeState = data.data.state; });

            //Get the current state of the price
            connectionsConfigNode.getHASSEntityState(config.priceEntityId, (payload, data) => { priceState = data.data.state; });

            //Add a boolean to keep track if the charger started while at home
            connectionsConfigNode.addHASSInputBoolean({
                friendlyName: `${self.name} - Started Charging at Home`,
                id: getEntityId("input_boolean", `${self.name}_started_charging_at_home`),
                defaultState: "off",
                creationCallback: (state) => {
                    startedChargingAtHomeState = state;
                },
                changedCallback: (state) => {
                    startedChargingAtHomeState = state;
                }
            });

            //Add a button to reset the price
            connectionsConfigNode.addHASSButton({
                friendlyName: `${self.name} - Reset Price`,
                id: getEntityId("button", `${self.name}_reset_price`),
                pressedCallback: () => {
                    setPrice(0.0);
                }
            });
        }

        //When a state change happens in home assistant
        connectionsConfigNode.hassEventStateChangeCallbacks[this.id] = function (entityId: string, oldState: any, newState: any) {
            switch (entityId) {
                case config.homeEntityId: {
                    homeState = newState.state;
                    handle();
                    break;
                }
                case config.chargingEntityId: {
                    chargingState = newState.state;

                    if (chargingState == "Charging") {
                        startedChargingAt = newState.last_changed;
                        finishedChargingAt = undefined;
                    }
                    else {
                        finishedChargingAt = newState.last_changed;
                    }

                    handle();
                    break;
                }
                case config.priceEntityId: {
                    priceState = newState.state;
                    break;
                }
            }
        }

        function sendNotification(title: string, message: string) {
            if (config.notificationId) {
                connectionsConfigNode.sendCompanionNotification({
                    entityIds: [config.notificationId],
                    message,
                    title
                });
            }
        }

        function handle() {
            //Set started charging at home if user is home and car is charging
            if (startedChargingAtHomeState == "off" && (chargingState == "Charging" && homeState == "home")) {
                connectionsConfigNode.sendHASSAction("input_boolean.turn_on", { entity_id: [getEntityId("input_boolean", `${self.name}_started_charging_at_home`)] });
                sendNotification(`Charging has started for ${self.name}`, `Charging has started for ${self.name}`);

            }

            //Car has stopped charging and had started while at home
            if (chargingState != "Charging" && startedChargingAtHomeState == "on") {
                connectionsConfigNode.sendHASSAction("input_boolean.turn_off", { entity_id: [getEntityId("input_boolean", `${self.name}_started_charging_at_home`)] });

                const powerKW = parseFloat(config.chargeRate);
                const peakHours = config.peakRateHours.split(",").map((h: string) => parseInt(h.trim()));
                const peakDays = config.peakRateDays.split(",").map((d: string) => parseInt(d.trim()));
                const pricePeak = parseFloat(config.peakRate);
                const priceOffPeak = parseFloat(config.offPeakRate);

                const startDate = new Date(startedChargingAt);
                const endDate = new Date(finishedChargingAt);

                if (endDate < startDate) {
                    self.error("Finished charging time is before started charging time. Cannot calculate");
                    return;
                }

                // Calculate time spent in peak and off-peak periods
                // Split charging period at hour boundaries for accurate rate calculation
                let timeInPeakMs = 0;
                let timeInOffPeakMs = 0;

                let currentTime = new Date(startDate);
                while (currentTime < endDate) {
                    // Find the next hour boundary or end of charging period
                    const nextHourBoundary = new Date(currentTime);
                    nextHourBoundary.setHours(currentTime.getHours() + 1, 0, 0, 0);

                    const segmentEnd = nextHourBoundary > endDate ? endDate : nextHourBoundary;
                    const duration = segmentEnd.getTime() - currentTime.getTime();

                    const currentHour = currentTime.getHours();
                    const currentDay = currentTime.getDay();

                    // Check if current time falls in peak period
                    const isPeak = peakHours.includes(currentHour) && peakDays.includes(currentDay);

                    if (isPeak) {
                        timeInPeakMs += duration;
                    } else {
                        timeInOffPeakMs += duration;
                    }

                    currentTime = segmentEnd;
                }

                // Calculate the price
                const timeInPeakHours = timeInPeakMs / 3600000;
                const timeInOffPeakHours = timeInOffPeakMs / 3600000;
                const totalHours = timeInPeakHours + timeInOffPeakHours;

                const peakPrice = powerKW * timeInPeakHours * pricePeak;
                const offPeakPrice = powerKW * timeInOffPeakHours * priceOffPeak;
                const totalPrice = peakPrice + offPeakPrice;
                const rollingPrice = parseFloat((parseFloat(priceState) + totalPrice).toFixed(2));

                // Update the price
                setPrice(rollingPrice);
                sendNotification(`Charging has finished for ${self.name}`, `Charging finished for ${self.name}. Was charging for ${totalHours.toFixed(2)} hours. The charge session was $${totalPrice.toFixed(2)}, the total so far is $${rollingPrice}`);
            }
        }
    }

    RED.nodes.registerType("ev-charging-price-node", register);
}