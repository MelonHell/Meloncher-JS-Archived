module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
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
