import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";
import { BaseConfigNode } from "../baseConfigNode";

export enum Topics {
    API = "api",
    EVENT = "event",
    STATE = "state",
    ACTION = "action",
    GET_ENTITIES = "get_entities",
    HISTORY = "history"
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
    hassGetEntityHistoryCallbacks: Record<string, (data: any) => void>;

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
    handleCallback: <T extends any[]>(callbacks: Record<string, (...args: T) => void>, callbackId: string, ...args: T) => void;

    /**
     * Add an entity to HASS
     * @param entityId The ID of the entity
     * @param data The data for the entity
     * @param callback The callback for when a response comes back in
     * @returns 
     */
    addHASSEntity: (entityId: string, data: any, callback?: (response: NodeRED.NodeMessage) => void) => void;

    /**
     * Add a new HASS input boolean entity
     * @param options.friendlyName The friendly name of the input boolean
     * @param options.id The ID of the input boolean
     * @param options.defaultState The default state of the input boolean
     * @param options.forceDefaultStateOnCreation Whether to force the default state on creation
     * @param options.creationCallback Callback function when the input boolean is created
     * @param options.changedCallback Callback function when the input boolean state changes
     */
    addHASSInputBoolean: (options: {
        friendlyName: string,
        id?: string,
        defaultState?: string,
        forceDefaultStateOnCreation?: boolean,
        creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
        changedCallback?: (state: any, serviceData: any, response: NodeRED.NodeMessage) => void
    }) => void;

    /**
     * Add a button entity to HASS
     * @param options.friendlyName The friendly name of the button
     * @param options.id The id of the button button.[id]. If not set will be friendly_name
     * @param options.defaultState The default state of the button. Default is "unknown"
     * @param options.forceDefaultStateOnCreation Whether to force the default state on creation
     * @param options.creationCallback The callback for when a response comes back in
     */
    addHASSButton: (options: {
        friendlyName: string,
        id?: string,
        defaultState?: any,
        forceDefaultStateOnCreation?: boolean,
        creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
        pressedCallback?: (state: any, serviceData: any, response: NodeRED.NodeMessage) => void
    }) => void;


    /**
     * Add a scene entity to HASS
     * @param options.friendlyName The friendly name of the scene
     * @param options.id The id of the scene scene.[id]. If not set will be friendly_name
     * @param options.defaultState The default state of the scene. Default is "unknown"
     * @param options.forceDefaultStateOnCreation Whether to force the default state on creation
     * @param options.creationCallback The callback for when a response comes back in
     * @param options.pressedCallback The callback for when the scene is activated
     */
    addHASSScene: (options: {
        friendlyName: string,
        id?: string,
        defaultState?: any,
        forceDefaultStateOnCreation?: boolean,
        creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
        activatedCallback?: (state: any, serviceData: any, response: NodeRED.NodeMessage) => void
    }) => void;

    /**
     * Add a select entity to HASS
     * @param options.friendlyName The friendly name of the select
     * @param options.id The id of the select select.[id]. If not set will be friendly_name
     * @param options.defaultState The default state of the select. Default is "unknown"
     * @param options.forceDefaultStateOnCreation Whether to force the default state on creation
     * @param options.creationCallback The callback for when a response comes back in
     * @param options.activatedCallback The callback for when the select is activated
     */
    addHASSSelect: (options: {
        friendlyName: string,
        id?: string,
        defaultState?: any,
        forceDefaultStateOnCreation?: boolean,
        options: string[],
        creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
        activatedCallback?: (state: any, serviceData: any, response: NodeRED.NodeMessage) => void
    }) => void;

    /**
    * Add a sensor entity to HASS
    * @param options.friendlyName The friendly name of the sensor
    * @param options.id The id of the sensor sensor.[id]. If not set will be friendly_name
    * @param options.defaultState The default state of the sensor. Default is "unknown"
    * @param options.forceDefaultStateOnCreation Whether to force the default state on creation
    * @param options.creationCallback The callback for when a response comes back in
    * @returns Function to set the sensor value
    */
    addHASSSensor: (options: {
        friendlyName: string,
        id?: string,
        defaultState?: any,
        forceDefaultStateOnCreation?: boolean,
        creationCallback?: (state: any, response: NodeRED.NodeMessage) => void,
        changedCallback?: (state: any, response: NodeRED.NodeMessage) => void
    }) => (state: any) => void;

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

    /**
     * Get the history of an entity in HASS
     * @param options.entityId The entity id
     * @param options.relativeTime The relative time to get the history for. See HASS docs
     * @param options.startDate The start date to get the history from in ISO format
     * @param options.endDate The end date to get the history to in ISO format
     * @param callback The callback containing the history
     */
    getHASSEntityHistory: (options: {
        entityId: string,
        relativeTime?: string,
        startDate?: string,
        endDate?: string
    }, callback?: (data: any) => void) => void;

    /**
     * Send notification to a companion app
     * @param options The options for the notification
     * @param options.entityIds The entity IDs to send the notification to for example notify.mobile_app_haydens_iphone
     * @param options.message The message to send
     * @param options.title The title of the notification
     * @param options.target The target(s) of the notification
     * @param options.data The data to include in the notification
     */
    sendCompanionNotification: (options: {
        entityIds: string[],
        message: string,
        title?: string,
        target?: any
        data?: any
    }) => void;
}

export interface ConnectionsMsg extends NodeRED.NodeMessage {
    callbackId: string
}