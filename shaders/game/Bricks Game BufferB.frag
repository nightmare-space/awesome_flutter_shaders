// --- Migrate Log ---
// Passthrough buffer to avoid read-write race condition between keyboard input and state feedback
// BufferB simply passes BufferA data to avoid simultaneous read/write conflicts
// --- Migrate Log (EN) ---
// Passthrough buffer to avoid read-write race condition between keyboard input and state feedback

#include <../common/common_header.frag>
uniform sampler2D iChannel0;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Simply pass through the data from the previous buffer (BufferA)
    // Use pixel-center sampling based on integer coords to avoid any
    // accidental linear filtering between texels (critical for packed data).
    ivec2 ipos = ivec2(fragCoord - 0.5);
    fragColor = SG_TEXELFETCH0(ipos);
}

#include <../common/main_shadertoy.frag>
