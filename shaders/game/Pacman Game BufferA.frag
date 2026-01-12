// Created by inigo quilez - iq/2016
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0

// --- shader_graph port notes ---
// This shader expects:
// - iChannel0: previous frame state (feedback, RGBA8 packed via sg_feedback_rgba8)
// - iChannel1: Shadertoy-style keyboard texture (256x3, row0=down)

#include <../common/common_header.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

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
const ivec4 txCells           = ivec4(0,0,27,31);

// Virtual state size (Shadertoy texel space): 32x32
// Physical feedback size (Flutter output): (32*4)x32
const vec2 VSIZE = vec2(32.0, 32.0);

// Game play

#define _ 0 // empty
#define W 1 // wall
#define P 2 // point
#define B 3 // ball
#define PA(a,b,c,d,e,f,g) (a+4*(b+4*(c+4*(d+4*(e+4*(f+4*(g)))))))
#define DD(id,c0,c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13) if(y==id) m=(x<7)?PA(c0,c1,c2,c3,c4,c5,c6):PA(c7,c8,c9,c10,c11,c12,c13);

int GetBits2(int value, int shift) {
    float shifted = floor(float(value) / pow(2.0, float(shift)));
    return int(mod(shifted, 4.0));
}
int map( in ivec2 q ) 
{
    if( q.x>13 ) q.x = q.x = 26-q.x;
	int x = q.x;
	int y = q.y;
	int m = 0;
    DD(30, W,W,W,W,W,W,W,W,W,W,W,W,W,W)
    DD(29, W,P,P,P,P,P,P,P,P,P,P,P,P,W)
    DD(28, W,P,W,W,W,W,P,W,W,W,W,W,P,W)
    DD(27, W,B,W,W,W,W,P,W,W,W,W,W,P,W)
    DD(26, W,P,W,W,W,W,P,W,W,W,W,W,P,W)
    DD(25, W,P,P,P,P,P,P,P,P,P,P,P,P,P)
    DD(24, W,P,W,W,W,W,P,W,W,P,W,W,W,W)
    DD(23, W,P,W,W,W,W,P,W,W,P,W,W,W,W)
    DD(22, W,P,P,P,P,P,P,W,W,P,P,P,P,W)
    DD(21, W,W,W,W,W,W,P,W,W,W,W,W,_,W)
    DD(20, _,_,_,_,_,W,P,W,W,W,W,W,_,W)
    DD(19, _,_,_,_,_,W,P,W,W,_,_,_,_,_)
    DD(18, _,_,_,_,_,W,P,W,W,_,W,W,W,_)
    DD(17, W,W,W,W,W,W,P,W,W,_,W,_,_,_)
    DD(16, _,_,_,_,_,_,P,_,_,_,W,_,_,_)
    DD(15, W,W,W,W,W,W,P,W,W,_,W,_,_,_)
    DD(14, _,_,_,_,_,W,P,W,W,_,W,W,W,W)
    DD(13, _,_,_,_,_,W,P,W,W,_,_,_,_,_)
    DD(12, _,_,_,_,_,W,P,W,W,_,W,W,W,W)
    DD(11, W,W,W,W,W,W,P,W,W,_,W,W,W,W)
    DD(10, W,P,P,P,P,P,P,P,P,P,P,P,P,W)
    DD( 9, W,P,W,W,W,W,P,W,W,W,W,W,P,W)
    DD( 8, W,P,W,W,W,W,P,W,W,W,W,W,P,W)
    DD( 7, W,B,P,P,W,W,P,P,P,P,P,P,P,_)
    DD( 6, W,W,W,P,W,W,P,W,W,P,W,W,W,W)
    DD( 5, W,W,W,P,W,W,P,W,W,P,W,W,W,W)
    DD( 4, W,P,P,P,P,P,P,W,W,P,P,P,P,W)
    DD( 3, W,P,W,W,W,W,W,W,W,W,W,W,P,W)
    DD( 2, W,P,W,W,W,W,W,W,W,W,W,W,P,W)
    DD( 1, W,P,P,P,P,P,P,P,P,P,P,P,P,P)
    DD( 0, W,W,W,W,W,W,W,W,W,W,W,W,W,W)
    // SkSL 不允许 int '%'，用 float mod 替代。
    int xm = int(mod(float(x), 7.0));
	return GetBits2(m, 2*xm);
}

//----------------------------------------------------------------------------------------------

