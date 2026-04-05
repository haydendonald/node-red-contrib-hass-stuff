import * as NodeRED from "node-red";
import { assignBaseConfigNode } from "../baseConfigNode";
import { ConnectionsConfigNode, ConnectionsConfigNodeConfig, ConnectionsMsg, Topics } from "./connectionsTypes";
import { generateRandomId, getEntityId } from "../utility";

export = function ConnectionsConfigNode(RED: NodeRED.NodeAPI) {
    const register = function (this: ConnectionsConfigNode, config: ConnectionsConfigNodeConfig) {
        RED.nodes.createNode(this, config);
        assignBaseConfigNode(this);

        const self = this;

        self.hassAPICallbacks = {};
        self.hassActionCallbacks = {};
        self.hassCurrentStateCallbacks = {};
        self.hassGetEntitiesCallbacks = {};

        self.hassEventReadyCallbacks = {};
        self.hassEventCallbacks = {};
        self.hassEventCallServiceCallbacks = {};
        self.hassEventStateChangeCallbacks = {};

        self.sendHASSAPI = function (protocol: "http" | "websocket", method: "get" | "post", path: string, callback?: (response: NodeRED.NodeMessage) => void, params?: any, data?: any, results?: string) {
            const callbackId = callback ? generateRandomId(Object.keys(self.hassAPICallbacks)) : undefined;

            const msg: ConnectionsMsg = {
                topic: Topics.API,
                callbackId,
                payload: {
                    protocol,
                    method,
                    path,
                    data,
                    params,
                    results
                }
            }
            self.sendMsg(msg);

            //Add our callback for when a response comes back in
            if (callbackId && callback) {
                self.hassAPICallbacks[callbackId] = callback;
            }
        }

        self.sendHASSAction = function (action: string, target?: {
            floor_id?: string[],
            area_id?: string[],
            device_id?: string[],
            entity_id?: string[]
        }, data?: any, callback?: (action: string, target: {
            floor_id?: string[],
            area_id?: string[],
            device_id?: string[],
            entity_id?: string[]
        }, data: any) => void) {
            const callbackId = callback ? generateRandomId(Object.keys(self.hassActionCallbacks)) : undefined;

            const msg: ConnectionsMsg = {
                topic: Topics.ACTION,
                callbackId,
                payload: {
                    action,
                    target,
                    data
                }
            }
            self.sendMsg(msg);

            //Add our callback for when a response comes back in
            if (callbackId && callback) {
                self.hassActionCallbacks[callbackId] = callback;
            }
        }

        self.getHASSEntityState = function (entityId: string, callback?: (payload: any, data: any) => void) {
            const callbackId = callback ? generateRandomId(Object.keys(self.hassCurrentStateCallbacks)) : undefined;

            const msg: ConnectionsMsg = {
                topic: Topics.STATE,
                callbackId,
                payload: {
                    entityId
                }
            }
            self.sendMsg(msg);

            //Add our callback for when a response comes back in
            if (callbackId && callback) {
                self.hassCurrentStateCallbacks[callbackId] = callback;
            }
        }

        self.getHASSEntities = function (rules: [
            {
                condition?: string,
                property?: string,
                logic?: string,
                value?: string,
                valueType?: string,
                outputType?: string,
                outputEmptyResults?: boolean,
                outputLocationType?: string,
                outputLocation?: string,
                outputResultsCount?: number
            }
        ], callback?: (entities: any[]) => void) {
            const callbackId = callback ? generateRandomId(Object.keys(self.hassGetEntitiesCallbacks)) : undefined;

            const msg: ConnectionsMsg = {
                topic: Topics.GET_ENTITIES,
                callbackId,
                payload: {
                    rules
                }
            }
            self.sendMsg(msg);

            //Add our callback for when a response comes back in
            if (callbackId && callback) {
                self.hassGetEntitiesCallbacks[callbackId] = callback;
            }
        }

        self.addHASSEntity = function (entityId: string, data: any, callback?: (response: NodeRED.NodeMessage) => void) {
            self.sendHASSAPI("http", "post", "/api/states/" + entityId, callback, undefined, data);
        }

        self.addHASSInputBoolean = function (options: {
            friendlyName: string,
            id?: string,
            state?: string,
            creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
            changedCallback?: (state: any, serviceData: any) => void
        }) {
            let currentState: string = options.state || "unknown";

            const entityId = options.id ? options.id : getEntityId("input_boolean", options.friendlyName);
            const data = (state: any) => {
                return {
                    state: state || "unknown",
                    attributes: {
                        friendly_name: options.friendlyName
                    }
                }
            };

            //Add the input boolean to HASS
            self.getHASSEntities([{ property: "entity_id", logic: "is", value: entityId }], (entities) => {
                if (entities.length > 1) { self.error(`Found more than 1 entity for ${entityId}`); return; }

                const previousState = entities.length == 1 ? entities[0].state : "unknown";
                self.addHASSEntity(entityId, data(options.state || previousState), options.creationCallback ? (response: any) => {
                    options.creationCallback!(response.payload.state, response);
                } : undefined);
            });
            //Assign the changed callback if set
            if (options.changedCallback) {
                self.hassEventCallServiceCallbacks[entityId] = function (domain: string, service: string, serviceData: any) {
                    if (domain == "input_boolean" && serviceData?.entity_id == entityId) {

                        let state = currentState;
                        if (service == "turn_on") {
                            state = "on";
                        }
                        else if (service == "turn_off") {
                            state = "off";
                        }
                        else if (service == "toggle") {
                            state = state === "on" ? "off" : "on";
                        }
                        currentState = state;

                        //Tell HASS that the button was pressed
                        self.sendHASSAPI("http", "post", "/api/states/" + entityId, undefined, undefined, data(currentState));

                        options.changedCallback!(currentState, serviceData);
                    }
                }
            }
        }

        self.addHASSButton = function (options: {
            friendlyName: string,
            id?: string,
            state?: string,
            creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
            pressedCallback?: (state: any, serviceData: any) => void
        }) {
            const entityId = options.id ?? getEntityId("button", options.friendlyName);
            const data = (state: any) => {
                return {
                    state: state || "unknown",
                    attributes: {
                        friendly_name: options.friendlyName
                    }
                }
            };

            //Add the button to HASS
            self.getHASSEntities([{ property: "entity_id", logic: "is", value: entityId }], (entities) => {
                if (entities.length > 1) { self.error(`Found more than 1 entity for ${entityId}`); return; }

                const previousState = entities.length == 1 ? entities[0].state : "unknown";
                self.addHASSEntity(entityId, data(options.state || previousState), options.creationCallback ? (response: any) => {
                    options.creationCallback!(response.payload.state, response);
                } : undefined);
            });

            //Assign the pressed callback if set
            if (options.pressedCallback) {
                self.hassEventCallServiceCallbacks[entityId] = function (domain: string, service: string, serviceData: any) {
                    if (domain == "button" && service == "press" && serviceData?.entity_id == entityId) {

                        const state = new Date();

                        //Tell HASS that the button was pressed
                        self.sendHASSAPI("http", "post", "/api/states/" + entityId, undefined, undefined, data(state));

                        options.pressedCallback!(state, serviceData);
                    }
                }
            }
        }

        self.addHASSScene = function (options: {
            friendlyName: string,
            id?: string,
            state?: string,
            creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
            activatedCallback?: (state: any, serviceData: any) => void
        }) {
            const entityId = options.id || getEntityId("scene", options.friendlyName);
            const data = (state: any) => {
                return {
                    state: state || "unknown",
                    attributes: {
                        friendly_name: options.friendlyName
                    }
                }
            };

            //Add the scene to HASS
            self.getHASSEntities([{ property: "entity_id", logic: "is", value: entityId }], (entities) => {
                if (entities.length > 1) { self.error(`Found more than 1 entity for ${entityId}`); return; }

                const previousState = entities.length == 1 ? entities[0].state : "unknown";
                self.addHASSEntity(entityId, data(options.state || previousState), options.creationCallback ? (response: any) => {
                    options.creationCallback!(response.payload.state, response);
                } : undefined);
            });

            //Assign the activated callback if set
            if (options.activatedCallback) {
                self.hassEventCallServiceCallbacks[entityId] = function (domain: string, service: string, serviceData: any) {
                    if (domain == "scene" && service == "turn_on") {
                        const entities = typeof serviceData.entity_id == "string" ? [serviceData.entity_id] : serviceData.entity_id;
                        if (!entities.includes(entityId)) { return; }

                        const state = new Date();

                        //Tell HASS that the scene was activated
                        self.sendHASSAPI("http", "post", "/api/states/" + entityId, undefined, undefined, data(state));

                        options.activatedCallback!(state, serviceData);
                    }
                }
            }
        }

        self.addHASSSelect = function (options: {
            friendlyName: string,
            id?: string,
            state?: string,
            options: string[],
            creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
            activatedCallback?: (state: any, serviceData: any) => void
        }) {
            const entityId = options.id || getEntityId("select", options.friendlyName);
            const data = (state: string) => {
                return {
                    state: state || "unknown",
                    attributes: {
                        friendly_name: options.friendlyName,
                        options: options.options
                    }
                }
            };

            //Add the select to HASS
            self.getHASSEntities([{ property: "entity_id", logic: "is", value: entityId }], (entities) => {
                if (entities.length > 1) { self.error(`Found more than 1 entity for ${entityId}`); return; }

                const previousState = entities.length == 1 ? entities[0].state : "unknown";
                self.addHASSEntity(entityId, data(options.state || previousState), options.creationCallback ? (response: any) => {
                    options.creationCallback!(response.payload.state, response);
                } : undefined);
            });

            //Assign the activated callback if set
            if (options.activatedCallback) {
                self.hassEventCallServiceCallbacks[entityId] = function (domain: string, service: string, serviceData: any) {
                    if (domain == "select") {
                        const entities = typeof serviceData.entity_id == "string" ? [serviceData.entity_id] : serviceData.entity_id;
                        if (!entities.includes(entityId)) { return; }

                        if (service == "select_option") {
                            self.sendHASSAPI("http", "post", "/api/states/" + entityId, undefined, undefined, data(serviceData.option));
                            options.activatedCallback!(serviceData.option, serviceData);
                        }
                        else if (service == "select_first") {
                            self.sendHASSAPI("http", "post", "/api/states/" + entityId, undefined, undefined, data(options.options[0] || "unknown"));
                            options.activatedCallback!(options.options[0] || "unknown", serviceData);
                        }
                        else if (service == "select_last") {
                            self.sendHASSAPI("http", "post", "/api/states/" + entityId, undefined, undefined, data(options.options[options.options.length - 1] || "unknown"));
                            options.activatedCallback!(options.options[options.options.length - 1] || "unknown", serviceData);
                        }
                        else if (service == "select_previous" || service == "select_next") {
                            self.getHASSEntityState(entityId, (currentState) => {
                                let index = options.options.indexOf(currentState);

                                if (service == "select_previous") {
                                    index = index - 1;
                                    if (index < 0 && serviceData.cycle) { index = options.options.length - 1; }
                                    if (index < 0 && !serviceData.cycle) { index = 0; }
                                }
                                else if (service == "select_next") {
                                    index = index + 1;
                                    if (index >= options.options.length && serviceData.cycle) { index = 0; }
                                    if (index >= options.options.length && !serviceData.cycle) { index = options.options.length - 1; }
                                }

                                self.sendHASSAPI("http", "post", "/api/states/" + entityId, undefined, undefined, data(options.options[index] || "unknown"));
                                options.activatedCallback!(options.options[index] || "unknown", serviceData);
                            });
                        }
                    }
                }
            }
        }

        self.handleCallback = function <T extends any[]>(callbacks: Record<string, (...args: T) => void>, callbackId?: string, ...args: T) {
            //This is a specific callback id
            if (callbackId) {
                callbacks[callbackId]?.(...args);
                delete callbacks[callbackId];
                return;
            }

            //Send to everyone
            for (const id of Object.keys(callbacks)) {
                if (callbacks[id]) { callbacks[id](...args); }
            }
        }

        self.msgReceived = function (msg: ConnectionsMsg, senderIds?: string[]) {
            const payload: any = msg.payload;

            //Handle based on the topic
            switch (msg.topic) {
                case Topics.API: {
                    self.handleCallback(self.hassAPICallbacks, msg.callbackId, msg);
                    break;
                }
                case Topics.EVENT: {
                    if (msg.event_type == "home_assistant_client" && msg.payload == "ready") {
                        self.handleCallback(self.hassEventReadyCallbacks, msg.callbackId, msg);
                    }

                    if (payload) {
                        switch (payload.event_type) {
                            case "call_service":
                                self.handleCallback(self.hassEventCallServiceCallbacks, msg.callbackId, payload.event.domain, payload.event.service, payload.event.service_data);
                                break;
                            case "state_changed":
                                self.handleCallback(self.hassEventStateChangeCallbacks, msg.callbackId, payload.event.entity_id, payload.event.old_state, payload.event.new_state);
                                break;
                        }
                    }

                    self.handleCallback(self.hassEventCallbacks, msg.callbackId, msg);
                    break;
                }
                case Topics.ACTION: {
                    self.handleCallback(self.hassActionCallbacks, msg.callbackId, payload.action, payload.target, payload.data);
                    break;
                }
                case Topics.STATE: {
                    self.handleCallback(self.hassCurrentStateCallbacks, msg.callbackId, payload, msg);
                    break;
                }
                case Topics.GET_ENTITIES: {
                    self.handleCallback(self.hassGetEntitiesCallbacks, msg.callbackId, payload);
                    break;
                }
            }
        }
    }

    RED.nodes.registerType("connections-config-node", register);
}