import usePlatform from "./usePlatform";
import useColorScheme from "./useColorScheme";
import useMediaQuery from "./useMediaQuery";

export type Environment = {
  getPlatform: () => any;
  getColorScheme: () => any;
  getWindowWidth: () => any;
  getWindowHeight: () => any;
};

export default (babel: any, path: any) => {
  const { types: t } = babel;
  let platform: any;
  let colorScheme: any;
  let windowVariables: any;

  return {
    getPlatform() {
      if (platform == null) {
        platform = usePlatform(babel, path);
      }

      return t.cloneDeep(platform);
    },

    getColorScheme() {
      if (colorScheme == null) {
        colorScheme = useColorScheme(babel, path);
      }

      return t.cloneDeep(colorScheme);
    },

    getWindowWidth() {
      if (windowVariables == null) {
        windowVariables = useMediaQuery(babel, path);
      }

      return t.cloneDeep(windowVariables.width);
    },

    getWindowHeight() {
      if (windowVariables == null) {
        windowVariables = useMediaQuery(babel, path);
      }

      return t.cloneDeep(windowVariables.height);
    }
  };
};
