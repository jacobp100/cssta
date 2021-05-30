declare module 'cssta/native' {
  type CssConstructor<T> = (
    css: TemplateStringsArray,
    ...values: (string | number | (() => any))[]
  ) => T;

  type ComponentConstructor = <T = {}>(
    component: React.ElementType<T>,
  ) => CssConstructor<React.ElementType<T & Record<string, any>>>;

  type Mixin = {
    mixin: CssConstructor<any>;
  };

  const styled: ComponentConstructor & Mixin;
  export default styled;
}
