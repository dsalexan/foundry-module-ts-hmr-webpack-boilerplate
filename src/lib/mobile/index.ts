// import { MODULE_ID } from "module/config"
// import I from "module/i18n"
// import LOGGER from "module/logger"
// import settings, { getSetting, setSetting } from "module/settings"

import LOGGER from "../../logger"
import I from "../../module/foundry/i18n"
import settings, { getSetting, setSetting } from "../../module/foundry/settings"

function fixHeight() {
  // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
  document.documentElement.style.setProperty(`--vh`, `${Math.min(window.innerHeight, window.outerHeight) * 0.01}px`)
}

abstract class MobileWrapper {
  static active = false

  static isAllowed(): boolean {
    return getSetting(settings.ALLOW_MOBILE_MODE)
  }

  static isScreenMobile(): boolean {
    const media = window.matchMedia(`only screen and (max-width: 760px)`).matches
    const touch = `ontouchstart` in document.documentElement && navigator.userAgent.match(/Mobi/)
    const agentPlataform = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) || /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform)

    return !!agentPlataform || (!!media && !!touch)
  }

  // dom events
  static onLoad() {
    document.addEventListener(`fullscreenchange`, () => setTimeout(MobileWrapper.onResize, 100))
    window.addEventListener(`resize`, MobileWrapper.onResize)
    window.addEventListener(`scroll`, MobileWrapper.onResize)

    this.onResize()
  }

  static onResize() {
    if (!MobileWrapper.isScreenMobile()) return
    if (MobileWrapper.active) fixHeight()
  }

  // foundry events
  static onReady() {
    if (!MobileWrapper.isScreenMobile()) return LOGGER.info(`Skipping MobileWrapper (screen > mobile)`)
    if (!MobileWrapper.isAllowed()) return LOGGER.info(`MobileWrapper not allowed on settings`)

    LOGGER.info(`Initializing MobileWrapper...`)
    MobileWrapper.enter()
  }

  static onCanvasInit() {
    if (!MobileWrapper.isScreenMobile()) return

    if (MobileWrapper.active) MobileWrapper.enter()
    else MobileWrapper.leave()
  }

  static onRenderSceneNavigation() {
    if (MobileWrapper.active) {
      ui.nav?.collapse()
      LOGGER.info(`MobileWrapper collapsing nav`)
    }
  }

  // remove LowResolution error notification (i guess)
  static onRenderNotifications(app: any) {
    if (!app.queue.__isProxy) {
      app.queue = new Proxy(app.queue, {
        get: function (target, key) {
          if (key === `__isProxy`) return true

          if (key === `push`) {
            return (...arg: any[]) => {
              if (Hooks.call(`queuedNotification`, ...arg)) {
                target.push(...arg)
              }
            }
          }
          return target[key]
        },
      })
    }
  }

  static onQueuedNotification(notification: any): boolean | undefined {
    if (typeof notification.message === `string`) {
      const regex = /\s.+px/g
      const message = notification.message?.replace(regex, ``)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const match = game.i18n.translations.ERROR.LowResolution.replace(regex, ``)

      if (message == match) {
        LOGGER.info(`MobileWrapper suppresing notification`, notification)
        return false
      }
    }
  }

  static onSettingChanged(active: boolean) {
    if (active) {
      if (MobileWrapper.active) return
      if (!MobileWrapper.isScreenMobile()) return ui.notifications?.info(I(`ERROR.TryingToEnableMobileModeOnNonMobile`))
    } else {
      if (!MobileWrapper.active) return
    }

    LOGGER.info(`MobileWrapper status changed`, active)

    if (active) MobileWrapper.enter()
    else MobileWrapper.leave()
  }

  // methods
  static enter() {
    if (!MobileWrapper.isAllowed()) return
    MobileWrapper.active = true

    document.body.classList.add(`mobile`)

    ui.nav?.collapse()
    fixHeight()

    MobileWrapper.removeCanvas()

    Hooks.call(`mobile-wrapper:enter`)
  }

  static leave() {
    MobileWrapper.active = false

    document.body.classList.remove(`mobile`)

    if (!MobileWrapper.canvasExists()) window.location.reload()

    Hooks.call(`mobile-wrapper:leave`)
  }

  // canvas methods
  static removeCanvas() {
    const node = document.getElementById(`board`)
    if (node && node.parentNode) node.parentNode.removeChild(node)
  }

  static canvasExists() {
    return !!document.getElementById(`board`)
  }
}

export default MobileWrapper
export { fixHeight }
