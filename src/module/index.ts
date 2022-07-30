import "./styles/index.scss"

import LOGGER from "logger"

import settings, { getSetting, registerSettings } from "module/foundry/settings"

import { MobileGurpsActorSheet } from "module/actor/actor-sheet"

import MobileWrapper from "../lib/mobile"

// injecting styles
// document.querySelector(`head`)?.appendChild($(`<link rel="stylesheet" href="http://cdn.jsdelivr.net/npm/@mdi/font@6.9.96/css/materialdesignicons.min.css">`)[0])
document.querySelector(`head`)?.appendChild($(`<link rel="stylesheet" href="https://rsms.me/inter/inter.css">`)[0])
document.querySelector(`head`)?.appendChild($(`<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>`)[0])
document.querySelector(`head`)?.appendChild($(`<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">`)[0])

MobileWrapper.onLoad()

Hooks.once(`init`, async () => {
  LOGGER.info("Initializing...")

  // Assign custom classes and constants here

  // Register custom module settings
  registerSettings({
    [settings.ALLOW_MOBILE_MODE]: MobileWrapper.onSettingChanged,
    // [settings.MOBILE_MODE]: Mobile.onModeChange,
  })

  // Preload Handlebars templates
  // await preloadTemplates()

  // Register custom sheets (if any)
  Actors.registerSheet(`gurps`, MobileGurpsActorSheet, {
    // Add this sheet last
    label: `Mobile`,
    makeDefault: false,
  })
})

Hooks.once(`ready`, () => {
  MobileWrapper.onReady()
})

// Add any additional hooks if necessary
Hooks.once(`canvasInit`, async () => {
  MobileWrapper.onCanvasInit()
})

Hooks.once(`renderSceneNavigation`, () => {
  MobileWrapper.onRenderSceneNavigation()
})

// remove LowResolution error notification (i guess)
Hooks.once(`renderNotifications`, (app: any) => {
  MobileWrapper.onRenderNotifications(app)
})

Hooks.on(`queuedNotification`, (notification: any) => {
  const _MobileWrapper = MobileWrapper.onQueuedNotification(notification)
  if (_MobileWrapper !== undefined) return _MobileWrapper
})
