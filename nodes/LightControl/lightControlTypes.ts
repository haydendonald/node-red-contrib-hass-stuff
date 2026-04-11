import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";
import { BaseConfigNode } from "../baseConfigNode";

export interface Scene {
    type: "hassScene" | "scenePresets",
    name: string,
    brightness: number
}

export enum ScenePresets {
    // Presets (Basic)
    rest = "e03267e7-9914-4f47-97fe-63c0bd317fe7",
    relax = "e71b2ef3-1b15-4c4b-b036-4b3d6efe58f8",
    read = "035b6ecf-414e-4781-abc7-3911556097cb",
    concentrate = "0cbec4e8-d064-4457-986a-fe6078a63f39",
    energize = "0eeacfc5-2d81-4035-a23d-4a9bc02af965",
    coolBright = "6d10a807-7330-46d1-b093-c15520ba72c0",
    bright = "84ebc26c-9d61-4d25-830c-41ea66f1c325",
    dimmed = "8f55e62a-e5f8-456a-9e8b-61f314bd4e99",
    nightlight = "b6f58e22-677f-4670-8677-3dea4ac60383",

    // Refreshing
    blossom = "d648408d-58ab-4768-b192-47ce06dc8e61",
    crocus = "cf25db7e-72b6-499f-8a5d-552e723a6c6a",
    precious = "506abd58-b926-4786-bb35-3a52a0c0b4d4",
    narcissa = "6b8cbab7-6090-484f-b0c2-43176e1bb044",
    babysBreath = "320cbf0d-36fc-4356-a8f5-82028760a53f",

    // Cozy
    rollingHills = "49c61bae-d3ec-4df2-89a4-65235705f3a1",
    warmEmbrace = "73b2c0b3-b4c5-4307-8873-eb231c83e996",
    dreamyDusk = "a127f9ef-0371-48dc-bc79-852e2e5b2cc3",
    honolulu = "23ab68cc-3a82-4762-b9db-f0d1a483281d",
    savannaSunset = "ea580cb0-149e-48e6-a729-2a500edfb924",
    goldenPond = "89c16361-391d-4346-b6d8-ac1eaf4de3dc",
    rubyGlow = "454176dd-7d24-43de-86c4-ee73f8febbec",
    tropicalTwilight = "ffbf7ff8-dc4a-4c56-b157-7a59113be7b7",

    // Party vibes
    miami = "a592fa63-4ba6-4399-a120-1c0b79ac832d",
    cancun = "c321d848-51a8-4d09-9ad0-5e6b44bc7f2c",
    rio = "94fc428e-2855-4f67-877e-3d1e1dd95b7d",
    chinatown = "7581da02-1688-4128-9bb9-b635f3b89999",
    ibiza = "eaa0d424-ac66-4247-8342-06d2b128ac31",
    osaka = "5768805d-27c1-442e-b069-d20443485201",
    tokyo = "de7eda64-84bf-4ed6-a4fa-76e0ebdd1968",
    motown = "7dded6f8-a2aa-4726-b391-21e9a0f76eee",
    fairfax = "abfc5768-5c2c-4d61-bd03-2b64660e813f",

    // Serenity
    galaxy = "a6ba3a6e-1e3a-41fd-84f2-f7b021935deb",
    starlight = "a2f95aab-e80a-4aca-ae32-142cdc7ad3e0",
    bloodMoon = "8d0f34db-78fd-475d-9bed-a502b787964d",
    arcticAurora = "940fd864-51e1-4761-95d3-75d4d68835ea",
    moonlight = "a87a8467-82ff-43f8-aaf3-6649b57b1480",
    nebula = "3c8662e5-e650-4f6a-a4b2-03b66d502f77",

    // Dreamy
    stillWaters = "0629d5c4-ecbb-4ffd-afc3-6e6239e5e25d",
    adrift = "67f8677a-ba4e-45d4-9a7e-601a7bdbd04d",
    pensive = "ad1b1e0d-191d-4144-aaa5-b85b2fc5dc10",
    majesticMorning = "a07439ee-8a0b-4d86-9378-687acf1c1954",
    sundown = "82c6ea11-70f9-4dab-9163-c9a94f8cff55",
    blueLagoon = "58d2dda6-8689-46c7-931b-d3abd039f04b",
    palmBeach = "e780c175-09a9-4080-978a-1d5909d8588f",
    lakePlacid = "a489caa2-c7fd-4c01-b83c-2e7e87ce2cd6",
    novemberHaze = "6550c445-3ed7-46b3-9d06-76f7e9ef7c4e",

