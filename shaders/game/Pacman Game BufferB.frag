// Created by inigo quilez - iq/2016
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0

// --- shader_graph port notes ---
// This shader expects:
// - iChannel0: gameplay/state buffer (feedback, RGBA8 packed via sg_feedback_rgba8)

#include <../common/common_header.frag>

uniform sampler2D iChannel0;

#include <../common/sg_feedback_rgba8.frag>

// storage register/texel addresses (same as Shadertoy)
const ivec2 txPacmanPos       = ivec2(31, 1);
const ivec2 txPacmanMovDirNex = ivec2(31, 3);
const ivec2 txPoints          = ivec2(31, 5);
const ivec2 txState           = ivec2(31, 7);
const ivec2 txGhost0PosDir    = ivec2(31, 9);
const ivec2 txGhost1PosDir    = ivec2(31,11);
const ivec2 txGhost2PosDir    = ivec2(31,13);
const ivec2 txGhost3PosDir    = ivec2(31,15);
const ivec2 txMode            = ivec2(31,17);
const ivec2 txLives           = ivec2(31,19);

// Virtual state size (Shadertoy texel space): 32x32
const vec2 VSIZE = vec2(32.0, 32.0);

// rendering

float sdBox( vec2 p, vec2 b )
{
  vec2 d = abs(p) - b;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdBox( vec2 p, vec2 a, vec2 b )
{
  p -= (a+b)*0.5;
  vec2 d = abs(p) - 0.5*(b-a);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdCircle( in vec2 p, in float r )
{
    return length( p ) - r;
}

//============================================================

// Digit data by P_Malin (https://www.shadertoy.com/view/4sf3RN)
// SkSL/Flutter 不支持全局数组初始化（const int[] = int[](...)）。
int GetFont(int index) {
    if (index == 0) return 0x75557;
    if (index == 1) return 0x22222;
    if (index == 2) return 0x74717;
    if (index == 3) return 0x74747;
    if (index == 4) return 0x11574;
    if (index == 5) return 0x71747;
    if (index == 6) return 0x71757;
    if (index == 7) return 0x74444;
    if (index == 8) return 0x75757;
    if (index == 9) return 0x75747;
    return 0;
}

//  (v >> s) & 1  -> floor(v / 2^s) mod 2
int GetBit(int value, int shift) {
    float shifted = floor(float(value) / pow(2.0, float(shift)));
    return int(mod(shifted, 2.0));
}

int SampleDigit(const in int n, const in vec2 vUV)
{
    vec2 q = abs(vUV-0.5);
    if( max(q.x,q.y)>0.5 ) return 0;

    ivec2 p = ivec2(floor(vUV * vec2(4.0, 5.0)));
    int shift = p.x + p.y*4;

    return GetBit(GetFont(n), shift);
}

int PrintInt( in vec2 uv, in int value )
{
    int res = 0;

    int maxDigits = (value<10) ? 1 : (value<100) ? 2 : 3;
    int digitID = maxDigits - 1 - int(floor(uv.x));

    if( digitID>=0 && digitID<maxDigits )
    {
        int div = (digitID==0) ? 1 : (digitID==1) ? 10 : 100;
        float digitF = floor(float(value) / float(div));
        int n = int(mod(digitF, 10.0));
        res = SampleDigit( n, vec2(fract(uv.x), uv.y) );
    }

    return res;
}

//============================================================

// Ranges for values that don't naturally fit in [-1,1]
const float CELL_MIN  = 0.0;
const float CELL_MAX  = 3.0;
const float STATE_MIN = -1.0;
const float STATE_MAX =  2.0;
const float DIR_MIN   = 0.0;
const float DIR_MAX   = 4.0;
const float X_MIN     = 0.0;
const float X_MAX     = 26.0;
const float Y_MIN     = 0.0;
const float Y_MAX     = 30.0;
const float SCORE_MAX = 50000.0;
const float PELLET_MAX = 242.0;
const float modeTime = 5.0;

float decRange(float s, float vMin, float vMax) { return sg_decodeSignedToRange(s, vMin, vMax); }
float dec01(float s) { return sg_decodeSignedTo01(s); }

float loadCell( in ivec2 re )
{
    float s = SG_LOAD_FLOAT(iChannel0, re, VSIZE);
    return decRange(s, CELL_MIN, CELL_MAX);
}

vec4 loadPacmanPos() {
    vec4 s = SG_LOAD_VEC4(iChannel0, txPacmanPos, VSIZE);
    return vec4(
        decRange(s.x, X_MIN, X_MAX),
        decRange(s.y, Y_MIN, Y_MAX),
        dec01(s.z),
        dec01(s.w)
    );
}

vec3 loadPacmanDir() {
    vec3 s = SG_LOAD_VEC3(iChannel0, txPacmanMovDirNex, VSIZE);
    return vec3(
        decRange(s.x, DIR_MIN, DIR_MAX),
        decRange(s.y, DIR_MIN, DIR_MAX),
        decRange(s.z, DIR_MIN, DIR_MAX)
    );
}

vec4 loadGhostPosDir(ivec2 re) {
    vec4 s = SG_LOAD_VEC4(iChannel0, re, VSIZE);
    float x = floor(decRange(s.x, X_MIN, X_MAX) + 0.5);
    float y = floor(decRange(s.y, Y_MIN, Y_MAX) + 0.5);
    float z = dec01(s.z);
    float w = floor(decRange(s.w, DIR_MIN, DIR_MAX) + 0.5);
    return vec4(x, y, z, w);
}

vec2 loadPoints() {
    vec2 s = SG_LOAD_VEC2(iChannel0, txPoints, VSIZE);
    return vec2(
        decRange(s.x, 0.0, SCORE_MAX),
        decRange(s.y, 0.0, PELLET_MAX)
    );
}

float loadState() {
    return decRange(SG_LOAD_FLOAT(iChannel0, txState, VSIZE), STATE_MIN, STATE_MAX);
}

float loadLives() {
    return decRange(SG_LOAD_FLOAT(iChannel0, txLives, VSIZE), 0.0, 3.0);
}

vec3 loadMode() {
    vec3 s = SG_LOAD_VEC3(iChannel0, txMode, VSIZE);
    float mx = decRange(s.x, 0.0, 1.0);
    mx = (mx > 0.5) ? 1.0 : 0.0;
    return vec3(
        mx,
        decRange(s.y, 0.0, modeTime),
        decRange(s.z, 0.0, 1.0)
    );
}

//============================================================

vec3 drawMap( vec3 col, in vec2 fragCoord )
{
    vec2 p = fragCoord/iResolution.y;
    p.x += 0.5*(1.0-iResolution.x/iResolution.y); // center
    float wp = 1.0/iResolution.y;

    vec2 qf = floor(p*31.0);
    vec2 r = fract(p*31.0);
    float wr = 31.0*wp;

    if( qf.x>=0.0 && qf.x<=27.0 )
    {
        ivec2 q = ivec2(qf);
        float c = loadCell(q);

        // empty
        if( c<0.5 )
        {
        }
        // walls
        else if( c<1.5 )
        {
            vec2 wmi = vec2( loadCell(q + ivec2(-1, 0)),
                             loadCell(q + ivec2( 0,-1)) );
            vec2 wma = vec2( loadCell(q + ivec2( 1, 0)),
                             loadCell(q + ivec2( 0, 1)) );

            wmi = step( abs(wmi-1.0), vec2(0.25) );
            wma = step( abs(wma-1.0), vec2(0.25) );
            vec2 ba = -(0.16+0.35*wmi);
            vec2 bb =  (0.16+0.35*wma);

            float d = sdBox(r-0.5, ba, bb);
            float f = 1.0 - smoothstep( -0.01, 0.01, d );

            vec3 wco = 0.5 + 0.5*cos( 3.9 - 0.2*(wmi.x+wmi.y+wma.x+wma.y) + vec3(0.0,1.0,1.5) );
            wco += 0.1*sin(40.0*d);
            col = mix( col, wco, f );
        }
        // points
        else if( c<2.5 )
        {
            float d = sdCircle(r-0.5, 0.15);
            float f = 1.0 - smoothstep( -wr, wr, d );
            col = mix( col, vec3(1.0,0.8,0.7), f );
        }
        // big balls
        else
        {
            float d = sdCircle( r-0.5 ,0.40*smoothstep( -1.0, -0.5, sin(2.0*6.2831*iTime) ));
            float f = 1.0 - smoothstep( -wr, wr, d );
            col = mix( col, vec3(1.0,0.9,0.5), f );
        }
    }

    return col;
}

vec2 dir2dis( float dir )
{
    vec2 off = vec2(0.0);
         if( dir<0.5 ) { off = vec2( 0.0, 0.0); }
    else if( dir<1.5 ) { off = vec2( 1.0, 0.0); }
    else if( dir<2.5 ) { off = vec2(-1.0, 0.0); }
    else if( dir<3.5 ) { off = vec2( 0.0, 1.0); }
    else               { off = vec2( 0.0,-1.0); }
    return off;
}


vec2 cell2ndc( vec2 c )
{
	c = (c+0.5) / 31.0;
    c.x -= 0.5*(1.0-iResolution.x/iResolution.y); // center
    return c;
}


vec3 drawPacman( vec3 col, in vec2 fragCoord, in vec4 pacmanPos, in vec3 pacmanMovDirNex )
{
    vec2 off = dir2dis(pacmanMovDirNex.x);

    vec2 mPacmanPos = pacmanPos.xy;

    vec2 p = fragCoord/iResolution.y;
    float eps = 1.0 / iResolution.y;

    vec2 q = p - cell2ndc( mPacmanPos );

         if( pacmanMovDirNex.y<1.5 ) { q = q.xy*vec2(-1.0,1.0); }
    else if( pacmanMovDirNex.y<2.5 ) { q = q.xy; }
    else if( pacmanMovDirNex.y<3.5 ) { q = q.yx*vec2(-1.0,1.0); }
    else                             { q = q.yx; }

    float c = sdCircle(q, 0.023);
    float f = c;

    if( pacmanMovDirNex.y>0.5 )
    {
        float an = (0.5 + 0.5*sin(4.0*iTime*6.2831)) * 0.9;
        vec2 w = normalize( q - vec2(0.005,0.0) );

        w = vec2( w.x, abs( w.y ) );
        float m = dot( w, vec2(sin(an),cos(an)));
        f = max( f, -m );
    }
    f = 1.0 - smoothstep( -0.5*eps, 0.5*eps, f );
    col = mix( col, vec3(1.0,0.8,0.1), f );

    return col;
}

vec3 drawGhost( vec3 col, in vec2 fragCoord, in vec3 pos, in float dir, in float id, in vec3 mode )
{
    vec2 off = dir2dis(dir);

    vec2 gpos = pos.xy;

    vec2 p = fragCoord/iResolution.y;
    float eps = 1.0 / iResolution.y;

    vec2 q = p - cell2ndc( gpos );

    float c = sdCircle(q, 0.023);
    float f = c;
	f = max(f,-q.y);
    float on = 0.0025*sin(1.0*6.28318*q.x/0.025 + 6.2831*iTime);
    f = min( f, sdBox(q-vec2(0.0,-0.0065+on), vec2(0.023,0.012) ) );

    vec3 gco = 0.5 + 0.5*cos( 5.0 + 0.7*id + vec3(0.0,2.0,4.0) );
    float g = mode.x;
    if( mode.z>0.75 )
    {
        // mode.y stores elapsed time since mode start in the port.
        g *= smoothstep(-0.2,0.0,sin(3.0*6.28318*mode.y));
    }
    gco = mix( gco, vec3(0.1,0.5,1.0), g );

    f = 1.0 - smoothstep( -0.5*eps, 0.5*eps, f );
    col = mix( col, gco, f );

    f = sdCircle( vec2(abs(q.x-off.x*0.006)-0.011,q.y-off.y*0.006-0.008), 0.008);
    f = 1.0 - smoothstep( -0.5*eps, 0.5*eps, f );
    col = mix( col, vec3(1.0), f );

    f = sdCircle( vec2(abs(q.x-off.x*0.01)-0.011,q.y-off.y*0.01-0.008), 0.004);
    f = 1.0 - smoothstep( -0.5*eps, 0.5*eps, f );
    col = mix( col, vec3(0.0), f );

    return col;
}


vec3 drawScore( in vec3 col, in vec2 fragCoord, vec2 score, float lives )
{
    // score
    vec2 p = fragCoord/iResolution.y;
    col += float( PrintInt( (p - vec2(0.05,0.9))*20.0, int(score.x) ));
    col += float( PrintInt( (p - vec2(0.05,0.8))*20.0, int(242.0-score.y) ));

    // lives
    float eps = 1.0 / iResolution.y;
    for( int i=0; i<3; i++ )
    {
        float h = float(i);
        vec2 q = p - vec2(0.1 + 0.075*h, 0.7 );
        if( h + 0.5 < lives )
        {
            float c = sdCircle(q, 0.023);
            float f = c;

            {
                vec2 w = normalize( q - vec2(0.005,0.0) );
                w = vec2( w.x, abs( w.y ) );
                float an = 0.5;
                float m = dot( w, vec2(sin(an),cos(an)));
                f = max( f, -m );
            }
            f = 1.0 - smoothstep( -0.5*eps, 0.5*eps, f );
            col = mix( col, vec3(1.0,0.8,0.1), f );
        }
    }

    return col;
}

//============================================================

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    //------------------------
    // load game state
    //------------------------

    vec4  pacmanPos = loadPacmanPos();
    vec3  pacmanDir = loadPacmanDir();
    vec4  ghostPos[4];
    ghostPos[0]     = loadGhostPosDir( txGhost0PosDir );
    ghostPos[1]     = loadGhostPosDir( txGhost1PosDir );
    ghostPos[2]     = loadGhostPosDir( txGhost2PosDir );
    ghostPos[3]     = loadGhostPosDir( txGhost3PosDir );
    vec2  points    = loadPoints();
    float state     = loadState();
    float lives     = loadLives();
    vec3  mode      = loadMode();


    //------------------------
    // render
    //------------------------
    vec3 col = vec3(0.0);

    // map
    col = drawMap( col, fragCoord );

    // pacman
    col = drawPacman( col, fragCoord, pacmanPos, pacmanDir );

    // ghosts
    for( int i=0; i<4; i++ )
    {
        col = drawGhost( col, fragCoord, ghostPos[i].xyz, ghostPos[i].w, float(i), mode );
    }

    // score
    col = drawScore( col, fragCoord, points, lives );


    if( state>1.5 )
    {
        col = mix( col, vec3(0.3), smoothstep(-1.0,1.0,sin(2.0*6.2831*iTime)) );
    }

	fragColor = vec4( col, 1.0 );
}

#include <../common/main_shadertoy.frag>
