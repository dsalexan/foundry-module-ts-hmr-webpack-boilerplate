export class TemplatePreloader {
  /**
   * Preload a set of templates to compile and cache them for fast access during rendering
   */
  static async preloadHandlebarsTemplates() {
    const templatePaths = [`__WEBPACK__ALL_TEMPLATES__`]
    return loadTemplates(templatePaths)
  }
}