    // Peaceful
    mountainBreeze = "24964f19-ad24-402d-ab79-aaec30cfa1d8",
    lakeMist = "7c6e81e7-d89a-4759-ae9e-b7c41e3fc0cb",
    oceanDawn = "e0b39d98-1485-446b-9324-672d3f18640d",
    frostyDawn = "8a896d0a-85d5-4658-86d7-8f8a10f4f1c9",
    sundayMorning = "2cbd7faf-f06f-4fe7-98af-80c7e7f3e437",
    emeraldIsle = "fa2f3a7f-7648-42f1-88b7-38692f3fcb60",
    springBlossom = "2be1f2f4-4e47-4fcc-a99c-4195da6210ea",
    sailingAway = "f2ac2635-8b9e-4d5f-a307-63bd55e60475",

    // Sunrise
    beginnings = "dfac784a-5df9-4d7d-8866-df77ded6182b",
    firstLight = "2db685df-7ca9-42b6-9a09-7da9c5590398",
    horizon = "c137d626-522d-4717-8e12-f14c7f28034d",
    valleyDawn = "b7529bf3-2efc-4cd2-88aa-c9afbfaec604",
    sunflare = "2f9ca2fb-dabb-4780-93cc-f9b169d94963",

    // Luxurious
    emeraldFlutter = "95048fa7-6283-4253-9ca8-ad090b33f3e7",
    memento = "c3058e2f-695d-445c-b859-b6567c856e4e",
    resplendent = "ce4a5344-e052-43da-904a-123d7c024bf3",
    scarletDream = "51960d8b-e47a-4b04-9163-28e3bbc91601",

    // Pure
    amethystValley = "297700b8-fcc6-4f35-88bb-900935d9da49",
    mistyRidge = "680a54fc-3477-4909-8d99-f35a9dc87e50",
    hazyDays = "2d7f9e7a-5c94-4768-bd5a-6924d670dde0",
    midsummerSun = "3529421e-fdeb-46bd-904f-3c2c2dc14aac",
    autumnGold = "1f0ef091-949a-4efe-a7ed-c396cea3423a",
    springLake = "f2661458-aad1-4467-97cf-8ccd46abec4e",
    winterMountain = "ce64b00b-efa9-45b0-ad34-9b56776fe8ba",
    midwinter = "fd55a078-d6a3-4715-9176-5a4fcbf5b3e6",

    // Lush
    amberBloom = "44f70646-9f9e-4a05-9c33-a42c11004dad",
    lily = "0834f278-ef59-4655-940c-a078650d2e86",
    paintedSky = "467e2d6e-50e1-47eb-ac0f-ffd45d383a06",
    winterBeauty = "f125982c-82fa-428f-b494-39f7395def73",
    orangeFields = "d8436b74-84b3-4750-83ba-fead7d94144f",
    forestAdventure = "2233f218-fd5b-4fa7-a7fd-cbe81eea8e15",
    bluePlanet = "369f2c22-2456-45f4-a91a-33d2c03c2c11",
    meriete = "bef16d30-1a75-4aac-83c0-5b9968481254",

    // Futuristic
    soho = "3580a7b2-ef38-4f34-bb5b-6416dde9df81",
    vaporWave = "3984c3b7-6608-482f-84be-d2ffe39dbb1a",
    magneto = "7fd8b7d2-7dd3-46b3-8188-23e34841eb98",
    tyrell = "66893c7e-4535-46d4-b9c7-fb6f5a80faa9",
    disturbia = "1a379a13-fd93-4f1d-977d-f0816b4385a4",
    hal = "78bbd5e7-720c-4343-9655-19602852e630",

    // Halloween
    trickOrTreat = "8a363ceb-f4c2-4c7f-9cd3-a71a6181b471",
    glowingGrins = "938da1ed-edbc-4cf0-b9ab-bdc3d7d0659f",
    spellbound = "0d2a6c4f-9c71-4279-950c-05f3f84b6dbd",
    hocusPocus = "00b65abf-df21-4f15-a379-c1742fb786fb",
    toilAndTrouble = "074338f3-f7f3-4402-9f30-46ac70e5a0e6",
    witchingHour = "2ad04284-2f0a-40d9-b2a9-6b929a475fa1",
    pandemonium = "0cbcc8ed-5474-471c-b3c1-45b4acc555b1",
    phantom = "d824598f-0c09-4e67-beb2-972a8d5813e2",

