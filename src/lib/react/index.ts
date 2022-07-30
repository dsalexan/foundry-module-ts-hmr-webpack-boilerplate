import React, { Attributes } from "react"
import { createRoot } from "react-dom/client"

export default function render<T>(component: React.FC<T>, args: Attributes & T, id = `react`) {
  const rootElement = document.getElementById(id)
  const root = createRoot(rootElement!)

  root.render(React.createFactory(component)(args))
}
