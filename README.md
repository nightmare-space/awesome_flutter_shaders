# Awesome Flutter Shaders

一个 Flutter Shader 作品集（Gallery）：将 Shadertoy 风格的片元着色器（`.frag`）迁移到 Flutter runtime shader，并以网格列表方式展示与预览。

本仓库定位是“可运行的迁移样例集合”：每个 shader 都对应一个小组件，必要时会绑定纹理输入（iChannel0..）或使用 BufferA/BufferB 做多 pass。

## 功能

- 首页 `GridView` 展示多个 shader 卡片（包含缩略渲染 + 名称）
- 点击卡片进入全屏；双击退出并恢复播放
- 支持单 pass / 多 pass 与纹理输入

入口：`lib/main.dart`

## 运行要求

- Dart：`>=3.10.0 <4.0.0`（见 `pubspec.yaml`）
- Flutter：按常规方式运行到 iOS/Android/macOS/Web 均可

## 重要：依赖包含本地 path（需要你自行调整）

当前 `pubspec.yaml` 里存在作者本机绝对路径依赖：

- `shader_graph: path: /Users/.../shader_graph`
- `dependency_overrides.shader_buffers: path: /Users/.../shader_buffers`

如果你不在相同环境下开发，`flutter pub get` 会失败。你可以选择：

1) 把 `path:` 改成你本地真实路径（适合本地开发）
2) 改回 pub.dev / git 依赖并移除 `dependency_overrides`（适合开源/CI）

## 快速开始

```bash
flutter pub get
flutter run
```

运行到指定设备：

```bash
flutter run -d macos
flutter run -d chrome
```

## Shader 文件约定（Shadertoy 风格）

shader 通常实现 Shadertoy 风格入口函数：

```glsl
void mainImage(out vec4 fragColor, in vec2 fragCoord);
```

每个 `.frag` 顶部/底部分别 include：

```glsl
#include <common/common_header.frag>
// ... your shader code ...
#include <common/main_shadertoy.frag>
```

公共文件位置：

- `shaders/common/common_header.frag`
- `shaders/common/main_shadertoy.frag`

### iChannel 输入

如果 shader 需要纹理输入，按需声明：

```glsl
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
```

然后在 Dart 侧把纹理“喂”给 shader（见下节）。

## 如何新增一个 shader

1) 新增 `.frag`

- 放到 `shaders/<首字母>/`（仓库按字母分组）
- 确保 include 了公共头尾（上一节）

2) 在 `pubspec.yaml` 注册 shader

把 shader 路径加入 `flutter:` -> `shaders:` 列表，否则 Flutter 不会编译/打包。

3) 加到展示列表

在 `lib/shader_widgets/<字母>.dart` 中加入一个卡片：

```dart
AwesomeShader('shaders/x/Your Shader.frag')
```

4) 绑定纹理/多 pass（示例）

```dart
final mainBuffer = 'shaders/.../Main.frag'.shaderBuffer;
final bufferA = 'shaders/.../BufferA.frag'.shaderBuffer;

mainBuffer.feed(bufferA).feed(SA.textureRgbaNoiseSmall);
return AwesomeShader([mainBuffer, bufferA]);
```

常用纹理/cubemap 路径常量在 `lib/shaders.dart`（`SA.texture...` / `SA.cubemap...`）。

## 目录结构

- `lib/main.dart`：网格展示、点击全屏逻辑
- `lib/shaders.dart`：shader/纹理/cubemap 路径常量
- `lib/shader_widgets/`：按字母分组的 shader 列表
- `shaders/`：`.frag` 源码（含 `common/` 公共 include）
- `assets/`：纹理与 cubemap

## 常见问题

不同平台的 Flutter runtime shader/编译器限制不完全一致，常见问题包括：

- 编译失败：采样限制、语法差异、部分类型/特性不可用
- 黑屏/崩溃：循环/数组/程序体积限制
- 效果不一致：多 pass、精度（highp/mediump）、坐标系差异