const int KEY_SPACE = 32;
const int KEY_LEFT  = 37;
const int KEY_UP    = 38;
const int KEY_RIGHT = 39;
const int KEY_DOWN  = 40;

const float speedPacman = 7.0;
const float speedGhost  = 6.0;
// const float speedPacman = 6.0;
// const float speedGhost  = 3.5;
const float intelligence = 0.53;
const float modeTime = 5.0;

//----------------------------------------------------------------------------------------------

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

float encRange(float v, float vMin, float vMax) { return sg_encodeRangeToSigned(v, vMin, vMax); }
float decRange(float s, float vMin, float vMax) { return sg_decodeSignedToRange(s, vMin, vMax); }

float enc01(float v01) { return sg_encode01ToSigned(v01); }
float dec01(float s) { return sg_decodeSignedTo01(s); }

float keyDown(int keyCode) {
    return SG_TEXELFETCH1(ivec2(keyCode, 0)).x;
}

float hash(float seed)
{
    return fract(sin(seed)*158.5453 );
}

//----------------------------------------------------------------------------------------------

vec4 loadValueSigned( in ivec2 re )
{
    return SG_LOAD_VEC4( iChannel0, re, VSIZE );
}

float loadCell( in ivec2 re )
{
    // cell stored in x (lane0)
    float s = SG_LOAD_FLOAT(iChannel0, re, VSIZE);
    float v = decRange(s, CELL_MIN, CELL_MAX);
    // Cells are discrete {0,1,2,3}. Round to avoid RGBA8 quantization drift.
    return clamp(floor(v + 0.5), CELL_MIN, CELL_MAX);
}

vec4 decPos( vec4 s )
{
    float x = decRange(s.x, X_MIN, X_MAX);
    float y = decRange(s.y, Y_MIN, Y_MAX);
    // Positions are grid-aligned in this game. Round to keep stable collision.
    x = floor(x + 0.5);
    y = floor(y + 0.5);
    return vec4(x, y, dec01(s.z), dec01(s.w));
}

vec4 decGhostPos( vec4 s )
{
    float x = floor(decRange(s.x, X_MIN, X_MAX) + 0.5);
    float y = floor(decRange(s.y, Y_MIN, Y_MAX) + 0.5);
    float z = dec01(s.z);
    float w = floor(decRange(s.w, DIR_MIN, DIR_MAX) + 0.5);
    return vec4(x, y, z, w);
}

vec3 decDir3( vec3 s )
{
    float dx = decRange(s.x, DIR_MIN, DIR_MAX);
    float dy = decRange(s.y, DIR_MIN, DIR_MAX);
    float dz = decRange(s.z, DIR_MIN, DIR_MAX);
    // Directions are discrete ints 0..4.
    return vec3(floor(dx + 0.5), floor(dy + 0.5), floor(dz + 0.5));
}

vec2 decPoints( vec2 s )
{
    return vec2(
        decRange(s.x, 0.0, SCORE_MAX),
        decRange(s.y, 0.0, PELLET_MAX)
    );
}

vec3 decMode( vec3 s )
{
    float mx = decRange(s.x, 0.0, 1.0);
    // Discrete flag (0/1). Quantize to avoid 0.99 affecting ghost steering.
    mx = (mx > 0.5) ? 1.0 : 0.0;
    return vec3(
        mx,
        decRange(s.y, 0.0, modeTime),
        decRange(s.z, 0.0, 1.0)
    );
}

vec4 encPos( vec4 v )
{
    return vec4(
        encRange(v.x, X_MIN, X_MAX),
        encRange(v.y, Y_MIN, Y_MAX),
        enc01(v.z),
        enc01(v.w)
    );
}

vec4 encGhostPos( vec4 v )
{
    return vec4(
        encRange(v.x, X_MIN, X_MAX),
        encRange(v.y, Y_MIN, Y_MAX),
        enc01(v.z),
        encRange(v.w, DIR_MIN, DIR_MAX)
    );
}

vec4 encDirNex( vec3 v )
{
    return vec4(
        encRange(v.x, DIR_MIN, DIR_MAX),
        encRange(v.y, DIR_MIN, DIR_MAX),
        encRange(v.z, DIR_MIN, DIR_MAX),
        0.0
    );
}

vec4 encPointsVec4( vec2 v )
{
    return vec4(
        encRange(v.x, 0.0, SCORE_MAX),
        encRange(v.y, 0.0, PELLET_MAX),
        0.0,
        0.0
    );
}

