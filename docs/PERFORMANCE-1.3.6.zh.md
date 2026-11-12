# 1.3.6 间歇卡顿分析与优化

日期：2026-10-09。对比对象为本次开始时的本地 1.3.5 源码与本机正在运行的安装版，不是仓库 HEAD。开始时工作树已有大量未提交改动，全部保留；源码、脚本、测试、第三方文件及旧安装入口已复制到 `verification/stutter-before-20261009-200848/`，原有 tracked diff 保存为 `verification/stutter-existing-work.patch`。

## 定位

用户报告的是间歇停顿。本轮保持原有 30 FPS 上限，检查输入、存储、DOM/CSS、资源加载及播放器生命周期。

- 本机 Hermes 页面约有 3 万个 DOM 节点；当前场景包含 3840×2160 视频。初始 8 秒只读采样捕捉到 74/96 ms 主线程长任务与最大约 130 ms 的宿主动画回调间隔。
- 滑块每个 change 都同步正规化并保存配置、发布整个配置 atom、调用场景与玻璃更新；皮肤页 effect 又随 config 再调用一次同步。
- patched terminal 宿主的玻璃更新会插入颜色探针、调用 getComputedStyle 并移除探针。参数变化还会替换整份大型选择器 CSS；组合起来会反复强制计算长页面样式。
- 全局 range MutationObserver 把新增节点全部排进微任务；文本 token、无关属性和父子嵌套插入都增加不必要的扫描。
- 场景视频先经过整文件 Base64 IPC、解码和 Blob 复制，再交给原生媒体解码器。实际文件源 iframe 已验证能够直接读取缓存视频，上传 WebGL 后 getError 为 0。`hermes-media` 的跨源 fetch 在本机失败，因此此优化使用经 HEAD 验证的原生 file URL；受限宿主保留原来的桥接回退。
- 每个视频帧用 texImage2D 更新纹理；所有 11 种 shader program 无论场景是否使用都预先编译。库扫描还重复读取已有的项目目录，缩略图 React 状态随浏览页数增长。

## 修改

- 仅滑块使用下一次绘制合并：一个待处理 rAF 保留最新参数。即时开关、壁纸导入、主题应用仍即时提交；pointerup、keyup、blur、主题操作和 dispose 会提交最后一个值。
- 滑块的化妆性存储写入延后 200 ms 合并；atom 在绘制时更新。即时操作、pagehide、dispose 会冲刷存储，同值输入不重复保存。未改写已有配置数值。
- 皮肤页同步 effect 只依赖宿主主题与模式，不再随每个配置更新重复同步。
- 玻璃选择器样式只解析一次。之后用 CSSStyleDeclaration 修改材质变量；主题基础色按宿主主题状态缓存，避免每个输入样本都强制探测。卸载仍移除整张插件样式表。
- range 监听忽略文本节点和非滑块属性，合并嵌套插入，在 rAF 中分批发现滑块，批次约 4 ms 后让出主线程。单个子树查询仍不可中断；未声称 4 ms 是每个回调的绝对上限。
- 文件源 Hermes 宿主直接加载可访问的场景缓存 PNG/MP4，省掉整文件 JS 复制。同一缓存路径复用访问检查/Blob；加载失败或受限时回退到桥接，取消时仍停止读取并释放已分配 Blob。
- 视频通过 requestVideoFrameCallback 识别新解码帧；不支持时使用媒体时钟回退。分辨率不变时用 texSubImage2D 更新已有纹理；视频纹理纳入总纹理预算。退出时取消视频回调。
- shader program 按实际绘制/位置查询首次使用编译，共用相同顶点 shader。重复 pause 消息不再改变时间状态，恢复时扣除暂停时长，避免动画时间突然跳变。
- 宿主指针坐标变换缓存固定 iframe 几何；媒体参数消息和不变样式去重。缩略图优先使用经验证的原生文件 URL，桥接回退缓存最多 36 条/24 MiB 字符串，React 只保留当前页；禁止把视频当缩略图读取。项目媒体与 preview 共用已读取的目录列表。

