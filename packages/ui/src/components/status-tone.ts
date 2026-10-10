import type { StatusTone } from "./status-indicator"

export const TONE_THEO_NGHIA = {
  xong: "success",
  cho: "warning",
  hong: "error",
  nhap: "neutral",
  dangChay: "info",
} as const satisfies Record<string, StatusTone>

export type NghiaTrangThai = keyof typeof TONE_THEO_NGHIA

export function toneTheoNghia(nghia: NghiaTrangThai): StatusTone {
  return TONE_THEO_NGHIA[nghia]
}
