import * as NodeRED from "node-red";
import { LightControlConfigNode, LightControlConfigNodeConfig, ScenePresets } from "./lightControlTypes";
import { assignBaseConfigNode } from "../baseConfigNode";
import { ConnectionsConfigNode } from "../Connections/connectionsTypes";
import { getEntityId } from "../utility";

interface Scene {
    friendlyName: string;
    sceneName: string;
    brightnessPct: number
}

export = function LightControlConfigNode(RED: NodeRED.NodeAPI) {
    const register = function (this: LightControlConfigNode, config: LightControlConfigNodeConfig) {
        const self = this;

        let groupEntities: string[] = [];
        let currentState: any;
        let nightModeState: string;
        let currentSceneState: string;
        let sunState: string;
        let lastSentScene: string;

        let entitiesOnDuringNight: string[] = [];
        let entitiesOffDuringNight: string[] = [];

        let adaptiveInterval: NodeJS.Timeout;

        let errored = false;
        if (!config.groupEntityId) { this.error("Group Entity ID is required"); errored = true; }
        if (!config.concentrateSettings) { this.error("Concentrate Settings is required"); errored = true; }
        if (!config.readSettings) { this.error("Read Settings is required"); errored = true; }
        if (!config.relaxSettings) { this.error("Relax Settings is required"); errored = true; }
        if (!config.restSettings) { this.error("Rest Settings is required"); errored = true; }
        if (!config.nightLightSettings) { this.error("Night Light Settings is required"); errored = true; }
        if (!config.nightSettings) { this.error("Night Settings is required"); errored = true; }

        //Check that all the scenes are following [scene] [brightnessPercent]
        const sceneRegex = /^[^\s]+ \d+$/;
        if (!sceneRegex.test(config.concentrateSettings)) { this.error("Concentrate Settings must be in the format [scene] [brightnessPercent]"); errored = true; }
        if (!sceneRegex.test(config.readSettings)) { this.error("Read Settings must be in the format [scene] [brightnessPercent]"); errored = true; }
        if (!sceneRegex.test(config.relaxSettings)) { this.error("Relax Settings must be in the format [scene] [brightnessPercent]"); errored = true; }
        if (!sceneRegex.test(config.restSettings)) { this.error("Rest Settings must be in the format [scene] [brightnessPercent]"); errored = true; }
        if (!sceneRegex.test(config.nightLightSettings)) { this.error("Night Light Settings must be in the format [scene] [brightnessPercent]"); errored = true; }
        if (!sceneRegex.test(config.nightSettings)) { this.error("Night Settings must be in the format [scene] [brightnessPercent]"); errored = true; }
        if (errored) { return; }

        const scenes: Record<string, Scene> = {
            concentrate: {
                friendlyName: "Concentrate",
                sceneName: config.concentrateSettings.split(" ")[0],
                brightnessPct: parseInt(config.concentrateSettings.split(" ")[1])
            },
            read: {
                friendlyName: "Read",
                sceneName: config.readSettings.split(" ")[0],
                brightnessPct: parseInt(config.readSettings.split(" ")[1])
            },
            relax: {
                friendlyName: "Relax",
                sceneName: config.relaxSettings.split(" ")[0],
                brightnessPct: parseInt(config.relaxSettings.split(" ")[1])
            },
            rest: {
                friendlyName: "Rest",
                sceneName: config.restSettings.split(" ")[0],
                brightnessPct: parseInt(config.restSettings.split(" ")[1])
            },
            nightLight: {
                friendlyName: "Night Light",
                sceneName: config.nightLightSettings.split(" ")[0],
                brightnessPct: parseInt(config.nightLightSettings.split(" ")[1])
            },
            night: {
                friendlyName: "Night",
                sceneName: config.nightSettings.split(" ")[0],
                brightnessPct: parseInt(config.nightSettings.split(" ")[1])
            }
        };

        const getSceneFromFriendlyName = (friendlyName: string): Scene | undefined => {
            return Object.values(scenes).find(scene => scene.friendlyName === friendlyName);
        };

        RED.nodes.createNode(this, config);
        assignBaseConfigNode(this);

        //When NodeRED redeploys
        self.on("close", function (done: any) {
            clearTimeout(adaptiveInterval);
            done();
        });

        const connectionsConfigNode = RED.nodes.getNode(config.connectionsConfigNode) as ConnectionsConfigNode;

        //When HASS is ready
        connectionsConfigNode.hassEventReadyCallbacks[this.id] = function (msg: NodeRED.NodeMessage) {

            //Get what entities exist in the group and set our internal state
            connectionsConfigNode.getHASSEntityState(config.groupEntityId, (payload, data) => {
                groupEntities = data.data.attributes.entity_id;
                currentState = data.data;
                entitiesOffDuringNight = config.entitiesOffAtNight.split(",").filter((entity: string) => entity != "");
                entitiesOnDuringNight = entitiesOffDuringNight.length > 0 ? groupEntities.filter((entity: string) => !entitiesOffDuringNight.includes(entity)) : [config.groupEntityId];
            });

            //Get the state of the night mode switch and store it
            if (config.nightModeEntityId && config.nightModeEntityId != "") {
                connectionsConfigNode.getHASSEntityState(config.nightModeEntityId, (payload, data) => {
                    nightModeState = data.data.state;
                });
            }

            //Get the state of the sun
            connectionsConfigNode.getHASSEntityState("sun.sun", (payload, data) => {
                sunState = data.data.state;
            });

            //Add our scenes to home assistant
            for (const [sceneKey, sceneValue] of Object.entries(scenes)) {
                connectionsConfigNode.addHASSScene({
                    friendlyName: `${self.name} - ${sceneValue.friendlyName}`,
                    id: getEntityId("scene", `${self.name}_${sceneKey}`),
                    creationCallback: (response) => { },
                    activatedCallback: (state: any, serviceData: any, response: NodeRED.NodeMessage) => {
                        //Set our scene
                        connectionsConfigNode.sendHASSAction("select.select_option", { entity_id: [getEntityId("select", `${self.name}_current_scene`)] }, {
                            option: sceneValue.friendlyName
                        });

                        activateScene(sceneValue, serviceData.transition || 1, true);
                    }
                });
            }

            //Add our adaptive scene
            connectionsConfigNode.addHASSScene({
                friendlyName: `${self.name} - Adaptive`,
                id: getEntityId("scene", `${self.name}_adaptive`),
                creationCallback: (response) => { },
                activatedCallback: (state: any, serviceData: any, response: NodeRED.NodeMessage) => {
                    //Set our scene to adaptive
                    connectionsConfigNode.sendHASSAction("select.select_option", { entity_id: [getEntityId("select", `${self.name}_current_scene`)] }, {
                        option: "Adaptive"
                    });

                    runAdaptive(serviceData.transition || 1, true);
                }
            });

            //Add our turn on scene
            connectionsConfigNode.addHASSScene({
                friendlyName: `${self.name} - Turn On`,
                id: getEntityId("scene", `${self.name}_turn_on`),
                creationCallback: (response) => { },
                activatedCallback: (state: any, serviceData: any, response: NodeRED.NodeMessage) => {
                    runLights(serviceData.transition || 1, true);
                }
            });

            //Add our turn off scene
            connectionsConfigNode.addHASSScene({
                friendlyName: `${self.name} - Turn Off`,
                id: getEntityId("scene", `${self.name}_turn_off`),
                creationCallback: (response) => { },
                activatedCallback: (state: any, serviceData: any, response: NodeRED.NodeMessage) => {
                    connectionsConfigNode.sendHASSAction("light.turn_off", { entity_id: [config.groupEntityId] }, {
                        transition: serviceData.transition || 1
                    });
                    lastSentScene = "off";

                    //Send to the node output
                    self.sendMsg({
                        topic: "lightsOff",
                        payload: {
                            transitionSec: serviceData.transition || 1
                        }
                    });
                }
            });

            //Add our toggle scene
            connectionsConfigNode.addHASSScene({
                friendlyName: `${self.name} - Toggle`,
                id: getEntityId("scene", `${self.name}_toggle`),
                creationCallback: (response) => { },
                activatedCallback: (state: any, serviceData: any, response: NodeRED.NodeMessage) => {
                    if (currentState.state == "off") {
                        runLights(serviceData.transition || 1, true);
                    }
                    else {
                        connectionsConfigNode.sendHASSAction("light.turn_off", { entity_id: [config.groupEntityId] }, {
                            transition: serviceData.transition || 1
                        });

                        lastSentScene = "off";

                        //Send to the node output
                        self.sendMsg({
                            topic: "lightsOff",
                            payload: {
                                transitionSec: serviceData.transition || 1
                            }
                        });
                    }
                }
            });

            //Add our select to keep track of what scene we are running
            connectionsConfigNode.addHASSSelect({
                friendlyName: `${self.name} - Current Scene`,
                id: getEntityId("select", `${self.name}_current_scene`),
                options: [
                    ...Object.values(scenes).map(scene => scene.friendlyName),
                    "Adaptive"
                ],
                defaultState: "Adaptive",
                creationCallback: (state: any, response: NodeRED.NodeMessage) => {
                    currentSceneState = state;
                    runLights(300, false);
                },
                activatedCallback: (state: string, serviceData: any, response: NodeRED.NodeMessage) => {
                    currentSceneState = state;
                }
            });
        }

        //When a state change happens in home assistant
        connectionsConfigNode.hassEventStateChangeCallbacks[this.id] = function (entityId: string, oldState: any, newState: any) {
            switch (entityId) {
                case config.groupEntityId: {
                    currentState = newState;
                    break;
                }
                case config.nightModeEntityId: {
                    nightModeState = newState.state;
                    break;
                }
                case "sun.sun": {
                    sunState = newState.state;
                    break;
                }
            }
        }

        //When we get a message from a node on the NodeRED flows
        this.msgReceived = function (msg: NodeRED.NodeMessage, senderIds?: string[]) { }

        const activateScene = (scene: Scene, transitionSec: number, turnLightsOn: boolean, entitiesOn?: string[], entitiesOff?: string[], forceSend?: boolean) => {
            //If the lights are off and we are not to turn the lights on don't do anything
            if (turnLightsOn == false && currentState.state == "off") {
                return;
            }

            //Don't send the same scene again
            if (forceSend != true && scene.sceneName == lastSentScene) {
                return;
            }
            lastSentScene = scene.sceneName;

            //Is not a scene preset scene if we have a entity id
            if (scene.sceneName.includes(".")) {
                //Run via hass scene.turn_on
                connectionsConfigNode.sendHASSAction("scene.turn_on", {
                    entity_id: [scene.sceneName]
                }, {
                    transition: transitionSec
                });

                //Send to the node output
                self.sendMsg({
                    topic: "sceneSent",
                    payload: {
                        scene,
                        transitionSec
                    }
                });
            }
            //Is a scene preset
            else {
                const sceneId = ScenePresets[scene.sceneName as keyof typeof ScenePresets] as string;
                if (!sceneId) { self.error(`Scene preset not found for ${scene.sceneName}. Please use scene.<presetname> if this is not a scene i know about`); return; }

                const msg = {
                    brightness: (scene.brightnessPct / 100.0) * 255,
                    transition: transitionSec,
                    preset_id: sceneId,
                    shuffle: true,
                    smart_shuffle: true,
                    targets: {
                        entity_id: (entitiesOn || []).length > 0 ? entitiesOn : [config.groupEntityId]
                    }
                };

                //Run via adaptive lights
                connectionsConfigNode.sendHASSAction("scene_presets.apply_preset", undefined, msg, undefined);

                //Run any lights off that need to be off
                if ((entitiesOff || []).length > 0) {
                    connectionsConfigNode.sendHASSAction("light.turn_off", {
                        entity_id: entitiesOff
                    }, {
                        transition: transitionSec
                    });
                }

                //Send to the node output
                self.sendMsg({
                    topic: "sceneSent",
                    payload: {
                        scene,
                        transitionSec
                    }
                });
            }
        }

        const runLights = (transitionSec: number, turnLightsOn: boolean) => {
            if (currentSceneState == "Adaptive") {
                runAdaptive(transitionSec, turnLightsOn);
            }
            else {
                const scene = getSceneFromFriendlyName(currentSceneState);
                if (!scene) { self.error(`Scene not found: ${currentSceneState}`); return; }
                activateScene(scene, transitionSec, turnLightsOn);
            }
        }

        const runAdaptive = (transitionSec: number, turnLightsOn: boolean, forceSend?: boolean) => {
            let entitiesOn;
            let entitiesOff;

            //Decide what scene to send
            let scene: Scene = scenes["concentrate"];
            if (nightModeState === "on") {
                scene = scenes["night"];
                entitiesOn = entitiesOnDuringNight;
                entitiesOff = entitiesOffDuringNight;
            }
            else {
                if (sunState == "above_horizon") {
                    scene = scenes["concentrate"];
                }
                else {
                    const currentHour = new Date().getHours();
                    if (currentHour >= 23 || currentHour < 6) {
                        scene = scenes["nightLight"];
                    }
                    else if (currentHour >= 6 && currentHour < 7) {
                        scene = scenes["rest"];
                    }
                    else if (currentHour >= 7 && currentHour < 8) {
                        scene = scenes["relax"];
                    }
                    else if (currentHour >= 8 && currentHour < 10) {
                        scene = scenes["read"];
                    }
                    else if (currentHour >= 10 && currentHour < 15) {
                        scene = scenes["concentrate"];
                    }
                    else if (currentHour >= 15 && currentHour < 19) {
                        scene = scenes["read"];
                    }
                    else if (currentHour >= 19 && currentHour < 22) {
                        scene = scenes["relax"];
                    }
                    else if (currentHour >= 22 && currentHour < 23) {
                        scene = scenes["rest"];
                    }
                }
            }

            //Send it
            activateScene(scene, transitionSec, turnLightsOn, entitiesOn, entitiesOff, forceSend);

            //Start our interval to update the adaptive scene every minute
            clearTimeout(adaptiveInterval);
            adaptiveInterval = setTimeout(() => {
                runAdaptive(300, false, true);
            }, 300000);
        }
    }

    RED.nodes.registerType("light-control-config-node", register);
}