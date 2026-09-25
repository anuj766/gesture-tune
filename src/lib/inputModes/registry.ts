import { InputModeId } from '@/types';
import { InputModeHandler } from './types';
import { fingerMappingHandler } from './fingerMappingMode';
import { gestureModeHandler } from './gestureMode';
import { circularDialHandler } from './circularDialMode';

export const INPUT_MODES: InputModeHandler[] = [
  fingerMappingHandler,
  gestureModeHandler,
  circularDialHandler,
  {
    id: 'virtual-piano',
    name: 'Virtual Piano',
    description: 'Air-piano key trigger lines positioned in 3D webcam viewport',
    iconName: 'Piano',
    isAvailable: false,
    badge: 'PLANNED',
    processInput: fingerMappingHandler.processInput,
  },
  {
    id: 'scale-mode',
    name: 'Scale Mode',
    description: 'Locks hand gestures to custom musical scales and modal intervals',
    iconName: 'Music',
    isAvailable: false,
    badge: 'PLANNED',
    processInput: fingerMappingHandler.processInput,
  },
  {
    id: 'custom-mapping',
    name: 'Custom Finger Mapping',
    description: 'User-definable custom note patterns per individual finger combination',
    iconName: 'Sparkles',
    isAvailable: false,
    badge: 'PLANNED',
    processInput: fingerMappingHandler.processInput,
  },
];

export function getInputModeHandler(modeId: InputModeId): InputModeHandler {
  const found = INPUT_MODES.find((m) => m.id === modeId && m.isAvailable);
  return found || fingerMappingHandler;
}
