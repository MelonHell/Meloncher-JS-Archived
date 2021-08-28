module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      mainProcessFile: "src/background.ts",
      rendererProcessFile: "src/renderer/main.ts",
      builderOptions: {
        appId: "ru.melonhell.launcher",
        compression: "maximum",
        win: {
          icon: "public/icon.ico",
        },
      },
    },
  }
};
