import p5 from 'p5'
import { Component, createMemo, createSignal, onCleanup, onMount, splitProps } from 'solid-js'
import { createStore } from 'solid-js/store'

export interface Sketch {
  (instance: p5): void
}

export interface P5WrapperProps {
  sketch: Sketch
  [key: string]: any
}

const createCanvas = (sketch: Sketch, container: HTMLDivElement): p5 => {
  return new p5(sketch, container)
}

export const SolidP5Wrapper: Component<P5WrapperProps> = (props) => {
  if (props.sketch === undefined) {
    throw new Error('[SolidP5Wrapper] The `sketch` prop is required.')
  }

  let wrapper: HTMLDivElement | undefined
  let canvas: p5 | undefined

  const [instance, setInstance] = createSignal<p5>()

  onMount(() => {
    if (!wrapper) return
    instance()?.remove()
    canvas = createCanvas(props.sketch, wrapper)
    setInstance(canvas)
  })

  onCleanup(() => {
    instance()?.remove()
  })

  const propNames = Object.keys(props).filter((key) => key !== 'sketch' && key !== 'children')
  const [userProps] = splitProps(props, propNames)

  // Creating store entry for each parameter on sketch render
  Object.keys(userProps).forEach((key) => {
    setSketchSettings({ ...sketchSettings, [key]: null })
  })

  // updating store value on prop change
  createMemo(() => {
    Object.entries(userProps).forEach(([key, value]) => {
      setSketchSettings(key, value)
    })
  })

  return <div ref={wrapper}>{props.children}</div>
}

export const [sketchSettings, setSketchSettings] = createStore<{ [key: string]: any }>()
