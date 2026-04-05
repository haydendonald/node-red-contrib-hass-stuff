import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";
import { BaseConfigNode } from "../baseConfigNode";

export enum Topics {
    API = "api",
    EVENT = "event",
    STATE = "state",
    ACTION = "action",
    GET_ENTITIES = "get_entities"
}

export interface ConnectionsNodeConfig extends NodeRED.NodeDef {
    connectionsConfigNode: string;
}

export interface ConnectionsNode extends BaseNode { }

export interface ConnectionsConfigNodeConfig extends NodeRED.NodeDef { }

export interface ConnectionsConfigNode extends BaseConfigNode {
    hassAPICallbacks: Record<string, (msg: NodeRED.NodeMessage) => void>;
    hassActionCallbacks: Record<string, ((action: string, target: {
        floor_id?: string[],
        area_id?: string[],
        device_id?: string[],
        entity_id?: string[]
    }, data: any) => void)>;
    hassCurrentStateCallbacks: Record<string, (payload: any, data: any) => void>;
    hassGetEntitiesCallbacks: Record<string, (entities: any[]) => void>;

    hassEventReadyCallbacks: Record<string, (msg: NodeRED.NodeMessage) => void>;
    hassEventCallbacks: Record<string, (msg: NodeRED.NodeMessage) => void>;
    hassEventCallServiceCallbacks: Record<string, (domain: string, service: string, serviceData: any) => void>;
    hassEventStateChangeCallbacks: Record<string, (entityId: string, oldState: any, newState: any) => void>;

    /**
     * Handle a callback
     * @param callbacks The callback to handle
     * @param msg The message to send
     * @param recipientIds The ids to send to 
     */
    handleCallback: <T extends any[]>(callbacks: Record<string, (...args: T) => void>, callbackId?: string, ...args: T) => void;

    /**
     * Add an entity to HASS
     * @param entityId The ID of the entity
     * @param data The data for the entity
     * @param callback The callback for when a response comes back in
     * @returns 
     */
    addHASSEntity: (entityId: string, data: any, callback?: (response: NodeRED.NodeMessage) => void) => void;

    addHASSInputBoolean: (options: {
        friendlyName: string,
        id?: string,
        defaultState?: string,
        creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
        changedCallback?: (state: any, serviceData: any) => void
    }) => void;

    /**
 * Add a button entity to HASS
 * @param options.friendlyName The friendly name of the button
 * @param options.id The id of the button button.[id]. If not set will be friendly_name
 * @param options.state The default state of the button. Default is "unknown"
 * @param options.defaultState The default state of the button. Default is "unknown"
 * @param options.creationCallback The callback for when a response comes back in
 */
    addHASSButton: (options: {
        friendlyName: string,
        id?: string,
        state?: string,
        defaultState?: any,
        creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
        pressedCallback?: (state: any, serviceData: any) => void
    }) => void;


    /**
     * Add a scene entity to HASS
     * @param options.friendlyName The friendly name of the scene
     * @param options.id The id of the scene scene.[id]. If not set will be friendly_name
     * @param options.state The default state of the scene. Default is "unknown"
     * @param options.defaultState The default state of the scene. Default is "unknown"
     * @param options.creationCallback The callback for when a response comes back in
     * @param options.pressedCallback The callback for when the scene is activated
     */
    addHASSScene: (options: {
        friendlyName: string,
        id?: string,
        state?: string,
        defaultState?: any,
        creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
        activatedCallback?: (state: any, serviceData: any) => void
    }) => void;

    /**
     * Add a select entity to HASS
     * @param options.friendlyName The friendly name of the select
     * @param options.id The id of the select select.[id]. If not set will be friendly_name
     * @param options.state The default state of the select. Default is "unknown"
     * @param options.defaultState The default state of the select. Default is "unknown"
     * @param options.creationCallback The callback for when a response comes back in
     * @param options.activatedCallback The callback for when the select is activated
     */
    addHASSSelect: (options: {
        friendlyName: string,
        id?: string,
        state?: string,
        defaultState?: any,
        options: string[],
        creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
        activatedCallback?: (state: any, serviceData: any) => void
    }) => void;

    /**
     * Send a message to the HASS API Node
     * @param protocol The protocol to use
     * @param method The method to use
     * @param path The path to request
     * @param callback The callback for when a response comes back in
     * @param params Any parameters to add
     * @param data The data
     * @param results The results
     */
    sendHASSAPI: (protocol: "http" | "websocket", method: "get" | "post", path: string, callback?: (response: NodeRED.NodeMessage) => void, params?: any, data?: any, results?: string) => void;

    /**
     * Send an action to HASS
     * @param action The action
     * @param target The target(s)
     * @param data The data
     * @param callback A callback for when the action is completed
     */
    sendHASSAction: (action: string, target?: {
        floor_id?: string[],
        area_id?: string[],
        device_id?: string[],
        entity_id?: string[]
    }, data?: any, callback?: (action: string, target: {
        floor_id?: string[],
        area_id?: string[],
        device_id?: string[],
        entity_id?: string[]
    }, data: any) => void) => void;

    /**
     * Get the current state of an entity in HASS
     * @param entityId The entity id
     * @param callback The callback containing the state
     */
    getHASSEntityState: (entityId: string, callback?: (payload: any, data: any) => void) => void;


    /**
     * Get a list of entities that meet rules
     * @param rules The results to match
     * @param callback The callback containing the state
     */
    getHASSEntities: (rules: [
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
    ], callback?: (entities: any[]) => void) => void;
}

export interface ConnectionsMsg extends NodeRED.NodeMessage {
    callbackId?: string
}