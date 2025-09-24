import type { AxisSettings } from '../../../../types/base'

export const SYNCED_AXIS_FIELDS = [
  'showAxisLines',
  'axisLineWidth',
  'axisLineColor',
  'showTickLabels',
  'tickLabelColor',
  'tickLabelOrientation',
] as const

export type SyncedAxisField = typeof SYNCED_AXIS_FIELDS[number]

export function shouldSyncAxisField(field: keyof AxisSettings): field is SyncedAxisField {
  return SYNCED_AXIS_FIELDS.includes(field as SyncedAxisField)
}
