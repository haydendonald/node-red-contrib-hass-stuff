# node-red-contrib-hass-stuff
A collection of stuff I use on my Node Red + Home Assistant server. This could be of use for others, i don't know.. 

# Nodes
## Connections

This node is required by other nodes in this project. It provides the connections required to communicate to HomeAssistant and other stuff.

The following can be imported into NodeRED to provide these:
<details>
<summary>Add connections Node to NodeRED</summary>

```json
[
    {
        "id": "80cbc1c2e93f49fa",
        "type": "ha-api",
        "z": "f028d32cd5f8196d",
        "name": "",
        "server": "",
        "version": 1,
        "debugenabled": true,
        "protocol": "websocket",
        "method": "get",
        "path": "",
        "data": "",
        "dataType": "jsonata",
        "responseType": "json",
        "outputProperties": [
            {
                "property": "payload",
                "propertyType": "msg",
                "value": "",
                "valueType": "results"
            }
        ],
        "x": 530,
        "y": 700,
        "wires": [
            [
                "3b2abe9fd6ef7ffd"
            ]
        ]
    },
    {
        "id": "3b2abe9fd6ef7ffd",
        "type": "change",
        "z": "f028d32cd5f8196d",
        "name": "",
        "rules": [
            {
                "t": "set",
                "p": "topic",
                "pt": "msg",
                "to": "api",
                "tot": "str"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 675,
        "y": 700,
        "wires": [
            [
                "78f07ee4763a6b14"
            ]
        ],
        "l": false
    },
    {
        "id": "934e731820c17347",
        "type": "api-call-service",
        "z": "f028d32cd5f8196d",
        "name": "",
        "server": "",
        "version": 7,
        "debugenabled": false,
        "action": "",
        "floorId": [],
        "areaId": [],
        "deviceId": [],
        "entityId": [],
        "labelId": [],
        "data": "",
        "dataType": "jsonata",
        "mergeContext": "",
        "mustacheAltTags": false,
        "outputProperties": [],
        "queue": "none",
        "blockInputOverrides": false,
        "domain": "",
        "service": "",
        "x": 530,
        "y": 820,
        "wires": [
            [
                "885080cdde7fec06"
            ]
        ]
    },
    {
        "id": "388d419ff40adeae",
        "type": "api-current-state",
        "z": "f028d32cd5f8196d",
        "name": "",
        "server": "",
        "version": 3,
        "outputs": 1,
        "halt_if": "",
        "halt_if_type": "str",
        "halt_if_compare": "is",
        "entity_id": "",
        "state_type": "str",
        "blockInputOverrides": false,
        "outputProperties": [
            {
                "property": "payload",
                "propertyType": "msg",
                "value": "string",
                "valueType": "entityState"
            },
            {
                "property": "data",
                "propertyType": "msg",
                "value": "",
                "valueType": "entity"
            }
        ],
        "for": "0",
        "forType": "num",
        "forUnits": "minutes",
        "override_topic": false,
        "state_location": "payload",
        "override_payload": "msg",
        "entity_location": "data",
        "override_data": "msg",
        "x": 560,
        "y": 740,
        "wires": [
            [
                "a60dbdb2a080de5e"
            ]
        ]
    },
    {
        "id": "1b2a505996e8dd0b",
        "type": "server-events",
        "z": "f028d32cd5f8196d",
        "name": "",
        "server": "",
        "version": 3,
        "exposeAsEntityConfig": "",
        "eventType": "",
        "eventData": "",
        "waitForRunning": true,
        "outputProperties": [
            {
                "property": "payload",
                "propertyType": "msg",
                "value": "",
                "valueType": "eventData"
            },
            {
                "property": "topic",
                "propertyType": "msg",
                "value": "$outputData(\"eventData\").event_type",
                "valueType": "jsonata"
            }
        ],
        "x": 540,
        "y": 660,
        "wires": [
            [
                "194985fca2779f3b"
            ]
        ]
    },
    {
        "id": "170d8627f4d745b0",
        "type": "ha-get-entities",
        "z": "f028d32cd5f8196d",
        "name": "",
        "server": "",
        "version": 1,
        "rules": [
            {
                "condition": "state_object",
                "property": "",
                "logic": "is",
                "value": "",
                "valueType": "str"
            }
        ],
        "outputType": "array",
        "outputEmptyResults": true,
        "outputLocationType": "msg",
        "outputLocation": "payload",
        "outputResultsCount": 1,
        "x": 550,
        "y": 780,
        "wires": [
            [
                "204f99728a048c5f"
            ]
        ]
    },
    {
        "id": "a60dbdb2a080de5e",
        "type": "change",
        "z": "f028d32cd5f8196d",
        "name": "",
        "rules": [
            {
                "t": "set",
                "p": "topic",
                "pt": "msg",
                "to": "state",
                "tot": "str"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 675,
        "y": 740,
        "wires": [
            [
                "78f07ee4763a6b14"
            ]
        ],
        "l": false
    },
    {
        "id": "204f99728a048c5f",
        "type": "change",
        "z": "f028d32cd5f8196d",
        "name": "",
        "rules": [
            {
                "t": "set",
                "p": "topic",
                "pt": "msg",
                "to": "get_entities",
                "tot": "str"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 675,
        "y": 780,
        "wires": [
            [
                "78f07ee4763a6b14"
            ]
        ],
        "l": false
    },
    {
        "id": "885080cdde7fec06",
        "type": "change",
        "z": "f028d32cd5f8196d",
        "name": "",
        "rules": [
            {
                "t": "set",
                "p": "topic",
                "pt": "msg",
                "to": "action",
                "tot": "str"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 675,
        "y": 820,
        "wires": [
            [
                "78f07ee4763a6b14"
            ]
        ],
        "l": false
    },
    {
        "id": "194985fca2779f3b",
        "type": "change",
        "z": "f028d32cd5f8196d",
        "name": "",
        "rules": [
            {
                "t": "set",
                "p": "topic",
                "pt": "msg",
                "to": "event",
                "tot": "str"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 675,
        "y": 660,
        "wires": [
            [
                "78f07ee4763a6b14"
            ]
        ],
        "l": false
    },
    {
        "id": "6b0c6c859f8180ff",
        "type": "switch",
        "z": "f028d32cd5f8196d",
        "name": "",
        "property": "topic",
        "propertyType": "msg",
        "rules": [
            {
                "t": "eq",
                "v": "api",
                "vt": "str"
            }
        ],
        "checkall": "true",
        "repair": false,
        "outputs": 1,
        "x": 445,
        "y": 700,
        "wires": [
            [
                "80cbc1c2e93f49fa"
            ]
        ],
        "l": false
    },
    {
        "id": "cb6a81f143b93c08",
        "type": "switch",
        "z": "f028d32cd5f8196d",
        "name": "",
        "property": "topic",
        "propertyType": "msg",
        "rules": [
            {
                "t": "eq",
                "v": "state",
                "vt": "str"
            }
        ],
        "checkall": "true",
        "repair": false,
        "outputs": 1,
        "x": 445,
        "y": 740,
        "wires": [
            [
                "388d419ff40adeae"
            ]
        ],
        "l": false
    },
    {
        "id": "a3de07378d809f30",
        "type": "switch",
        "z": "f028d32cd5f8196d",
        "name": "",
        "property": "topic",
        "propertyType": "msg",
        "rules": [
            {
                "t": "eq",
                "v": "get_entities",
                "vt": "str"
            }
        ],
        "checkall": "true",
        "repair": false,
        "outputs": 1,
        "x": 445,
        "y": 780,
        "wires": [
            [
                "170d8627f4d745b0"
            ]
        ],
        "l": false
    },
    {
        "id": "e335241f272835a4",
        "type": "switch",
        "z": "f028d32cd5f8196d",
        "name": "",
        "property": "topic",
        "propertyType": "msg",
        "rules": [
            {
                "t": "eq",
                "v": "action",
                "vt": "str"
            }
        ],
        "checkall": "true",
        "repair": false,
        "outputs": 1,
        "x": 445,
        "y": 820,
        "wires": [
            [
                "934e731820c17347"
            ]
        ],
        "l": false
    },
    {
        "id": "25925d7eacdca45f",
        "type": "connections-node",
        "z": "f028d32cd5f8196d",
        "name": "HASS Stuff Connections",
        "connectionsConfigNode": "ea84f05a857bde72",
        "x": 570,
        "y": 620,
        "wires": [
            [
                "f6240b1dab1143e3"
            ]
        ]
    },
    {
        "id": "5448ec0ff29169e2",
        "type": "comment",
        "z": "f028d32cd5f8196d",
        "name": "Provide connections to HASS stuff",
        "info": "",
        "x": 560,
        "y": 580,
        "wires": []
    },
    {
        "id": "f6240b1dab1143e3",
        "type": "junction",
        "z": "f028d32cd5f8196d",
        "x": 380,
        "y": 660,
        "wires": [
            [
                "6b0c6c859f8180ff",
                "e335241f272835a4",
                "cb6a81f143b93c08",
                "a3de07378d809f30"
            ]
        ]
    },
    {
        "id": "78f07ee4763a6b14",
        "type": "junction",
        "z": "f028d32cd5f8196d",
        "x": 750,
        "y": 640,
        "wires": [
            [
                "25925d7eacdca45f"
            ]
        ]
    },
    {
        "id": "ea84f05a857bde72",
        "type": "connections-config-node",
        "name": "HASS Stuff Connections Config"
    },
    {
        "id": "f947b66dc55502ce",
        "type": "global-config",
        "env": [],
        "modules": {
            "node-red-contrib-home-assistant-websocket": "0.80.3",
            "node-red-contrib-hass-stuff": "0.0.1"
        }
    }
]
```
</details>