排查建议：

1) 确认该 shader 已加入 `pubspec.yaml` 的 `flutter.shaders`
2) 确认所需 iChannel 已在 Dart 侧喂入
3) 逐步降低复杂度（循环次数、采样次数、分支）定位不兼容点

## Shader List (Alphabetical)

- [`shaders/a/A lot of spheres.frag`](https://www.shadertoy.com/view/lsX3WH)
- [`shaders/a/a study of glass.frag`](https://www.shadertoy.com/view/lttBzN)
- [`shaders/a/Alien ocean.frag`](https://www.shadertoy.com/view/wldBRf)
- [`shaders/a/Alien Space Jockey.frag`](https://www.shadertoy.com/view/mdB3Rh)
- [`shaders/a/Alpha Clip 1 bit dissolve.frag`](https://www.shadertoy.com/view/WllfRB)
- [`shaders/a/Analytic Motionblur 2D.frag`](https://www.shadertoy.com/view/MdSGDm)
- [`shaders/a/anamorphic rendering.frag`](https://www.shadertoy.com/view/lcSBDh)
- [`shaders/a/Angel.frag`](https://www.shadertoy.com/view/3XXSDB)
- [`shaders/a/Arcade Pacman.frag`](https://www.shadertoy.com/view/lsc3D4)
- [`shaders/a/Artifact at Sea.frag`](https://www.shadertoy.com/view/WsffRS)
- [`shaders/a/Atmosphere system test.frag`](https://www.shadertoy.com/view/XtBXDz)

- [`shaders/b/Balatro Background Shaders.frag`](https://www.shadertoy.com/view/XXtBRr)
- [`shaders/b/balls are rubbing.frag`](https://www.shadertoy.com/view/7ltXDl)
- [`shaders/b/Base warp fBM.frag`](https://www.shadertoy.com/view/tdG3Rd)
- [`shaders/b/Black Hole ODE Geodesic Solver.frag`](https://www.shadertoy.com/view/XfKSDy)
<!-- - [`shaders/b/Black Hole Raymarcher 3.frag`]() -->
- [`shaders/b/Broken Time Gate.frag`](https://www.shadertoy.com/view/XXcGWr)
- [`shaders/b/Bubbles.frag`](https://www.shadertoy.com/view/4dl3zn)
- [`shaders/b/Bumped     Sinusoidal Warp.frag`](https://www.shadertoy.com/view/4l2XWK)
- [`shaders/b/Buoy.frag`](https://www.shadertoy.com/view/XdsGDB)
- [`shaders/b/Byt3-daily-013.frag`](https://www.shadertoy.com/view/McjBW1)

- [`shaders/c/CineShader Lava.frag`](https://www.shadertoy.com/view/3sySRK)
- [`shaders/c/Clouds 3D.frag`](https://www.shadertoy.com/view/wdsfDH)
- [`shaders/c/Clouds-2D.frag`](https://www.shadertoy.com/view/WdXBW4)
- [`shaders/c/cobweb test.frag`](https://www.shadertoy.com/view/W3sSzf)
- [`shaders/c/Cold.frag`](https://www.shadertoy.com/view/wcyGRR)
- [`shaders/c/Colorful underwater bubbles II.frag`](https://www.shadertoy.com/view/mlBSWc)
- [`shaders/c/Combustible Voronoi.frag`](https://www.shadertoy.com/view/4tlSzl)
- [`shaders/c/Crosswarp transition.frag`](https://www.shadertoy.com/view/ssj3Dh)
- [`shaders/c/Cube lines.frag`](https://www.shadertoy.com/view/NslGRN)
- [`shaders/c/cubular.frag`](https://www.shadertoy.com/view/M3tGWr)
- [`shaders/c/Curl noise Image transition.frag`](https://www.shadertoy.com/view/tdj3W3)

- [`shaders/d/Dark Transit.frag`](https://www.shadertoy.com/view/WcdczB)
- [`shaders/d/Desire Crystal.frag`](https://www.shadertoy.com/view/flfyRS)
- [`shaders/d/Devil Glass.frag`](https://www.shadertoy.com/view/lcV3Rz)
- [`shaders/d/Digital Brain.frag`](https://www.shadertoy.com/view/4sl3Dr)
- [`shaders/d/Dive to Cloud.frag`](https://www.shadertoy.com/view/ll3SWl)
- [`shaders/d/divergence-free flow curly noise.frag`](https://www.shadertoy.com/view/t3lSDr)
- [`shaders/d/dodecahedron͏.frag`](https://www.shadertoy.com/view/XfKSzV)
- [`shaders/d/drifting.frag`](https://www.shadertoy.com/view/4fdSzf)
- [`shaders/d/Drive Home 6 - Rain Window.frag`](https://www.shadertoy.com/view/tlfBDS)
- [`shaders/d/DULL SKULL - Prometheus.frag`](https://www.shadertoy.com/view/DlyyWR)
- [`shaders/d/Dusty nebula 4.frag`](https://www.shadertoy.com/view/MsVXWW)

- [`shaders/e/ED-209.frag`](https://www.shadertoy.com/view/wsGczG)
- [`shaders/e/electron.frag`](https://www.shadertoy.com/view/MslGRn)
- [`shaders/e/Elemental Ring.frag`](https://www.shadertoy.com/view/MsVXDt)
- [`shaders/e/Elevated.frag`](https://www.shadertoy.com/view/MdX3Rr)
- [`shaders/e/Endless living creature.frag`](https://www.shadertoy.com/view/tljXWy)
- [`shaders/e/EntryLevel.frag`](https://www.shadertoy.com/view/llXXzf)
- [`shaders/e/Ether.frag`](https://www.shadertoy.com/view/MsjSW3)
- [`shaders/e/Eve Arrives.frag`](https://www.shadertoy.com/view/llsXRX)
- [`shaders/e/Even faster procedural ocean.frag`](https://www.shadertoy.com/view/3scfD7)


- [`shaders/f/Fire.frag`](https://www.shadertoy.com/view/3XXSWS)
- [`shaders/f/Flame.frag`](https://www.shadertoy.com/view/MdX3zr)
- [`shaders/f/fractal pyramid.frag`](https://www.shadertoy.com/view/tsXBzS)
- [`shaders/f/Fractured Orb.frag`](https://www.shadertoy.com/view/ttycWW)
- [`shaders/f/Full Spectrum Cyber.frag`](https://www.shadertoy.com/view/XcXXzS)


- [`shaders/g/Galaxy of Universes.frag`](https://www.shadertoy.com/view/MdXSzS)
- [`shaders/g/Galvanize.frag`](https://www.shadertoy.com/view/4tc3zf)
- [`shaders/g/Ghosts.frag`](https://www.shadertoy.com/view/tXlXDX)   
- [`shaders/g/Goodbye Dream Clouds.frag`](https://www.shadertoy.com/view/lfVSRK)
- [`shaders/g/Gradient Flow.frag`](https://www.shadertoy.com/view/wdyczG)

- [`shaders/game/Pacman Game BufferB.frag`]()
- [`shaders/game/Bricks Game BufferB.frag`]()
- [`shaders/game/Pacman Game Common.frag`]()
- [`shaders/game/Bricks Game BufferA.frag`]()
- [`shaders/game/Bricks Game.frag`]()
- [`shaders/game/Pacman Game.frag`]()
- [`shaders/game/Pacman Game BufferA.frag`]()

- [`shaders/h/Hell.frag`](https://www.shadertoy.com/view/MdfGRX)

- [`shaders/i/inercia intended one.frag`](https://www.shadertoy.com/view/cs2GWD)
- [`shaders/i/Ink Blot Spread.frag`](https://www.shadertoy.com/view/wsfcWB)
- [`shaders/i/Input - Time.frag`](https://www.shadertoy.com/view/lsXGz8)
- [`shaders/i/Inside the mandelbulb II.frag`](https://www.shadertoy.com/view/mtScRc)
- [`shaders/i/Inverse Bilinear.frag`](https://www.shadertoy.com/view/lsBSDm)
- [`shaders/i/Ionize.frag`](https://www.shadertoy.com/view/wfc3z7)

- [`shaders/l/Landmass z-morph.frag`](https://www.shadertoy.com/view/tt2BzW)
- [`shaders/l/Let's self reflect.frag`](https://www.shadertoy.com/view/XfyXRV)
- [`shaders/l/Lights in Smoke.frag`](https://www.shadertoy.com/view/MdyGzR)

- [`shaders/m/M-O (from Wall-E).frag`](https://www.shadertoy.com/view/WdVfRc)
- [`shaders/m/macOS Monterey 2.frag`](https://www.shadertoy.com/view/mdf3R2)
- [`shaders/m/MacOS Monterey wallpaper.frag`](https://www.shadertoy.com/view/7tGfWm)
- [`shaders/m/Mandelbulb 3D Fractal.frag`](https://www.shadertoy.com/view/tsc3Rj)
- [`shaders/m/Mandelbulb Deconstructed.frag`](https://www.shadertoy.com/view/XsXXWS)
- [`shaders/m/mandelbulb.frag`](https://www.shadertoy.com/view/MdXSWn)
- [`shaders/m/Mario World 1-1.frag`](https://www.shadertoy.com/view/XtlSD7)
- [`shaders/m/Metal Vortex.frag`](https://www.shadertoy.com/view/wssXzr)
- [`shaders/m/MONSTER.frag`](https://www.shadertoy.com/view/WtKSzt)
- [`shaders/m/Monterey wannabe.frag`](https://www.shadertoy.com/view/NdVfzK)

- [`shaders/n/Noise Lab (3D).frag`](https://www.shadertoy.com/view/4sc3z2)
- [`shaders/n/NotSoGreeeen - Chromatic Hole.frag`](https://www.shadertoy.com/view/M33GD8)

- [`shaders/o/Octagrams.frag`](https://www.shadertoy.com/view/tlVGDt)
- [`shaders/o/Origami.frag`](https://www.shadertoy.com/view/ctGyWK)

- [`shaders/p/Page Curl Effect on Ball.frag`](https://www.shadertoy.com/view/XtX3R2)
- [`shaders/p/Palace of Mind.frag`](https://www.shadertoy.com/view/wttXDl)
- [`shaders/p/Parallax transition with mouse.frag`](https://www.shadertoy.com/view/flVGWK)
- [`shaders/p/Perlin sin sphere.frag`](https://www.shadertoy.com/view/M333RH)
- [`shaders/p/Perspex Web Lattice.frag`](https://www.shadertoy.com/view/Mld3Rn)
- [`shaders/p/Phantom Star for CineShader.frag`](https://www.shadertoy.com/view/ttKGDt)
- [`shaders/p/Pig Squad 9 Year Anniversary.frag`](https://www.shadertoy.com/view/WdBcRh)
- [`shaders/p/Pistons with Motion Blur.frag`](https://www.shadertoy.com/view/7lsGRf)
- [`shaders/p/Plasma Globe.frag`](https://www.shadertoy.com/view/XsjXRm)
- [`shaders/p/Portal - iOS AR.frag`](https://www.shadertoy.com/view/lldcR8)
- [`shaders/p/Portal 2 Box Flip Rotation.frag`](https://www.shadertoy.com/view/ltBcD3)
- [`shaders/p/Protean clouds.frag`](https://www.shadertoy.com/view/3l23Rh)
- [`shaders/p/Pulsar Explained.frag`](https://www.shadertoy.com/view/wXfXWS)


- [`shaders/r/Rainforest.frag`](https://www.shadertoy.com/view/4ttSWf)
- [`shaders/r/Rainier mood.frag`](https://www.shadertoy.com/view/ldfyzl)
- [`shaders/r/Raymarching Basic.frag`](https://www.shadertoy.com/view/Ml2XRD)
- [`shaders/r/Reclaim the streets.frag`](https://www.shadertoy.com/view/fdSGWw)
- [`shaders/r/Red-Blue Swirl.frag`](https://www.shadertoy.com/view/3fdGD7)

- [`shaders/s/Seascape.frag`](https://www.shadertoy.com/view/Ms2SD1)
- [`shaders/s/Server Room.frag`](https://www.shadertoy.com/view/MdySzc)
- [`shaders/s/Shader Art Coding Introduction.frag`](https://www.shadertoy.com/view/mtyGWy)
- [`shaders/s/Shock Wave with Saturation.frag`](https://www.shadertoy.com/view/llj3Dz)
- [`shaders/s/simple page curl effect.frag`](https://www.shadertoy.com/view/ls3cDB)
- [`shaders/s/simple refraction test.frag`](https://www.shadertoy.com/view/flcSW2)
- [`shaders/s/Simple ripple shader.frag`](https://www.shadertoy.com/view/WtjBRc)
- [`shaders/s/Singularity.frag`](https://www.shadertoy.com/view/3csSWB)
- [`shaders/s/Space Curvature.frag`](https://www.shadertoy.com/view/llj3Rz)
- [`shaders/s/Sphere Gears.frag`](https://www.shadertoy.com/view/tt2XzG)
- [`shaders/s/Split Prism.frag`](https://www.shadertoy.com/view/MsXGR8)
- [`shaders/s/Spreading Frost.frag`](https://www.shadertoy.com/view/XddcRr)
- [`shaders/s/starfield new.frag`](https://www.shadertoy.com/view/XXGGDy)
- [`shaders/s/superResolution.frag`](https://www.shadertoy.com/view/ltsczl)

- [`shaders/t/The sun, the sky and the clouds.frag`](https://www.shadertoy.com/view/tdSXzD)
- [`shaders/t/TIE Fighters.frag`](https://www.shadertoy.com/view/WlcyD7)
- [`shaders/t/Tissue.frag`](https://www.shadertoy.com/view/XdBSzd)
- [`shaders/t/tm gyroids.frag`](https://www.shadertoy.com/view/l3fSDr)
- [`shaders/t/Transition Burning.frag`](https://www.shadertoy.com/view/ltV3RG)
- [`shaders/t/Transition SST.frag`](https://www.shadertoy.com/view/wltGRS)
- [`shaders/t/Transition with image.frag`](https://www.shadertoy.com/view/WsB3Wy)
- [`shaders/t/Tunnel Cable.frag`](https://www.shadertoy.com/view/MfVfz3)

- [`shaders/u/UI noise halo.frag`](https://www.shadertoy.com/view/3tBGRm)
- [`shaders/u/Underground Passageway.frag`](https://www.shadertoy.com/view/XdcfDf)
- [`shaders/u/Undular Substratum.frag`](https://www.shadertoy.com/view/3ccGRr)

- [`shaders/v/Very fast procedural ocean.frag`](https://www.shadertoy.com/view/MdXyzX)

- [`shaders/w/Warped Extruded Skewed Grid.frag`](https://www.shadertoy.com/view/wtfBDf)
- [`shaders/w/Warping - procedural 2.frag`](https://www.shadertoy.com/view/lsl3RH)
- [`shaders/w/Water2D.frag`](https://www.shadertoy.com/view/Mls3DH)
- [`shaders/w/wavyfire.frag`](https://www.shadertoy.com/view/ctdczf)
- [`shaders/w/Where the River Goes.frag`](https://www.shadertoy.com/view/Xl2XRW)

- [`shaders/z/Zippy Zaps.frag`](https://www.shadertoy.com/view/XXyGzh)