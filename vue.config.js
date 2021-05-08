module.exports = {
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: "src/background.ts",
      rendererProcessFile: "src/renderer/main.ts",
      builderOptions: {
        win: {
          icon: "public/icon.ico",
        },
      },
    },
  },
};
