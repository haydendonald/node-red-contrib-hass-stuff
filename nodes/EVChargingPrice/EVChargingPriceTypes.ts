import * as NodeRED from "node-red";
import { BaseNode } from "../baseNode";

export interface EVChargingPriceNodeConfig extends NodeRED.NodeDef {
    connectionsConfigNode: string;
    chargeRate: string;
    peakRate: string;
    offPeakRate: string;
    peakRateHours: string;
    peakRateDays: string;
    chargingEntityId: string;
    homeEntityId: string;
    notificationId: string;
}
export interface EVChargingPriceNode extends BaseNode { }