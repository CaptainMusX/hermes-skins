# 安装到其他 Windows 设备

## 准备

- 安装 Hermes Desktop。当前实机验证版本为 **0.21.5+3337**；不同版本的 SDK 和界面结构可能需要重新验证。
- 原生插件安装直接使用 Hermes 自带的运行时，无需先安装 npm 构建依赖。场景解包优先使用 Hermes 自带的 Node；如果宿主未附带，再准备 PATH 中的 Node.js 22+。
- 此包面向 Windows。macOS/Linux 的本地路径和 Wallpaper Engine 库发现尚未适配验证；Android/iOS 与普通浏览器不能直接加载这个桌面插件。

## 推荐：一句命令或插件页安装

在命令提示符、PowerShell 或终端执行：

```sh
hermes plugins install CaptainMusX/hermes-skins/plugin --enable
```

也可打开 **技能与工具 → 插件 → Git 安装**，输入：

```text
CaptainMusX/hermes-skins/plugin
```

安装桌面组件和后端，勾选安装后启用。安装包已经预构建，Hermes 会把前端和后端放到各自的标准目录，无需 clone、npm install、手工复制文件或运行自定义安装脚本。首次安装后重新打开 Hermes，并重启网关以加载场景接口。

更新：`hermes plugins update hermes-skins`。

已有手工安装的旧后端时，备份该插件目录后可使用同一安装命令加 `--force` 重新安装。仓库为私有时，目标设备需要可访问该仓库的 GitHub 凭据。

当前插件尚未上架“发现”列表，直接通过“Git 安装”使用。公开目录还需要单独审核，当前内嵌壁纸播放器尚未满足目录的桌面脚本规则。

## 离线备用：使用已构建的 ZIP

此方式需要可执行安装脚本的 Node.js 22+。

1. 解压 `hermes-skins-v1.3.4-windows.zip`，进入其中的 `hermes-skins-v1.3.4` 文件夹。
2. 双击 `install.cmd`。也可在该文件夹打开终端，执行：

   ```powershell
   node scripts/install-local.js
   ```

3. 在 Hermes 命令面板执行 **Reload desktop plugins**，或重新打开 Hermes。首次安装场景后端后，重启 Hermes 网关。
4. 从侧边栏进入“皮肤中心”，选择皮肤、设置壁纸和透光参数。

已构建的包包含桌面插件和场景后端，安装不需要运行 `npm install` 或重新编译。安装前会校验文件是否齐全，更新时会在目标文件旁保存 `.bak-*` 备份。

默认数据目录优先选择 `%LOCALAPPDATA%\hermes`，其次是 `%USERPROFILE%\.hermes`。如果你使用自定义 Hermes 数据目录，请先指定：

```powershell
$env:HERMES_HOME = 'D:\HermesData'
node scripts/install-local.js
```

如果只需要皮肤、界面透光和图片/视频壁纸，可以使用前端安装模式：

```powershell
node scripts/install-local.js --frontend-only
```

该模式不安装或启用场景解包后端。完整安装若自动启用失败，可执行 `hermes plugins enable hermes-skins` 后重启网关；管理员手动管理启用状态时，可先用 `--no-enable` 安装文件，再运行这条启用命令。

## 迁移你自己的美化方案

- **内置皮肤**：另一台设备安装插件后，选择相同的内置皮肤即可。
- **自定义配色**：在原设备“主题工坊”中准备好配色表单，导出 JSON；目标设备导入 JSON，再保存为皮肤。导出的是工坊当前表单，不是全部已保存皮肤或全部插件设置。
- **透光、模糊和气泡等参数**：目前没有完整配置导入/导出功能，请在目标设备按原数值调整。
- **本地图片/视频**：单独复制素材，在目标设备重新填写文件路径。旧设备的绝对路径不会自动转换。
- **Wallpaper Engine**：目标设备需要自己的壁纸库；在插件中重新选择库目录和项目。ZIP 不包含你的 Steam 壁纸、场景缓存或个人素材。
- **终端透明**：普通宿主下终端保持兼容的实色背景。真正透明需要将 `patches/hermes-desktop-terminal-alpha.patch` 应用到兼容的 Hermes 源码并重建宿主；安装插件不会自动改动 Hermes 程序。

插件包不包含账户、API 密钥、会话记录、个人配置或本机截图。不要通过复制整个 Hermes 数据目录来分享皮肤。

## 从源码构建

```powershell
git clone https://github.com/CaptainMusX/hermes-skins.git
cd hermes-skins
npm ci
npm test
npm run package:desktop
```

ZIP 和 SHA-256 校验文件生成在 `dist/` 中。此仓库为公开仓库，可直接安装；也可以直接传送已构建的 ZIP。

## 验收与排错

- 确认侧边栏出现“皮肤中心”，滑动条有双色进度。
- 设置本地图片后，检查面板与底栏透光；关闭壁纸应恢复宿主材质，滑动条仍保留进度。
- 场景接口出现 404 时，检查插件是否启用、网关是否重启；缺少 Node 时，确保 Node 22+ 在网关使用的 PATH 或 Hermes 的 `node/` 目录中。
- 某些场景使用了播放器尚未支持的特性，可能降级为内嵌视频或静态帧。
- 回退时关闭 Hermes，使用安装目录中的 `.bak-*` 恢复对应旧文件，再重新打开 Hermes。

包内保留本项目 MIT 许可，以及 dsh-skins 和 jpeg-js 的许可/来源说明。dsh-skins 的固定来源版本许可见：
https://github.com/zhu1090093659/dsh-skins/blob/82f42bd3bf91ea88475e59a2753f87041a960a56/LICENSE
