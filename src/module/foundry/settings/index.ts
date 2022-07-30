import { MODULE_ID } from "config"

import allowMobileMode from "./allowMobileMode"

export enum settings {
  // In config
  ALLOW_MOBILE_MODE = `allowMobileMode`,
}

export const allSettings: Record<settings, ClientSettings.PartialSettingConfig> = {
  [settings.ALLOW_MOBILE_MODE]: allowMobileMode,
}

interface Callbacks {
  [setting: string]: (value: any) => void
}

export function registerSettings(callbacks: Callbacks = {}): void {
  if (!(`settings` in game)) return

  Object.keys(allSettings).map(setting => {
    const name = allSettings[setting].name

    game.settings.register(MODULE_ID, setting, {
      ...allSettings[setting],
      name: `${MODULE_ID}.settings.${name}`,
      hint: `${MODULE_ID}.settings.${name}Hint`,
      onChange: callbacks[setting] || undefined,
    })
  })
}

// GETTER/SETTER
export function getSetting(setting: settings): any {
  if (!(`settings` in game)) return
  return game.settings.get(MODULE_ID, setting as string)
}

export function setSetting(setting: settings, value: unknown): Promise<any> {
  if (!(`settings` in game)) return new Promise(() => undefined)
  return game.settings.set(MODULE_ID, setting as string, value)
}

export default settings
