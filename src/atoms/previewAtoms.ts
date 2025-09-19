import { ComponentSelection } from "@/ipc/ipc_types";
import { atom } from "jotai";

export const selectedComponentPreviewAtom = atom<ComponentSelection | null>(
  null,
);

// Device preview modes
export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type Orientation = 'portrait' | 'landscape';

export interface DevicePreviewState {
  deviceType: DeviceType;
  orientation: Orientation;
  showDeviceFrame: boolean;
}

export const devicePreviewAtom = atom<DevicePreviewState>({
  deviceType: 'desktop',
  orientation: 'landscape',
  showDeviceFrame: false,
});
