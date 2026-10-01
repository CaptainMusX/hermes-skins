# Hermes Skin Center / Hermes 皮肤中心

这是 Hermes 官方插件管理器可直接安装的预构建包，包含桌面皮肤与壁纸场景后端，没有 npm 构建依赖。

```sh
hermes plugins install CaptainMusX/hermes-skins/plugin --enable
```

也可在桌面端 **技能与工具 → 插件 → Git 安装** 输入 `CaptainMusX/hermes-skins/plugin`，安装桌面组件及后端并启用。首次安装完成后重新打开 Hermes，使桌面组件与场景接口加载。通过侧边栏“皮肤中心”选用皮肤。

更新：`hermes plugins update hermes-skins`。

仓库为私有时，目标设备需要已有 GitHub 仓库访问权限。当前本地媒体与 Wallpaper Engine 库发现面向 Windows；基础配色和界面美化使用 Hermes 自带的运行时，场景解包使用 Hermes 自带或 PATH 中的 Node。

配色、透光参数和本地壁纸通过皮肤中心管理；安装包不携带个人配置、聊天或 Steam 壁纸。

This prebuilt native Hermes package contains `desktop/plugin.js` and `dashboard/` surfaces. Install it using the CLI command above or Desktop's **Install from Git** dialog. No npm build step is required. Reopen Hermes after the first installation; then use **Skin Center** in the sidebar. Private repositories require access on the target device.

Project license: MIT. Third-party license notices are shipped in both surface directories.
