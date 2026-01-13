// --- Migrate Log ---
// 1) 初始化局部变量（t/z/d/O）以避免未定义行为，并将外层迭代器改为 int
// 2) 替换不支持的循环步长 `dd /= 0.8` 为计数器循环，在循环体内计算 dd 值
// 3) 把 for 头中的累加移入循环体（提高可读性与兼容性）
// 4) 不需要 filter 适配（没有 texture 采样）
//
// --- Migrate Log (EN) ---
// 1) Initialize local variables (t/z/d/O) to avoid undefined behavior, use an int for the outer iterator
// 2) Replace unsupported loop step `dd /= 0.8` with a counter loop, calculating dd value inside loop body
// 3) Move accumulation from for-head into loop body for better SkSL compatibility
// 4) No filter change needed (no texture sampling)

#include <../common/common_header.frag>

// Raymarch iterator count (use int for stable looping)
// Web GL/SkSL requires constant loop count
#define iterCount 100

/*
    "Angel" by @XorDev
    
    An experiment based on my "3D Fire":
    https://www.shadertoy.com/view/3XXSWS
*/
void mainImage(out vec4 O, vec2 I) {
    //Time for animation
    float t = iTime;
    //Raymarch depth
    float z = 0.0;
    //Raymarch step size
    float d = 0.0;
    //Initialize output accumulator
    O = vec4(0.0);
    //Raymarch loop (100 iterations)
    for(int i = 0; i < 100; i++) {
        //Raymarch sample position
        vec3 p = z * normalize(vec3(I + I, 0.0) - iResolution.xyy);
        //Shift camera back
        p.z += 6.0;
        //Twist shape
        p.xz *= mat2(cos(p.y * 0.5 + vec4(0.0, 33.0, 11.0, 0.0)));
        //Distortion (turbulence) loop - use counter loop for SkSL compatibility
        for(int step = 0; step < 8; step++) {
            float dd = pow(0.8, float(-step));
            //Add distortion waves
            p += cos((p.yzx - t * vec3(3.0, 1.0, 0.0)) * dd) / dd;
        }
        //Compute distorted distance field of cylinder
        d = (.1 + abs(length(p.xz) - 0.5)) / 20.0;
        z += d;
        //Sample coloring and glow attenuation (accumulate inside loop)
        O += (sin(z + vec4(2.0, 3.0, 4.0, 0.0)) + 1.1) / d;
    }

    //Tanh tonemapping
    //https://www.shadertoy.com/view/ms3BD7
    O = tanh(O / 4e3);
}

#include <../common/main_shadertoy.frag> 