vec4 encStateVec4( float v )
{
    return vec4(encRange(v, STATE_MIN, STATE_MAX), 0.0, 0.0, 0.0);
}

vec4 encLivesVec4( float v )
{
    return vec4(encRange(v, 0.0, 3.0), 0.0, 0.0, 0.0);
}

vec4 encModeVec4( vec3 v )
{
    return vec4(
        encRange(v.x, 0.0, 1.0),
        encRange(v.y, 0.0, modeTime),
        encRange(v.z, 0.0, 1.0),
        0.0
    );
}

vec4 encCellVec4( float cell )
{
    return vec4(encRange(cell, CELL_MIN, CELL_MAX), 0.0, 0.0, 0.0);
}

void storeValue( in ivec2 re, in vec4 vaSigned, inout vec4 fragColor, in ivec2 p )
{
    sg_storeVec4( re, vaSigned, fragColor, p );
}

void storeValue( in ivec4 re, in vec4 vaSigned, inout vec4 fragColor, in ivec2 p )
{
    sg_storeVec4Range( re, vaSigned, fragColor, p );
}

ivec2 dir2dis( in int dir )
{
    ivec2 off = ivec2(0,0);
         if( dir==0 ) { off = ivec2( 0, 0); }
    else if( dir==1 ) { off = ivec2( 1, 0); }
    else if( dir==2 ) { off = ivec2(-1, 0); }
    else if( dir==3 ) { off = ivec2( 0, 1); }
    else              { off = ivec2( 0,-1); }
    return off;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    ivec2 p = ivec2( fragCoord-0.5 );
    vec2 psize = sg_physicalSize(VSIZE);

    if (p.x < 0 || p.y < 0 || float(p.x) >= psize.x || float(p.y) >= psize.y) {
        fragColor = vec4(0.0);
        return;
    }

    ivec2 ifragCoord = ivec2( p.x / 4, p.y );

    // don't compute gameplay outside of the data area
    if( ifragCoord.x > 31 || ifragCoord.y>31 ) {
        fragColor = vec4(0.0);
        return;
    }

    //---------------------------------------------------------------------------------
	// load game state (decode from signed storage)
	//---------------------------------------------------------------------------------
    vec4  ghostPos[4];

    vec4  pacmanPos       = decPos( loadValueSigned( txPacmanPos ) );
    vec3  pacmanMovDirNex = decDir3( loadValueSigned( txPacmanMovDirNex ).xyz );
    vec2  points          = decPoints( loadValueSigned( txPoints ).xy );
    float state           = decRange( SG_LOAD_FLOAT(iChannel0, txState, VSIZE), STATE_MIN, STATE_MAX ); // -1 = start game, 0 = start life, 1 = playing, 2 = game over
    vec3  mode            = decMode( loadValueSigned( txMode ).xyz );
    float lives           = decRange( SG_LOAD_FLOAT(iChannel0, txLives, VSIZE), 0.0, 3.0 );
    float cell            = loadCell( ifragCoord );

    ghostPos[0]           = decGhostPos( loadValueSigned( txGhost0PosDir ) );
    ghostPos[1]           = decGhostPos( loadValueSigned( txGhost1PosDir ) );
    ghostPos[2]           = decGhostPos( loadValueSigned( txGhost2PosDir ) );
    ghostPos[3]           = decGhostPos( loadValueSigned( txGhost3PosDir ) );

    //---------------------------------------------------------------------------------
    // reset
	//---------------------------------------------------------------------------------
	if( iFrame < 0.5 ) state = -1.0;

    if( state<0.5 )
    {
        pacmanPos       = vec4(13.0,13.0,0.0,0.0);
        pacmanMovDirNex = vec3(0.0,0.0,0.0);
        mode            = vec3(0.0,0.0,0.0);
        ghostPos[0]     = vec4(13.0,19.0,0.0,1.0);
        ghostPos[1]     = vec4(13.0,17.0,0.0,1.0);
        ghostPos[2]     = vec4(12.0,16.0,0.0,1.0);
        ghostPos[3]     = vec4(14.0,15.0,0.0,1.0);
    }

    if( state < -0.5 )
    {
        state           = 0.0;
        points          = vec2(0.0,0.0);
        lives           = 3.0;
        if( ifragCoord.x<27 && ifragCoord.y<31 )
            cell = float(map( ifragCoord ));
    }
    else if( state < 0.5 )
    {
        state = 1.0;
    }
    else if( state < 1.5 )
	{
        //-------------------
        // fixed timestep (Shadertoy uses iTimeDelta)
        //-------------------
        float dt = 1.0/60.0;

        //-------------------
        // pacman
        //-------------------

        // move with keyboard
        if( keyDown(KEY_RIGHT)>0.5 ) pacmanMovDirNex.z = 1.0;
        if( keyDown(KEY_LEFT )>0.5 ) pacmanMovDirNex.z = 2.0;
        if( keyDown(KEY_UP   )>0.5 ) pacmanMovDirNex.z = 3.0;
        if( keyDown(KEY_DOWN )>0.5 ) pacmanMovDirNex.z = 4.0;

        // execute desired turn as soon as possible
        if( pacmanMovDirNex.z>0.5 && abs(loadCell( ivec2(pacmanPos.xy) + dir2dis(int(pacmanMovDirNex.z)) )-float(W))>0.25 )
        {
            pacmanMovDirNex = vec3( pacmanMovDirNex.zz, 0.0 );
        }

        if( pacmanMovDirNex.x>0.5 ) pacmanPos.z += dt*speedPacman;

        ivec2 off = dir2dis(int(pacmanMovDirNex.x));
        ivec2 np = ivec2(pacmanPos.xy) + off;
        float c = loadCell( np );
        pacmanPos.w = step( 0.25, abs(c-float(W)) );

        if( pacmanPos.z>=1.0 )
        {
            pacmanPos.z = 0.0;
            float c = loadCell( np );

            if( abs(c-float(W))<0.25 )
            {
                pacmanMovDirNex.x = 0.0;
            }
            else
            {
                pacmanPos.xy += vec2(off);
                // tunnel!
                     if( pacmanPos.x< 0.0 ) pacmanPos.x=26.0;
                else if( pacmanPos.x>26.0 ) pacmanPos.x= 0.0;
            }

            bool isin = (ifragCoord.x==int(pacmanPos.x)) && (ifragCoord.y==int(pacmanPos.y));
            c = loadCell( ivec2(pacmanPos.xy) );
            if( abs(c-float(P))<0.2 )
            {
                if( isin ) cell = float(_);
                points += vec2(10.0,1.0);
            }
            else if( abs(c-float(B))<0.2 )
            {
                if( isin ) cell = float(_);
                points += vec2(50.0,1.0);
                mode.x = 1.0;
                mode.y = 0.0;
                mode.z = 0.0;
            }
            if( points.y>241.5 )
            {
                state = 2.0;
            }
        }

        //-------------------
        // ghost
        //-------------------

        for( int i=0; i<4; i++ )
        {
            float seed = float(iFrame)*13.1 + float(i)*17.43;

            ghostPos[i].z += dt*speedGhost;

            if( ghostPos[i].z>=1.0 )
            {
                ghostPos[i].z = 0.0;

                float c = loadCell( ivec2(ghostPos[i].xy)+dir2dis(int(ghostPos[i].w)) );

                bool wr = int(loadCell( ivec2(ghostPos[i].xy)+ivec2( 1, 0) ) + 0.5) == W;
                bool wl = int(loadCell( ivec2(ghostPos[i].xy)+ivec2(-1, 0) ) + 0.5) == W;
                bool wu = int(loadCell( ivec2(ghostPos[i].xy)+ivec2( 0, 1) ) + 0.5) == W;
                bool wd = int(loadCell( ivec2(ghostPos[i].xy)+ivec2( 0,-1) ) + 0.5) == W;

                vec2 ra = vec2( hash( seed + 0.0),
                                hash( seed + 11.57) );
                if( abs(c-float(W)) < 0.25) // found a wall on the way
                {
                    if( ghostPos[i].w < 2.5 ) // was moving horizontally
                    {
                             if( !wu &&  wd )                ghostPos[i].w = 3.0;
                        else if(  wu && !wd )                ghostPos[i].w = 4.0;
                        else if( pacmanPos.y>ghostPos[i].y ) ghostPos[i].w = 3.0+mode.x;
                        else if( pacmanPos.y<ghostPos[i].y ) ghostPos[i].w = 4.0-mode.x;
                        else                                 ghostPos[i].w = 3.0-ghostPos[i].w;
                    }
                    else                          // was moving vertically
                    {
                             if( !wr &&  wl )                ghostPos[i].w = 1.0;
                        else if(  wr && !wl )                ghostPos[i].w = 2.0;
                        else if( pacmanPos.x>ghostPos[i].x ) ghostPos[i].w = 1.0+mode.x;
                        else if( pacmanPos.x<ghostPos[i].x ) ghostPos[i].w = 2.0-mode.x;
                        else                                 ghostPos[i].w = 7.0-ghostPos[i].w;
                    }

                }
                else if( ra.x < intelligence ) // found an intersection and it decided to find packman
                {
                    if( ghostPos[i].w < 2.5 ) // was moving horizontally
                    {
                             if( !wu && pacmanPos.y>ghostPos[i].y ) ghostPos[i].w = 3.0;
                        else if( !wd && pacmanPos.y<ghostPos[i].y ) ghostPos[i].w = 4.0;
                    }
                    else                          // was moving vertically
                    {
                             if( !wr && pacmanPos.x>ghostPos[i].x ) ghostPos[i].w = 1.0;
                        else if( !wl && pacmanPos.x<ghostPos[i].x ) ghostPos[i].w = 2.0;
                    }
                }
                else
                {
                         if( ra.y<0.15 ) { if( !wr ) ghostPos[i].w = 1.0; }
                    else if( ra.y<0.30 ) { if( !wl ) ghostPos[i].w = 2.0; }
                    else if( ra.y<0.45 ) { if( !wu ) ghostPos[i].w = 3.0; }
                    else if( ra.y<0.60 ) { if( !wd ) ghostPos[i].w = 4.0; }
                }

                if( abs(ghostPos[i].x-13.0)<0.25 &&
                    abs(ghostPos[i].y-19.0)<0.25 && 
                    abs(ghostPos[i].w-4.0)<0.25 )
                {
                    ghostPos[i].w = 1.0;
                }

                ghostPos[i].xy += vec2(dir2dis(int(ghostPos[i].w)));

                    // tunnel!
                     if( ghostPos[i].x< 0.0 ) ghostPos[i].x=26.0;
                else if( ghostPos[i].x>26.0 ) ghostPos[i].x= 0.0;
            }

            // collision
            if( abs(pacmanPos.x-ghostPos[i].x)<0.5 && abs(pacmanPos.y-ghostPos[i].y)<0.5 )
            {
                if( mode.x<0.5 )
                {
                    lives -= 1.0;
                    if( lives<0.5 )
                    {
                		state = 2.0;
                    }
                    else
                    {
                        state = 0.0;
                    }
                }
                else
                {
                    points.x += 200.0;
                    ghostPos[i] = vec4(13.0,19.0,0.0,1.0);
                }
            }
        }

        //-------------------
        // mode
        //-------------------
        if (mode.x > 0.5) {
            mode.y += dt;
        } else {
            mode.y = 0.0;
        }
        mode.z = mode.y/modeTime;
        if( mode.x>0.5 && mode.z>1.0 )
        {
            mode.x = 0.0;
            mode.y = 0.0;
            mode.z = 0.0;
        }
    }
    else //if( state > 0.5 )
    {
        float pressSpace = keyDown(KEY_SPACE);
        if( pressSpace>0.5 )
        {
            state = -1.0;
        }
    }

	//---------------------------------------------------------------------------------
	// store game state (encode to signed storage)
	//---------------------------------------------------------------------------------
    fragColor = vec4(0.0);

    storeValue( txPacmanPos,        encPos(pacmanPos),               fragColor, p );
    storeValue( txPacmanMovDirNex,  encDirNex(pacmanMovDirNex),      fragColor, p );
    storeValue( txGhost0PosDir,     encGhostPos(ghostPos[0]),        fragColor, p );
    storeValue( txGhost1PosDir,     encGhostPos(ghostPos[1]),        fragColor, p );
    storeValue( txGhost2PosDir,     encGhostPos(ghostPos[2]),        fragColor, p );
    storeValue( txGhost3PosDir,     encGhostPos(ghostPos[3]),        fragColor, p );
    storeValue( txPoints,           encPointsVec4(points),           fragColor, p );
    storeValue( txState,            encStateVec4(state),             fragColor, p );
    storeValue( txMode,             encModeVec4(mode),               fragColor, p );
    storeValue( txLives,            encLivesVec4(lives),             fragColor, p );
    // Replicate into all lanes to reduce any potential linear sampling cross-lane contamination.
    float cellS = encRange(cell, CELL_MIN, CELL_MAX);
    storeValue( txCells,            vec4(cellS, cellS, cellS, cellS), fragColor, p );
}

#include <../common/main_shadertoy.frag>