## 验证与量化

相同 Edge headless 页面、相同 3 万节点及同一组 100 次材质调整，旧/新源码各运行一次。该测试测量特定操作路径，不代表全部应用性能或每次实际拖动都需要 3.96 秒。

| 项目 | 原版 | 1.3.6 |
| --- | ---: | ---: |
| CSS 内容重写 | 101 | 1 |
| 插入并强制读取颜色探针 | 101 | 1 |
| 该操作循环加最终样式读取 | 3959.4 ms | 38.2 ms |
| 文本流/嵌套插入负载下的局部 range 查询 | 53 | 2 |

两版最终 keep、终端 rgba、动态滑块进度及卸载结果一致。量化文件：`verification/stutter-benchmark.json`；执行脚本：`verification/benchmark-stutter.cjs`。

- `npm test`：83 项，81 通过、0 失败、2 跳过。跳过项分别依赖特定旧安装快照与本地 shake 场景；本轮未启用这些可选外部夹具。新增测试覆盖输入突发合并、最后值提交、存储冲刷、原生资源与桥接回退、文本流过滤、嵌套发现、CSSOM 更新、按需 shader、解码帧通知与纹理复用。记录：`verification/stutter-tests.log`。
- 真实 Chromium/SwiftShader GLSL 与像素验证：蝴蝶揭示像素蓝色 `[0,0,255,255]`、离开红色 `[255,0,0,255]`；一秒观察窗为 31 次 draw，边界取样允许 1 帧误差；暂停后 0 次 draw。144 Hz 虚拟调度回归验证 30 FPS 上限。软件渲染结果不代表硬件 GPU 使用率。
- `scripts/verify-material-range.cjs` 与 `scripts/verify-surface-unification.cjs`：材质、参数端点、主题、RTL、键盘焦点、动态输入、关闭壁纸及退出清理通过。后一脚本的旧断言已调整到此前 1.3.5 实际采用的对话框/raised 74% 材质；运行时填充规则未改变。
- 本机新播放器稳定 8 秒采样：texImage2D 视频重建 0 次、texSubImage2D 更新 188 次；宿主回调间隔 P95 约 10.9 ms、最大 108 ms。后续归因采样仍发现 93 ms 的宿主窗口自身长任务，另有宿主代码的 querySelector 热点。采样未控制用户操作和系统负载，不能据此把 130→108 ms 当成严格性能提升，也不能宣称全部卡顿消失。
- 安装后首次采样与打包构建同时发生，文件 watcher 又触发一次重载，出现约 1140 ms 间隔。该样本保留在 `stutter-live-after.json`，排除出稳定运行比较；停止构建后重新采样为 `stutter-live-settled.json` 与 `stutter-live-attributed.json`。

## 交付

已交付 **1.3.6**，本机路径：`%LOCALAPPDATA%/hermes/desktop-plugins/hermes-skins/plugin.js`；Hermes 自动重载已确认新播放器、单份插件 CSS 和单份 range CSS。安装前后保存配置 SHA-256 完全相同，运行中 manifest 已确认使用原生文件资源。旧入口备份为 `plugin.js.bak-2026-10-09T12-24-41-856Z`，后端及许可文件也由安装脚本逐项备份。使用 `--no-enable`，未改动启用名单；未重启当前宿主/网关。

离线包：`dist/hermes-skins-v1.3.6-windows.zip`。实际解压后，包内 26 项载荷长度及 SHA-256 均匹配 PACKAGE-MANIFEST；源入口、安装入口一致。包 SHA-256：`2e90381521325e9d78e8902103a0ec1c398b92d415a9d4544fb32a0291f40d21`。

完整记录位于 `verification/stutter-*`。工作树保留原有及本轮修改，未提交或推送 GitHub。本轮完成了插件内部可确认路径的优化与本机运行验证；未进行长时间硬件压力测试或冷启动验收。宿主长对话页自身的长任务仍是后续排查范围。