### Dependencies
It has the following dependencies
1. [HomeAssistant](https://flows.nodered.org/node/node-red-contrib-home-assistant-websocket)

## Light Control

A node that controls lights with general scenes that adjust throughout the day with sleep mode and other features.

### Features
* Adaptive scenes depending on what time of the day it is
* Adaptive scenes depending on luminance sensor *TODO*
* Night mode entity to force the adaptive scene to be in "night mode"
* Ability to turn off entities in night mode

### Dependencies
1. [Adaptive Lighting](https://github.com/basnijholt/adaptive-lighting)
2. [HASS Sun](https://www.home-assistant.io/integrations/sun/)

## PIR

A node that simplifies control of a PIR

### Features
* Entity to enable/disable the PIR
* Disable the PIR with luminance sensor value
* Set timeout before the PIR is triggered to be on/off

## Door Sensor
*TODO*

A node that simplifies control of a door sensor

### Features
* Entity to enable/disable the sensor
* Disable the sensor with luminance sensor value
* Set timeout before the PIR is triggered to be on/off

## Curtain Control
*TODO*

A node that provides control of a cover

### Features
* Adds buttons to set the curtain to open/half/closed
* Have the curtain close on luminance sensor value
* Have curtain be closed at certain hours
* Have curtain be half at certain hours

## EV Charging Price

A node that keeps track of how much i spend on charging my EV (polestar 2) while at home.

It works by checking if the car started charging while i'm at home. When the car stops charging it will add the price of the session to a sensor.
This just estimates the value, useful for if you don't have the ability to monitor the charge rate etc.

### Features
* Calculates how much money per month i spend on charging my EV
* Detects if the car was charged at home, ignoring fast charging sessions

// MIMO //