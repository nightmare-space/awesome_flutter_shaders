# Awesome Flutter Shaders

This is a Flutter shader gallery with **100+ runtime shaders (`.frag`) ready to use in Flutter**.

All shaders are rendered via [shader_graph](https://pub.dev/packages/shader_graph). Most of them aim to stay highly consistent with their Shadertoy counterparts.

Highlights:

- Single-pass & multi-pass pipelines (e.g. BufferA/BufferB)
- Feedback-based passes
- Mouse input support (Shadertoy-style)
- Texture inputs (iChannel0..)

Entry point: `lib/main.dart`

## Build / Run

```bash
flutter pub get
flutter run
```

Run on a specific device (examples):

```bash
flutter run -d macos
flutter run -d chrome
```

## Online Experience

Most shaders in this gallery support running directly on the Web. For those that don't, see the section below for details.

Experience the magic by visiting the built web version: https://nightmare-space.github.io/awesome_flutter_shaders/

## Current Issues

Some shaders may fail to run on the Web (due to Skia’s SkSL limitations) but work fine on desktop and mobile platforms. However, they can still run on ShaderToy. At the moment, it’s possible to fix them one by one—for example, by switching to compatible syntax and using macros to replace unsupported functions.

```glsl
// Whether to remap derivative builtins (dFdx/dFdy/fwidth) to fallbacks.
//
// Default behavior:
// - GLSL < 300: remap ON (common on WebGL1-style paths)
// - GLSL >= 300: remap OFF
//
// You can override by defining `SG_REMAP_DERIVATIVES` before including this file.
#ifndef SG_REMAP_DERIVATIVES
#if !defined(__VERSION__) || (__VERSION__ < 300)
#define SG_REMAP_DERIVATIVES 1
#else
#define SG_REMAP_DERIVATIVES 0
#endif
#endif

// Derivatives (`dFdx/dFdy/fwidth`) are not available in GLSL ES 1.00 unless
// `OES_standard_derivatives` is enabled. Some web backends (or transpilers)
// compile to GLSL 1.00 without enabling the extension, which makes `fwidth`
// an unknown identifier.
//
// Use `sg_fwidth()` instead of `fwidth()` in migrated shaders.
float sg_fwidth(float x) {

// If we remap `fwidth` -> `sg_fwidth`, do NOT call the builtin here to avoid
// macro recursion.
#if (SG_REMAP_DERIVATIVES == 0) && defined(__VERSION__) && (__VERSION__ >= 300)
	return fwidth(x);
#else
	// Best-effort AA width fallback when derivatives are unavailable.
	return 1.0 / max(iResolution.x, iResolution.y);
#endif
}

vec2 sg_fwidth(vec2 v) { return vec2(sg_fwidth(v.x), sg_fwidth(v.y)); }
vec3 sg_fwidth(vec3 v) { return vec3(sg_fwidth(v.x), sg_fwidth(v.y), sg_fwidth(v.z)); }
vec4 sg_fwidth(vec4 v) { return vec4(sg_fwidth(v.x), sg_fwidth(v.y), sg_fwidth(v.z), sg_fwidth(v.w)); }

// Derivative fallbacks.
// NOTE: These are NOT equivalent to real screen-space derivatives.
float sg_dFdx(float x) { return 0.0; }
float sg_dFdy(float x) { return 0.0; }
vec2 sg_dFdx(vec2 v) { return vec2(0.0); }
vec2 sg_dFdy(vec2 v) { return vec2(0.0); }
vec3 sg_dFdx(vec3 v) { return vec3(0.0); }
vec3 sg_dFdy(vec3 v) { return vec3(0.0); }
vec4 sg_dFdx(vec4 v) { return vec4(0.0); }
vec4 sg_dFdy(vec4 v) { return vec4(0.0); }

#if SG_REMAP_DERIVATIVES
#define dFdx sg_dFdx
#define dFdy sg_dFdy
#define fwidth sg_fwidth
#endif
```

However, if Flutter fixes this issue in the future, this work would become unnecessary, and some of these workarounds may introduce performance overhead.

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