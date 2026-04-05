import * as NodeRED from "node-red";

export interface BaseConfigNode extends NodeRED.Node {
    msgCallbacks: Record<string, (msg: any) => void>;

    /**
     * Add a msg callback
     * @param id The node id
     * @param callback The callback
     */
    addMsgCallback(id: string, callback: (msg: any) => void): void;

    /**
     * Remove a msg callback
     * @param id The node id
     */
    removeMsgCallback(id: string): void;

    /**
     * Send a msg to the nodes outputs
     * @param msg The msg to send
     * @param toIds What node ids to output on
     */
    sendMsg(msg: any, toIds?: string[]): void;

    /**
     * When a msg is sent to a nodes input
     * @param msg The msg
     * @param senderIds What node ids this msg came from
     */
    msgReceived(msg: any, senderIds?: string[]): void;
}
export function assignBaseConfigNode(node: BaseConfigNode) {
    node.msgCallbacks = {};

    node.addMsgCallback = function (id: string, callback: (msg: any) => void) {
        node.msgCallbacks[id] = callback;
    }

    node.removeMsgCallback = function (id: string) {
        delete node.msgCallbacks[id];
    }

    node.sendMsg = function (msg: any, toIds?: string[]) {
        if (toIds) {
            toIds.forEach(id => {
                node.msgCallbacks[id]?.(msg);
            });
            return;
        }
        Object.values(node.msgCallbacks).forEach(callback => callback(msg));
    }

    node.msgReceived = function (msg: any, senderIds?: string[]) { }
}