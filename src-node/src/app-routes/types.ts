export const NAV_ITEM_TYPE_TITLE = 'title'
export const NAV_ITEM_TYPE_COLLAPSE = 'collapse'
export const NAV_ITEM_TYPE_ITEM = 'item'


export interface NavigationTree {
  key?: string
  path: string
  // index?: boolean
  element: JSX.Element
  title?: string
  translateKey?: string
  icon?: string
  type?: 'title' | 'collapse' | 'item'
  children?: NavigationTree[]
  authority?: string[]
  subMenu?: NavigationTree[]
}
