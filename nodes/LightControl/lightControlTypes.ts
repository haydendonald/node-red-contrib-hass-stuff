import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";
import { BaseConfigNode } from "../baseConfigNode";

export interface Scene {
    type: "hassScene" | "scenePresets",
    name: string,
    brightness: number
}

export enum ScenePresets {
    rest = "e03267e7-9914-4f47-97fe-63c0bd317fe7",
    relax = "e71b2ef3-1b15-4c4b-b036-4b3d6efe58f8",
    read = "035b6ecf-414e-4781-abc7-3911556097cb",
    concentrate = "0cbec4e8-d064-4457-986a-fe6078a63f39",
    energize = "0eeacfc5-2d81-4035-a23d-4a9bc02af965",
    coolBright = "6d10a807-7330-46d1-b093-c15520ba72c0",
    bright = "84ebc26c-9d61-4d25-830c-41ea66f1c325",
    dimmed = "8f55e62a-e5f8-456a-9e8b-61f314bd4e99",
    nightLight = "b6f58e22-677f-4670-8677-3dea4ac60383",
    sleepy = "6170702c-f2fc-46fc-99ef-ac98b6c1293e",
    paintedSky = "467e2d6e-50e1-47eb-ac0f-ffd45d383a06",
    rollingHills = "49c61bae-d3ec-4df2-89a4-65235705f3a1",
    sailingAway = "f2ac2635-8b9e-4d5f-a307-63bd55e60475",
    sunFlare = "2f9ca2fb-dabb-4780-93cc-f9b169d94963"
}

//Node
export interface LightControlNodeConfig extends NodeRED.NodeDef {
    lightControlConfigNode: string;
}
export interface LightControlNode extends BaseNode { }


//Config
export interface LightControlConfigNodeConfig extends NodeRED.NodeDef {
    connectionsConfigNode: string;
    groupEntityId: string;
    nightModeEntityId: string; //input_boolean If on will run the nights in night mode
    entitiesOffAtNight: string; //The entities to turn off during night mode separated by commas
    concentrateSettings: string; //The scene to use for the concentrate scene [scene] [brightnessPercent]
    readSettings: string; //The scene to use for the read scene [scene] [brightnessPercent]
    relaxSettings: string; //The scene to use for the relax scene [scene] [brightnessPercent]
    restSettings: string; //The scene to use for the rest scene [scene] [brightnessPercent]
    nightLightSettings: string; //The scene to use for the night light scene [scene] [brightnessPercent]
    nightSettings: string; //The scene to use for the night light scene [scene] [brightnessPercent]

}
export interface LightControlConfigNode extends BaseConfigNode {}