    // Winter holidays
    snowSparkle = "6a794ffd-3564-493d-a9ad-a1abcec8b81c",
    underTheTree = "85b8bc42-c564-4661-b058-f4e5792a6a6c",
    nutcracker = "33c32d2a-e5ad-4b26-8e6f-07090b4c6487",
    jolly = "77d10893-7b6f-4586-a77b-694b2b78fd3a",
    goldenStar = "a5a12d6a-430d-4324-9078-cf7a74538b52",
    silentNight = "4760abd5-e5a6-425a-be32-8f37f6e2acfd",
    colorBurst = "e24e9183-747e-4d4e-a950-a746c6291c90",
    crystalline = "713a3f4d-2fc9-4d5e-80a5-a20a25815197",
    rosySparkle = "cf50bd49-16b1-47fd-a020-b83072595f37",
    festiveFun = "667e4f15-4abf-4c56-8ef4-74fe1df422b8",

    // Race Day
    silverstone = "c2ba8a69-acdf-4ce1-8bb2-f1b3819f1c0f",
    zandvoort = "f85558ad-f8db-461a-8ff3-7458e9f7320f",
    singapore = "0e98b2b9-5643-4e2d-a2b2-13c5ae63a1c1",
    saoPaulo = "a84a9a0c-282d-4b55-8b9c-be9d85455623",
    miamiRaceDay = "d0b4b2d2-570f-4325-9475-098e3e0501f0",
    suzuka = "8072c23c-c25e-425f-b93e-0402c169f1f3",
    bahrain = "ad69cf77-3068-489b-96e8-1aa6e20759a7",

    // Daily
    nighttime = "cfdb43c7-ccb3-4dd1-b4c7-036e0d74aeb9",
    sleepy = "6170702c-f2fc-46fc-99ef-ac98b6c1293e",
    unwind = "f7c2f4ce-f957-4745-b9bf-651d5b81c9a6",
    storybook = "4f76cd74-28db-455b-9c11-04654be86281",
    shine = "ded92eba-901e-4675-8a77-2d17d95aac54",
    arise = "d7225176-5cb9-47f3-ab99-8ca9908866fc",

    // Romantic
    rubyRomance = "68d97db1-eb52-4c03-8afc-eed5df30c417",
    cityOfLove = "1fde4a1b-2ace-4b3a-a517-f9660fc84536",
    sunsetAllure = "68e8b68e-8237-48a6-bf5f-f62258dd2ff3",
    lovebirds = "f1f5f209-ffcb-4734-8567-0819a2885214",
    smitten = "a65a2815-52fb-4748-8e02-b607f96f70ea",
    glitzAndGlam = "2bf0e527-62ac-4203-b8a1-de06b0913fde",
    promise = "0b8dcd68-9ad0-4722-b23f-5fddb24204ef",

    // Vibrant
    juicyWatermelon = "eebd67ce-5b73-4cb6-b926-bf4613c361b0",
    summerSplash = "fd02c728-e90e-4abd-b1bf-6b2f2acb0b11",
    fruityPopsicle = "77cf9ffd-5491-47cd-83d6-2f0e806b4cb0",

    // Wanderlust
    rome = "13be0e02-2004-4489-b2fa-fb05aeb3d1c4",
    santorini = "b4211eac-fd8b-4025-900c-b86af13e9a55",
    coastalNights = "1f9bcaa3-82c9-4393-a571-b8de9905c0f0",
    islandWarmth = "075aea9a-80c3-4bce-8c65-a8a3938054bd",
    oceanEscape = "a62d217e-be67-4674-83d0-254a045793d9",
    downtownDrizzle = "18482f7d-4a18-4635-88c8-83c0695aa56c",

    // Rustic
    amberRobin = "ae6319a6-7c4f-4f85-87b9-ade7dc8e2c26",
    woodlandToadstool = "ad0fe6ac-5877-4dc7-8386-6d4e8a17ea88",
    pumpkinSpice = "b592ea26-5c52-403d-9836-82140fc2b679",
    fallHarvest = "a2fc579f-71e5-47a1-af9d-43e8edd91c6e",
    pumpkinPatch = "1ae2c539-9afa-4870-bb29-061c255f2177",

    // Custom Palettes
    secam = "dbffbd71-7f65-428a-9ac7-0db51057d31a",
    cga = "9565033d-f2ea-4821-bfba-7dd9b35be20a",
    lightCycles = "97648e18-758a-4382-99a4-8b657f4bb098",
    valetudo = "4bc4f958-b4af-46cf-8e67-636161e714f5"
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