'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter.js": "24bc71911b75b5f8135c949e27a2984e",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"manifest.json": "7428a35d8d900744570b85157c7fcedb",
"main.dart.mjs": "33dd3ab9cbb17f1c59c3c03422e20be9",
"index.html": "f59029566093916ee329ec3026af20a1",
"/": "f59029566093916ee329ec3026af20a1",
"assets/shaders/game/Pacman%2520Game.frag": "176005ffd1cdb0b6e2e3cef9d29a721c",
"assets/shaders/game/Bricks%2520Game.frag": "15ccd54e6d6bb272f0c03bea74652012",
"assets/shaders/game/Bricks%2520Game%2520BufferB.frag": "d8deec434520de3ed5ebd64191989609",
"assets/shaders/game/Pacman%2520Game%2520BufferA.frag": "b4320992af101f3412bf7bc240990c0b",
"assets/shaders/game/Pacman%2520Game%2520BufferB.frag": "3bac6bcb3053d75f3b49da0be5690048",
"assets/shaders/game/Bricks%2520Game%2520BufferA.frag": "e010758cf2617f7b40bdcdf2d368a67d",
"assets/shaders/t/The%2520sun,%2520the%2520sky%2520and%2520the%2520clouds.frag": "d3881ae5a1ae9c6ae40cf936680bb624",
"assets/shaders/t/Transition%2520Burning.frag": "7789d845bb2331e17ded9c6a4bf2d60f",
"assets/shaders/t/Tunnel%2520Cable.frag": "f08b9292e9e1e7cb64c07c469333c99a",
"assets/shaders/t/Transition%2520with%2520image.frag": "7089ba5f0b98278f7669048349db25b4",
"assets/shaders/t/Tissue.frag": "9055f1e3b14d5b6179b560fbcbeeda31",
"assets/shaders/t/Transition%2520SST.frag": "70add33de386368f2ae106c54f070386",
"assets/shaders/t/TIE%2520Fighters.frag": "76d903473eb92d8d702cbe0ae379e63e",
"assets/shaders/t/tm%2520gyroids.frag": "8037619d46037d2a9c78801baa0316a6",
"assets/shaders/n/Noise%2520Lab%2520(3D).frag": "a9d509361a6bc92bac14443618e134a2",
"assets/shaders/n/NotSoGreeeen%2520-%2520Chromatic%2520Hole.frag": "b6f8e063a0e96d06b186b0fba94aa224",
"assets/shaders/a/Alpha%2520Clip%25201%2520bit%2520dissolve.frag": "7e5ac6668c6fa2f8b563e59a8cdf3b55",
"assets/shaders/a/Alien%2520ocean%2520BufferA.frag": "6a6bf6389cd553b8931f2402d58e7f00",
"assets/shaders/a/A%2520lot%2520of%2520spheres.frag": "5dcae236684ab79cac01bf3d9adbe41d",
"assets/shaders/a/Arcade%2520Pacman.frag": "7f97771e0a916b56ee19f3b841902f7b",
"assets/shaders/a/a%2520study%2520of%2520glass.frag": "f3641023e651c0db9ad51966bb14fd0e",
"assets/shaders/a/Atmosphere%2520system%2520test.frag": "4c4b999f092ee4a0ebf8436e0eb6469e",
"assets/shaders/a/Alien%2520ocean.frag": "4bfccc1d48cbad2c0eb6ac9a23622848",
"assets/shaders/a/Alien%2520Space%2520Jockey.frag": "d9be2c87c9aa118d161c0716f7473bdd",
"assets/shaders/a/Artifact%2520at%2520Sea.frag": "1164a6f7cd2a88a9ddda3825d49b3bd1",
"assets/shaders/a/Analytic%2520Motionblur%25202D.frag": "f18e7fa9449585f829320b71dd5ac768",
"assets/shaders/a/Angel.frag": "e65bbaa9ac700785e255931e126d0926",
"assets/shaders/a/anamorphic%2520rendering.frag": "3e9ebaebed54677dc8f5efa04cb5cfab",
"assets/shaders/u/Undular%2520Substratum.frag": "611b9badafd558606d76bfdabb658164",
"assets/shaders/u/Underground%2520Passageway%2520BufferA.frag": "e023f0e27a03e6e76c7f9405dc65a976",
"assets/shaders/u/UI%2520noise%2520halo.frag": "38ef90f56eef0928e75f5b62b2eb61fc",
"assets/shaders/u/Underground%2520Passageway.frag": "3802dde53b074ec6b72f9f77ce81bf14",
"assets/shaders/stretch_effect.frag": "40d68efbbf360632f614c731219e95f0",
"assets/shaders/v/Very%2520fast%2520procedural%2520ocean.frag": "fefbb878e43a879839c280a9d8de9abc",
"assets/shaders/i/Inside%2520the%2520mandelbulb%2520II.frag": "32cfb6d88fdd331a435466e3829bae49",
"assets/shaders/i/Ionize.frag": "f74b5ef98e25a44dd195195b9667a1bf",
"assets/shaders/i/Inverse%2520Bilinear.frag": "9772a58bda922d461a818510350b80b7",
"assets/shaders/i/inercia%2520intended%2520one.frag": "5106832d86fe656477bd0d5fc8f399b7",
"assets/shaders/i/Ink%2520Blot%2520Spread.frag": "7db892e553481f88d291be6871c50fa7",
"assets/shaders/i/Input%2520-%2520Time.frag": "d66db14dbe0baa6f5b5f19f4e049ffc4",
"assets/shaders/i/Inside%2520the%2520mandelbulb%2520II%2520BufferA.frag": "246ae7c1e2bbfa3e483932d406658453",
"assets/shaders/c/Clouds%25203D.frag": "3b9f6dae19c8c9a35fae643d34ab16e2",
"assets/shaders/c/Cold.frag": "3dbe60560878f83992064ec5788400ba",
"assets/shaders/c/cobweb%2520test.frag": "50f4d6e489900dcb1e8608298777633f",
"assets/shaders/c/cubular.frag": "45956dc16fa11873cc49405b3d34207b",
"assets/shaders/c/Cube%2520lines.frag": "141d09adc1d738da6aebaa1c63b69690",
"assets/shaders/c/Combustible%2520Voronoi.frag": "9bbe0c53e47904704221de04b156b50c",
"assets/shaders/c/Crosswarp%2520transition.frag": "44fbf942a89be087eb613f7ba670bcd8",
"assets/shaders/c/Curl%2520noise%2520Image%2520transition.frag": "e62156c2c59dc116f4295d25d6f4a240",
"assets/shaders/c/Colorful%2520underwater%2520bubbles%2520II.frag": "e35b2d94827c00910d078d00634b4bb1",
"assets/shaders/c/CineShader%2520Lava.frag": "3f1461d9766e4011e5e2f9333a5ee1d2",
"assets/shaders/c/Clouds-2D.frag": "71ee5c710080ea65b23416412fbcc56f",
"assets/shaders/g/Galvanize.frag": "3a4a4ba3eda5b83721386cc482546efc",
"assets/shaders/g/Gradient%2520Flow.frag": "311e7d296b579c1dc6f89333c55fb7f1",
"assets/shaders/g/Goodbye%2520Dream%2520Clouds.frag": "715cfa8b991a15b54a8251e27cc49808",
"assets/shaders/g/Galaxy%2520of%2520Universes.frag": "6f66ed854e30ebe442f8b9b2d74a20ff",
"assets/shaders/g/Ghosts.frag": "043ebaa474d3673817f8b0d0a0980b16",
"assets/shaders/l/Landmass%2520z-morph.frag": "d00f7d550ceb98f4ec1e890f1a5fd928",
"assets/shaders/l/Let's%2520self%2520reflect.frag": "fb3d686a3104faaa6c343f3926565184",
"assets/shaders/l/Lights%2520in%2520Smoke.frag": "e300ea84f5450915d359ffb8c3920c62",
"assets/shaders/m/macOS%2520Monterey%25202.frag": "e180452216fe60654ee94de00ecc220d",
"assets/shaders/m/mandelbulb.frag": "47b13ab9458ce49b9220fbcbd0f28a59",
"assets/shaders/m/M-O%2520(from%2520Wall-E).frag": "da154b177f771b3801cdbf6e2e82a108",
"assets/shaders/m/macOS%2520Monterey%25202%2520BufferA.frag": "12c71c1cc9cdb28387edf4b926735983",
"assets/shaders/m/Monterey%2520wannabe.frag": "dce2b532e364379b70f4d6d79120afc3",
"assets/shaders/m/Metal%2520Vortex.frag": "e301b8d7e143f8a78e6a2b1e62fa3be1",
"assets/shaders/m/MacOS%2520Monterey%2520wallpaper.frag": "e65c367339882e810ee49e137587ed8a",
"assets/shaders/m/Mandelbulb%2520Deconstructed.frag": "8d28a41ec69011687ff0bacca50a03b5",
"assets/shaders/m/MacOS%2520Monterey%2520wallpaper%2520BufferA.frag": "d7972a215f229a44fd81db0b35f99c10",
"assets/shaders/m/Mario%2520World%25201-1.frag": "08794d0fda62f505bef969db7ea4d887",
"assets/shaders/m/Mandelbulb%25203D%2520Fractal.frag": "b9a61eb1261b01b4dc6c14e3b4955dc0",
"assets/shaders/m/MONSTER.frag": "f3451931cd9133ade70eaa2fbfeadb32",
"assets/shaders/w/Water2D.frag": "38cfcd9dc0a3163c38292de7e07879e1",
"assets/shaders/w/wavyfire.frag": "6590b28b8294c5fd308ddd7b2c76d8a0",
"assets/shaders/w/Where%2520the%2520River%2520Goes.frag": "e767e24a56bc555f8ad3b8f6ce55be8c",
"assets/shaders/w/Warped%2520Extruded%2520Skewed%2520Grid.frag": "96af4e1c10b7f6f74d419ef0a93cb976",
"assets/shaders/w/Warping%2520-%2520procedural%25202.frag": "711a91d11a6d65ec08b08518d9296f33",
"assets/shaders/z/Zippy%2520Zaps.frag": "eebac9ee396bf1088c4036c2fc74cb0f",
"assets/shaders/r/Reclaim%2520the%2520streets.frag": "3de50473098703dd669a99b844d98927",
"assets/shaders/r/Rainier%2520mood.frag": "e6f4df8616f7f6c2f8ac4e7fd1773451",
"assets/shaders/r/Raymarching%2520Basic.frag": "7e63feb2b063fcd69d4b0e77f7a444bd",
"assets/shaders/r/Red-Blue%2520Swirl.frag": "a32767b24047d51ce669636b3d5707c6",
"assets/shaders/r/Rainforest%2520BufferA.frag": "c9d7129d5d6a273108744e00d055ec82",
"assets/shaders/r/Rainforest.frag": "c800e9e36a2ea5ab2e62adbe142ea657",
"assets/shaders/r/Rotate%2520And%2520Points%2520Circle.frag": "79af1b42e76904c555d3c11be7944211",
"assets/shaders/s/simple%2520refraction%2520test.frag": "ef70fb39b65ee381406363ac1c7ae57a",
"assets/shaders/s/Server%2520Room.frag": "4706c8b4c7b204224fb198648d1006bf",
"assets/shaders/s/Sphere%2520Gears.frag": "360e3c26c132602a2f0891e7871810df",
"assets/shaders/s/Shock%2520Wave%2520with%2520Saturation.frag": "33047177ec2370f0e449255d96947da5",
"assets/shaders/s/starfield%2520new.frag": "de43819fc07f8643f22e83ff29182243",
"assets/shaders/s/Shader%2520Art%2520Coding%2520Introduction.frag": "b2d609b681be4875cafee6792570a765",
"assets/shaders/s/Split%2520Prism.frag": "087ffae95dafabb990fe09e1efb84aed",
"assets/shaders/s/Space%2520Curvature.frag": "63f8b60cc8a946b4eecc4c28cb79d894",
"assets/shaders/s/simple%2520page%2520curl%2520effect.frag": "f530c9967dce41a52cfc3f7127327a36",
"assets/shaders/s/Singularity.frag": "e5ce53899e3c09a0b222430a238f42d0",
"assets/shaders/s/Simple%2520ripple%2520shader.frag": "03a21935f66bb2d8ebccb24ee158fa6c",
"assets/shaders/s/Seascape.frag": "2429d9101b551d25f803caa706f0d757",
"assets/shaders/s/Spreading%2520Frost.frag": "74a9f667934ced0b420a0dd311e4e803",
"assets/shaders/h/Hell.frag": "41121ab09de8352e48827311326767fd",
"assets/shaders/d/Dive%2520to%2520Cloud.frag": "a508cd28193b4d647065652e80607680",
"assets/shaders/d/DULL%2520SKULL%2520-%2520Prometheus.frag": "08d9020c0c42787f4896714a16f8f4fd",
"assets/shaders/d/Drive%2520Home%25206%2520-%2520Rain%2520Window.frag": "1ab01d88fe0c4ad6100e305841b9fde5",
"assets/shaders/d/Dusty%2520nebula%25204.frag": "051a015296d9c8a2c2ba03f5a1267066",
"assets/shaders/d/Dark%2520Transit.frag": "44e69b0591fc1c155aea03158e55c67e",
"assets/shaders/d/dodecahedron%2520BufferA.frag": "20ef491ac68b03eefb887df9fa5c0b39",
"assets/shaders/d/divergence-free%2520flow%2520curly%2520noise.frag": "14d5f70f9009aa367374b180d7dcbebb",
"assets/shaders/d/dodecahedron.frag": "e9f265be4afb7a17ed15c97a2cf93097",
"assets/shaders/d/Desire%2520Crystal.frag": "efd60aaf5a0ac5be0230d467a9f3e91b",
"assets/shaders/d/drifting.frag": "44970d8f4e165d672b72cc85d6a648bc",
"assets/shaders/d/Devil%2520Glass.frag": "373fe12a4364edc052edb22ccff500d9",
"assets/shaders/d/Digital%2520Brain.frag": "32fc450122861b7b96d4bc3a677b047f",
"assets/shaders/f/Fractured%2520Orb%2520BufferA.frag": "df28d4aaec49609cbc851583b8a3de3c",
"assets/shaders/f/Fractured%2520Orb.frag": "fa98863ea41c1d0a431b5961a008d326",
"assets/shaders/f/Full%2520Spectrum%2520Cyber.frag": "454ec3596c33c4c4154fc57615bc8d77",
"assets/shaders/f/fractal%2520pyramid.frag": "8bed4d796256ef18198c8ce48829e8a3",
"assets/shaders/f/3D%2520Fire.frag": "fdedce6a4eacd14062ea2e54d806ba34",
"assets/shaders/f/Flame.frag": "644350b280365aba5db18ccddf4164e5",
"assets/shaders/o/Origami.frag": "781b4ba764965e665656249efa6874b3",
"assets/shaders/o/Octagrams.frag": "11d3f33d936359b1021bd54b079297ed",
"assets/shaders/b/Buoy.frag": "cda7aeac5c448888788e833070b000e8",
"assets/shaders/b/Byt3-daily-013.frag": "18979a0949acb3530e885fdf01a8f8c2",
"assets/shaders/b/Broken%2520Time%2520Gate.frag": "d77cb748fda969b016173cd4620a83bc",
"assets/shaders/b/Bubbles.frag": "d885758825da9389ca23780795721aac",
"assets/shaders/b/Base%2520warp%2520fBM.frag": "9c0ec691e929e2779bc00aebb1688dc1",
"assets/shaders/b/Black%2520Hole%2520Raymarcher%25203%2520BufferB.frag": "3bd36fe2eb2274b965f61c64318e8827",
"assets/shaders/b/Black%2520Hole%2520Raymarcher%25203.frag": "93b17719e5daf88ebb36be4e59dd0253",
"assets/shaders/b/Black%2520Hole%2520ODE%2520Geodesic%2520Solver.frag": "dc6c0c5498d6cdc2a72f298bc360a873",
"assets/shaders/b/Black%2520Hole%2520Raymarcher%25203%2520BufferC.frag": "b3288e3eca69b520edbbcced214176c7",
"assets/shaders/b/balls%2520are%2520rubbing.frag": "a38507f0997ce63757f04de86f109cdd",
"assets/shaders/b/Balatro%2520Background%2520Shaders.frag": "f04a9fd7e176a2c704ecfec57025c9be",
"assets/shaders/b/Bumped%2520Sinusoidal%2520Warp.frag": "707ff91a51888ff544347e250ae6d1e1",
"assets/shaders/b/Black%2520Hole%2520Raymarcher%25203%2520BufferA.frag": "cbd397ff3bedb366e008916d9562f165",
"assets/shaders/p/Pulsar%2520Explained.frag": "3aead08d9a56f45c065559b348cbe2d5",
"assets/shaders/p/Plasma%2520Globe.frag": "a745ec10bf54e3ea54ac1ffc007513f2",
"assets/shaders/p/Palace%2520of%2520Mind.frag": "4e728af88452933498409e64e5ad8745",
"assets/shaders/p/Portal%2520-%2520iOS%2520AR.frag": "29cfdcf42830a1d9a50a40ba77b0cf73",
"assets/shaders/p/Parallax%2520transition%2520with%2520mouse.frag": "ea42395aa314129b9c8912ae92fa0323",
"assets/shaders/p/Pistons%2520with%2520Motion%2520Blur.frag": "e6789ea7899ac801b7e1b107ed035a9e",
"assets/shaders/p/Portal%2520-%2520iOS%2520AR%2520BufferA.frag": "642ce4be1cb08d1a6a22fae61cb04472",
"assets/shaders/p/Portal%25202%2520Box%2520Flip%2520Rotation.frag": "d302a2c684a43b0a30224212aafe38ae",
"assets/shaders/p/Pig%2520Squad%25209%2520Year%2520Anniversary.frag": "5a4bab72d03fb4c145079304ebc10ed9",
"assets/shaders/p/Perlin%2520sin%2520sphere.frag": "772979bca9cdc141d50beae5d4d54d4a",
"assets/shaders/p/Page%2520Curl%2520Effect%2520on%2520Ball.frag": "0e91a063e53bf9361a613d2d2c8bfb1f",
"assets/shaders/p/Phantom%2520Star%2520for%2520CineShader.frag": "f7060741dafe08b4237c875c428da01d",
"assets/shaders/p/Perspex%2520Web%2520Lattice.frag": "11baecddac382c0e6715972369e2c5ff",
"assets/shaders/p/Protean%2520clouds.frag": "d60b95b8810a1966d555250a11d281dc",
"assets/shaders/e/Elevated.frag": "d1eeaee2fb4d48f8fe52f8f43dfe135d",
"assets/shaders/e/Elemental%2520Ring.frag": "8f3c1abf6623728d72317cca53441065",
"assets/shaders/e/Eve%2520Arrives.frag": "06882cd4a6f566e05c2d02746b146a93",
"assets/shaders/e/electron.frag": "fd049100ca63c2d1744a08b8dec0716d",
"assets/shaders/e/Elevated%2520BufferA.frag": "ea29e56c9b74eb6f3f17b3c272781a50",
"assets/shaders/e/ED-209.frag": "1561c0581a60794e5667ab11be9dfbb6",
"assets/shaders/e/Endless%2520living%2520creature.frag": "9c3fff67536b3f975f61ff69f0a05842",
"assets/shaders/e/EntryLevel.frag": "9bec711ce589373e7ce67a6136e166bc",
"assets/shaders/e/Even%2520faster%2520procedural%2520ocean.frag": "bdadf6d5f210511a04dfb6c346fc3c16",
"assets/shaders/e/Ether.frag": "06ab68db6021b3b2278faf847d2d550c",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin.json": "5e4646829ebb3782b334856da2038c21",
"assets/assets/Wall.jpg": "e7b007e82f41348d226ace03b265a229",
"assets/assets/cubemaps/Uffizi%2520Gallery.png": "99c89475924fd55c57660a50ecb8bc3d",
"assets/assets/codepage12.png": "b0625a60927ded509fa13336c69482e2",
"assets/assets/texture/RGBA%2520Noise%2520Small.png": "11f09edad695dfabf71e6961b7e78afd",
"assets/assets/texture/Organic2.jpg": "cf2ecd9f1950644a05c38f5b27175f8e",
"assets/assets/texture/London.jpg": "ce7ff99a92567aba5694b66d01e2059f",
"assets/assets/texture/Rock%2520Tiles.jpg": "9fbf390b43318de68c775e5c4038498b",
"assets/assets/texture/Stars.jpg": "9c5db60dac5368487c5d24229d9e221b",
"assets/assets/texture/Grey%2520Noise%2520Medium.png": "25ef00f73e2e6a8f0e43f8ff5c8ba060",
"assets/assets/texture/Grey%2520Noise%2520Small.png": "02a752387b73730a24a07eae7cd202e4",
"assets/assets/texture/Rusty%2520Metal.jpg": "632e0a184183dd13ad6a23fc88a5f49b",
"assets/assets/texture/Wood.jpg": "f410c1009c3220486e03543970ea723c",
"assets/assets/texture/Abstract1.jpg": "7b94f293f76b8b2aa311f2ffc27587cf",
"assets/assets/texture/Lichen.jpg": "7b86a8b45d77ca7c4a7f094de66bef7a",
"assets/assets/texture/RGBA%2520Noise%2520Medium.png": "7c756fce1f89f24b100bd4f08b36383d",
"assets/assets/texture/Organic3.jpg": "042c4402d7805fadcdaea5f780f55e52",
"assets/assets/texture/Pebbles.png": "96c6b05c3ce5d38401058d241dcd0a4c",
"assets/fonts/MaterialIcons-Regular.otf": "5d79516351676190b7c3ea59198e0bac",
"assets/NOTICES": "f4c416d9990720d221a4ab1c87b78c7a",
"assets/packages/shader_buffers/assets/blank_16x16.bmp": "59040519be4ddf954419fbe386e49ac4",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.bin": "6fdbe8dd555a587b6e19138c16ef4368",
"canvaskit/chromium/canvaskit.wasm": "a726e3f75a84fcdf495a15817c63a35d",
"canvaskit/chromium/canvaskit.js": "a80c765aaa8af8645c9fb1aae53f9abf",
"canvaskit/chromium/canvaskit.js.symbols": "e2d09f0e434bc118bf67dae526737d07",
"canvaskit/skwasm_heavy.wasm": "b0be7910760d205ea4e011458df6ee01",
"canvaskit/skwasm_heavy.js.symbols": "0755b4fb399918388d71b59ad390b055",
"canvaskit/skwasm.js": "8060d46e9a4901ca9991edd3a26be4f0",
"canvaskit/canvaskit.wasm": "9b6a7830bf26959b200594729d73538e",
"canvaskit/skwasm_heavy.js": "740d43a6b8240ef9e23eed8c48840da4",
"canvaskit/canvaskit.js": "8331fe38e66b3a898c4f37648aaf7ee2",
"canvaskit/skwasm.wasm": "7e5f3afdd3b0747a1fd4517cea239898",
"canvaskit/canvaskit.js.symbols": "a3c9f77715b642d0437d9c275caba91e",
"canvaskit/skwasm.js.symbols": "3a4aadf4e8141f284bd524976b1d6bdc",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"main.dart.wasm": "50c13e7ac2a83f0052d651bd8726a293",
"flutter_bootstrap.js": "29d76f847764effd4d6200a8a3f72ba0",
"version.json": "dca98bb66463b7be4ef230ac619e28b9",
"main.dart.js": "22533e6155942482fad622d075cbf48a"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"main.dart.wasm",
"main.dart.mjs",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
