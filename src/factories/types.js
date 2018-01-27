// @flow
/*:: import React from 'react' */

/*::
export type ComponentPropTypes = { [key:string]: any } | string[]

export type ComponentFactory = (
  component: any,
  propTypes: ComponentPropTypes,
  // Let each enhancer/createComponent typecheck themselves
  // since an enhancer may change the type of args
  args: any,
  enhancer: ?EnhancerConstructor
) => (props: Object) => any // a React element

export type Props<T> = {|
  Element: any,
  ownProps: Object,
  passedProps: Object,
  args: T,
|}

export type DynamicProps<T> = {|
  ...Props<T>,
  children: any,// (props: Props<T>) => any,
|}

export type EnhancerConstructor = (endNode: any) => (props: Object) => any // a react Element

export type Enhancer = Class<React.Component<DynamicProps<*>, *>>
*/
