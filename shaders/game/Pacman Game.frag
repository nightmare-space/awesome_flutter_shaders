// Created by inigo quilez - iq/2014
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// postprocess (thanks to Timothy Lottes for the CRT filter - https://www.shadertoy.com/view/XsjSzR)

#include <../common/common_header.frag>

uniform sampler2D iChannel0; // state
uniform sampler2D iChannel1; // rendered image (BufferB)

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

const vec2 VSIZE = vec2(32.0, 32.0);

// Ranges
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

float sdCircle( in vec2 p, in float r )
{
    return length( p ) - r;
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


vec3 drawMap( vec3 col, in vec2 fragCoord )
{
    vec2 p = fragCoord/iResolution.y;
    p.x += 0.5*(1.0-iResolution.x/iResolution.y); // center
    float wp = 1.0/iResolution.y;

    p *= 31.0;
    vec2 qf = floor(p);
    vec2 r = fract(p);
    float wr = 31.0*wp;

    if( qf.x>=0.0 && qf.x<=27.0 )
    {
        ivec2 q = ivec2(qf);
        float c = loadCell(q);

        // points
        if( abs(c-2.0)<0.5 )
        {
            float d = sdCircle(r-0.5, 0.15);
            col += 0.3*vec3(1.0,0.7,0.4)*exp(-22.0*d*d); // glow
        }
    }

	// balls

    vec2 bp[4];

    bp[0] = vec2( 1.0, 7.0) + 0.5;
    bp[1] = vec2(25.0, 7.0) + 0.5;
    bp[2] = vec2( 1.0,27.0) + 0.5;
    bp[3] = vec2(25.0,27.0) + 0.5;

    for( int i=0; i<4; i++ )
    {
        float c = loadCell( ivec2(bp[i]) );
        if( abs(c-3.0)<0.5 )
        {
            float d = length(p - bp[i]);
            col += 0.35*vec3(1.0,0.7,0.4)*exp(-1.0*d*d)*smoothstep( -1.0, -0.5, sin(2.0*6.2831*iTime) );
        }
    }

    return col;
}


vec3 drawPacman( vec3 col, in vec2 fragCoord, in vec4 pacmanPos, in vec3 pacmanMovDirNex )
{
    vec2 off = dir2dis(pacmanMovDirNex.x);

    vec2 mPacmanPos = pacmanPos.xy;

    vec2 p = fragCoord/iResolution.y;

    vec2 q = p - cell2ndc( mPacmanPos );

    float c = max(0.0,sdCircle(q, 0.023));

    // glow
    col += 0.25*vec3(1.0,0.8,0.0)*exp(-400.0*c*c);

    return col;
}

vec3 drawGhost( vec3 col, in vec2 fragCoord, in vec3 pos, in float dir, in float id, in vec3 mode )
{
    vec2 off = dir2dis(dir);

    vec2 gpos = pos.xy;

    vec2 p = fragCoord/iResolution.y;

    vec2 q = p - cell2ndc( gpos );

    float c = max(0.0,sdCircle(q, 0.023));

    vec3 gco = 0.5 + 0.5*cos( 5.0 + 0.7*id + vec3(0.0,2.0,4.0) );
    float g = mode.x;
    if( mode.z>0.75 )
    {
        g *= smoothstep(-0.2,0.0,sin(3.0*6.28318*mode.y));
    }
    gco = mix( gco, vec3(0.1,0.5,1.0), g );

    // glow
    col += 0.2*gco*exp(-300.0*c*c);

    return col;
}

vec3 drawScore( in vec3 col, in vec2 fragCoord, vec2 score, float lives )
{
    // lives
    for( int i=0; i<3; i++ )
    {
        float h = float(i);
        vec2 q = fragCoord/iResolution.y - vec2(0.1 + 0.075*h, 0.7 );
        if( h + 0.5 < lives )
        {
            float c = max(0.0,sdCircle(q, 0.023));
            col += 0.17*vec3(1.0,0.8,0.0)*exp(-1500.0*c*c);
        }
    }

    return col;
}

//============================================================

// PUBLIC DOMAIN CRT STYLED SCAN-LINE SHADER by Timothy Lottes

#define res (iResolution.xy/floor(1.0+iResolution.xy/512.0))

const float hardScan=-8.0;
const float hardPix=-3.0;
const vec2 warp=vec2(1.0/32.0,1.0/24.0);
const float maskDark=0.6;
const float maskLight=2.0;

float ToLinear1(float c){return(c<=0.04045)?c/12.92:pow((c+0.055)/1.055,2.4);} 
vec3 ToLinear(vec3 c){return vec3(ToLinear1(c.r),ToLinear1(c.g),ToLinear1(c.b));}
float ToSrgb1(float c){return(c<0.0031308?c*12.92:1.055*pow(c,0.41666)-0.055);} 
vec3 ToSrgb(vec3 c){return vec3(ToSrgb1(c.r),ToSrgb1(c.g),ToSrgb1(c.b));}

vec3 Fetch(vec2 pos,vec2 off){
  pos=floor(pos*res+off)/res;
  if(max(abs(pos.x-0.5),abs(pos.y-0.5))>0.5)return vec3(0.0,0.0,0.0);
    return ToLinear(texture(iChannel1,pos.xy).rgb);}

vec2 Dist(vec2 pos){pos=pos*res;return -((pos-floor(pos))-vec2(0.5));}

float Gaus(float pos,float scale){return exp2(scale*pos*pos);} 

vec3 Horz3(vec2 pos,float off){
  vec3 b=Fetch(pos,vec2(-1.0,off));
  vec3 c=Fetch(pos,vec2( 0.0,off));
  vec3 d=Fetch(pos,vec2( 1.0,off));
  float dst=Dist(pos).x;
  float scale=hardPix;
  float wb=Gaus(dst-1.0,scale);
  float wc=Gaus(dst+0.0,scale);
  float wd=Gaus(dst+1.0,scale);
  return (b*wb+c*wc+d*wd)/(wb+wc+wd);} 

vec3 Horz5(vec2 pos,float off){
  vec3 a=Fetch(pos,vec2(-2.0,off));
  vec3 b=Fetch(pos,vec2(-1.0,off));
  vec3 c=Fetch(pos,vec2( 0.0,off));
  vec3 d=Fetch(pos,vec2( 1.0,off));
  vec3 e=Fetch(pos,vec2( 2.0,off));
  float dst=Dist(pos).x;
  float scale=hardPix;
  float wa=Gaus(dst-2.0,scale);
  float wb=Gaus(dst-1.0,scale);
  float wc=Gaus(dst+0.0,scale);
  float wd=Gaus(dst+1.0,scale);
  float we=Gaus(dst+2.0,scale);
  return (a*wa+b*wb+c*wc+d*wd+e*we)/(wa+wb+wc+wd+we);} 

float Scan(vec2 pos,float off){
  float dst=Dist(pos).y;
  return Gaus(dst+off,hardScan);} 

vec3 Tri(vec2 pos){
  vec3 a=Horz3(pos,-1.0);
  vec3 b=Horz5(pos, 0.0);
  vec3 c=Horz3(pos, 1.0);
  float wa=Scan(pos,-1.0);
  float wb=Scan(pos, 0.0);
  float wc=Scan(pos, 1.0);
  return a*wa+b*wb+c*wc;} 

vec3 Mask(vec2 pos)
{
  pos.x+=pos.y*3.0;
  vec3 mask=vec3(maskDark,maskDark,maskDark);
  pos.x=fract(pos.x/6.0);
  if(pos.x<0.333)mask.r=maskLight;
  else if(pos.x<0.666)mask.g=maskLight;
  else mask.b=maskLight;
  return mask;}    


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    //------------------------
    // CRT
    //------------------------
    vec3 col = ToSrgb( Tri(fragCoord.xy/iResolution.xy)*Mask(fragCoord.xy) );

    //------------------------
    // glow
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
    vec3 mode       = loadMode();

    // map
    col = drawMap( col, fragCoord );

    // pacman
    col = drawPacman( col, fragCoord, pacmanPos, pacmanDir );

    // ghosts
    for( int i=0; i<4; i++ )
        col = drawGhost( col, fragCoord, ghostPos[i].xyz, ghostPos[i].w, float(i), mode );

    // score
    col = drawScore( col, fragCoord, points, lives );

	fragColor = vec4( col, 1.0 );
}

#include <../common/main_shadertoy.frag>
