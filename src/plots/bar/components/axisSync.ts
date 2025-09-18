import type { AxisSettings } from '../../../types/base'

export const SYNCED_AXIS_FIELDS = [
  'showAxisLines',
  'axisLineWidth',
  'axisLineColor',
  'showTickLabels',
  'tickLabelColor',
  'tickLabelOrientation',
] as const satisfies ReadonlyArray<keyof AxisSettings>

export function shouldSyncAxisField(field: keyof AxisSettings): boolean {
  return SYNCED_AXIS_FIELDS.includes(field)
}
