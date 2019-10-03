const usePlatform = require("./usePlatform");
const useColorScheme = require("./useColorScheme");
const useMediaQuery = require("./useMediaQuery");

module.exports = (babel, path) => {
  const { types: t } = babel;
  let platform;
  let colorScheme;
  let windowVariables;

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
