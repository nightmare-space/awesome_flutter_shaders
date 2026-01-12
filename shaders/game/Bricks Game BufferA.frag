// Created by inigo quilez - iq/2016
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0

// --- shader_graph port notes ---
// This shader expects:
// - iChannel0: previous frame state (feedback)
// - iChannel1: Shadertoy-style keyboard texture

#include <../common/common_header.frag>
#include <../common/sg_feedback_rgba8.frag>

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

// Use standard scheme (4 physical pixels per virtual texel)

const vec2 VSIZE = vec2(14.0, 14.0);

// Ranges for values that don't naturally fit in [-1,1]
const float POINTS_MAX = 200.0;
const float STATE_MIN = -1.0;
const float STATE_MAX =  2.0;
const float AGE_MAX   =  4.0;

float encPoints(float v) { return sg_encodeRangeToSigned(v, 0.0, POINTS_MAX); }
float decPoints(float s) { return sg_decodeSignedToRange(s, 0.0, POINTS_MAX); }

float encState(float v) { return sg_encodeRangeToSigned(v, STATE_MIN, STATE_MAX); }
float decState(float s) { return sg_decodeSignedToRange(s, STATE_MIN, STATE_MAX); }

float enc01(float v01) { return sg_encode01ToSigned(v01); }
float dec01(float s) { return sg_decodeSignedTo01(s); }

float encAge(float v) { return sg_encodeRangeToSigned(v, 0.0, AGE_MAX); }
float decAge(float s) { return sg_decodeSignedToRange(s, 0.0, AGE_MAX); }

float keyDown(int keyCode) {
    // keyboard texture is 256x3, row0=down
    return SG_TEXELFETCH1(ivec2(keyCode, 0)).x;
}

//
// Gameplay computation.
//
// The gameplay buffer is 14x14 pixels. The whole game is run/played for each one of these
// pixels. A filter in the end of the shader takes only the bit  of infomration that needs 
// to be stored in each texl of the game-logic texture.

// storage register/texel addresses
const ivec2 txBallPosVel = ivec2(0,0);
const ivec2 txPaddlePos  = ivec2(1,0);
const ivec2 txPoints     = ivec2(2,0);
const ivec2 txState      = ivec2(3,0);
const ivec2 txLastHit    = ivec2(4,0);
const ivec4 txBricks     = ivec4(0,1,13,12);

const float ballRadius = 0.035;
const float paddleSize = 0.30;
const float paddleWidth = 0.06;
const float paddlePosY  = -0.90;
// Use 14 horizontal slots so we get a 1-slot margin on both left and right.
// Bricks live in x=1..12; x=0 and x=13 are empty margins.
const float brickW = 2.0/14.0;
const float brickH = 1.0/15.0;

const float gameSpeed =  3.0;
const float inputSpeed = 2.0;

// Simulation speed scale.
// 1.0 = original speed, 0.5 = half speed, 0.25 = quarter speed.
const float SIM_SPEED = 0.3;

const int KEY_SPACE = 32;
const int KEY_LEFT  = 37;
const int KEY_RIGHT = 39;

//----------------------------------------------------------------------------------------------

float hash1( float n ) { return fract(sin(n)*138.5453123); }

// intersect a disk sweept in a linear segment with a line/plane. 
float iPlane( in vec2 ro, in vec2 rd, float rad, vec3 pla )
{
    float a = dot( rd, pla.xy );
    // Avoid division by ~0 which can introduce inf/NaN and permanently corrupt feedback.
    if( a>-1e-6 ) return -1.0;
    float t = (rad - pla.z - dot(ro,pla.xy)) / a;
    if( t>=1.0 ) t=-1.0;
    return t;
}

// intersect a disk sweept in a linear segment with a box 
vec3 iBox( in vec2 ro, in vec2 rd, in float rad, in vec2 bce, in vec2 bwi ) 
{
    // Avoid 1/0 producing inf which can lead to NaNs later.
    vec2 rdSafe = sign(rd) * max(abs(rd), vec2(1e-6));
    vec2 m = 1.0/rdSafe;
    vec2 n = m*(ro - bce);
    vec2 k = abs(m)*(bwi+rad);
    vec2 t1 = -n - k;
    vec2 t2 = -n + k;
	float tN = max( t1.x, t1.y );
	float tF = min( t2.x, t2.y );
	if( tN > tF || tF < 0.0) return vec3(-1.0);
    if( tN>=1.0 ) return vec3(-1.0);
	vec2 nor = -sign(rd)*step(t1.yx,t1.xy);
	return vec3( tN, nor );
}

//----------------------------------------------------------------------------------------------

vec4 loadValue( in ivec2 re )
{
    return SG_LOAD_VEC4( iChannel0, re, VSIZE );
}
void storeValue( in ivec2 re, in vec4 va, inout vec4 fragColor, in ivec2 p )
{
    sg_storeVec4( re, va, fragColor, p );
}
void storeValue( in ivec4 re, in vec4 va, inout vec4 fragColor, in ivec2 p )
{
    sg_storeVec4Range( re, va, fragColor, p );
}

//----------------------------------------------------------------------------------------------

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    ivec2 p = ivec2(fragCoord-0.5);
    vec2 psize = sg_physicalSize(VSIZE);
    if( p.x < 0 || p.y < 0 || float(p.x) >= psize.x || float(p.y) >= psize.y ) { fragColor = vec4(0.0); return; }

    // virtual texel coordinate (original 14x14)
    ivec2 ipx = ivec2(p.x/4, p.y);
    if( ipx.x < 0 || ipx.y < 0 || ipx.x >= 14 || ipx.y >= 14 ) { fragColor = vec4(0.0); return; }
    
    //---------------------------------------------------------------------------------   
	// load game state (note: values may be range-encoded into signed [-1,1])
	//---------------------------------------------------------------------------------

    vec4  balPosVel = loadValue( txBallPosVel );
    float paddlePos = loadValue( txPaddlePos ).x;
    float points    = decPoints( loadValue( txPoints ).x );
    float state     = decState( loadValue( txState ).x );
    vec3  lastHit   = vec3(
        decAge(loadValue( txLastHit ).x),
        decAge(loadValue( txLastHit ).y),
        decAge(loadValue( txLastHit ).z)
    );
    vec2  brick     = vec2(
        dec01(loadValue( ipx ).x),
        decAge(loadValue( ipx ).y)
    );
	
    //---------------------------------------------------------------------------------
    // reset
	//---------------------------------------------------------------------------------
    if( iFrame < 0.5 ) state = -1.0;
	
    if( state < -0.5 )
    {
        state = 0.0;
        balPosVel = vec4(0.0,paddlePosY+ballRadius+paddleWidth*0.5+0.001, 0.6,1.0);
        paddlePos = 0.0;
        points = 0.0;
        state = 0.0;
        brick = vec2(1.0, AGE_MAX);
        lastHit = vec3(AGE_MAX);
        
                           
        if( float(ipx.x) < 1.0 || float(ipx.x) > 12.0 )
        {
            brick.x = 0.0;
            brick.y = AGE_MAX;
        }
        

    }

    //---------------------------------------------------------------------------------
    // do game
    //---------------------------------------------------------------------------------

    // game over (or won), wait for space key press to resume
    if( state > 0.5 )
    {
        float pressSpace = keyDown( KEY_SPACE );
        if( pressSpace>0.5 )
        {
            state = -1.0;
        }
    }
    
    // if game mode (not game over), play game
    else if( state < 0.5 ) 
	{

        //-------------------
        // paddle
        //-------------------
        float oldPaddlePos = paddlePos;
        if( iMouse.z>0.01 )
        {
            // move with mouse
            // Our buffer is rendered at packed physical resolution (virtualWidth * packX, virtualHeight).
            // Convert iMouse/iResolution back to virtual 14x14 semantics for gameplay math.
            float packX = iResolution.x / VSIZE.x;
            vec2 vRes = vec2(iResolution.x / packX, iResolution.y);
            float mx = iMouse.x / packX;
            paddlePos = (-1.0 + 2.0*mx/vRes.x) * (vRes.x/vRes.y);
        }
        else
        {
            // move with keyboard
            float moveRight = keyDown( KEY_RIGHT );
            float moveLeft  = keyDown( KEY_LEFT );
            paddlePos += 0.02*inputSpeed*SIM_SPEED*(moveRight - moveLeft);
        }
        paddlePos = clamp( paddlePos, -1.0+0.5*paddleSize+paddleWidth*0.5, 1.0-0.5*paddleSize-paddleWidth*0.5 );

        float moveTotal = sign( paddlePos - oldPaddlePos );

        //-------------------
        // ball
		//-------------------
        // Fixed timestep (Shadertoy uses iTimeDelta).
        float dt = 1.0/60.0;
        float dis = 0.01*gameSpeed*SIM_SPEED;

        // advance hit ages
        lastHit = min(lastHit + vec3(dt), vec3(AGE_MAX));
        if( brick.x < 0.5 ) brick.y = min(brick.y + dt, AGE_MAX);
        
        // do up to 3 sweep collision detections (usually 0 or 1 will happen only)
        for( int j=0; j<3; j++ )
        {
            ivec3 oid = ivec3(-1);
            vec2 nor;
            float t = 1000.0;

            // test walls
            const vec3 pla1 = vec3(-1.0, 0.0,1.0 ); 
            const vec3 pla2 = vec3( 1.0, 0.0,1.0 ); 
            const vec3 pla3 = vec3( 0.0,-1.0,1.0 ); 
            float t1 = iPlane( balPosVel.xy, dis*balPosVel.zw, ballRadius, pla1 ); if( t1>0.0         ) { t=t1; nor = pla1.xy; oid.x=1; }
            float t2 = iPlane( balPosVel.xy, dis*balPosVel.zw, ballRadius, pla2 ); if( t2>0.0 && t2<t ) { t=t2; nor = pla2.xy; oid.x=2; }
            float t3 = iPlane( balPosVel.xy, dis*balPosVel.zw, ballRadius, pla3 ); if( t3>0.0 && t3<t ) { t=t3; nor = pla3.xy; oid.x=3; }
            
            // test paddle
            vec3  t4 = iBox( balPosVel.xy, dis*balPosVel.zw, ballRadius, vec2(paddlePos,paddlePosY), vec2(paddleSize*0.5,paddleWidth*0.5) );
            if( t4.x>0.0 && t4.x<t ) { t=t4.x; nor = t4.yz; oid.x=4;  }
            
            // test bricks
            ivec2 idr = ivec2(floor( vec2( (1.0+balPosVel.x)/brickW, (1.0-balPosVel.y)/brickH) ));
            ivec2 vs = ivec2(sign(balPosVel.zw));
            // Avoid reusing loop variable names inside SkSL (can cause odd compiler behavior).
                for( int jj=0; jj<3; jj++ )
                for( int ii=0; ii<3; ii++ )
            {
                ivec2 id = idr + ivec2( vs.x*ii,-vs.y*jj);
                    if( id.x>=0 && id.x<14 && id.y>=0 && id.y<12 )
                {
                    float brickHere = dec01( loadValue( txBricks.xy + id ).x );
                    if( brickHere>0.5 )
                    {
                        vec2 ce = vec2( -1.0 + float(id.x)*brickW + 0.5*brickW,
                                         1.0 - float(id.y)*brickH - 0.5*brickH );
                        vec3 t5 = iBox( balPosVel.xy, dis*balPosVel.zw, ballRadius, ce, 0.5*vec2(brickW,brickH) );
                        if( t5.x>0.0 && t5.x<t )
                        {
                            oid = ivec3(5,id);
                            t = t5.x;
                            nor = t5.yz;
                        }
                    }
                }
            }
    
            // no collisions
            if( oid.x<0 ) break;

            
            // bounce
            balPosVel.xy += t*dis*balPosVel.zw;
            dis *= 1.0-t;
            
            // did hit walls
            if( oid.x<4 )
            {
                balPosVel.zw = reflect( balPosVel.zw, nor );
                lastHit.z = 0.0;
            }
            // did hit paddle
            else if( oid.x<5 )
            {
                balPosVel.zw = reflect( balPosVel.zw, nor );
                // borders bounce back
                     if( balPosVel.x > (paddlePos+paddleSize*0.5) ) balPosVel.z =  abs(balPosVel.z);
                else if( balPosVel.x < (paddlePos-paddleSize*0.5) ) balPosVel.z = -abs(balPosVel.z);
                balPosVel.z += 0.37*moveTotal;
                balPosVel.z += 0.11*hash1( float(iFrame)*7.1 );
                balPosVel.z = clamp( balPosVel.z, -0.9, 0.9 );
                // normalize() on a near-zero vector can produce NaN on some backends.
                float v2 = dot(balPosVel.zw, balPosVel.zw);
                if( v2 < 1e-8 ) balPosVel.zw = vec2(0.0, 1.0);
                else balPosVel.zw *= inversesqrt(v2);
                
                // 
                lastHit.x = 0.0;
                lastHit.y = 0.0;
            }
            // did hit a brick
            else if( oid.x<6 )
            {
                balPosVel.zw = reflect( balPosVel.zw, nor );
                lastHit.y = 0.0;
                points += 1.0;
                if( points>131.5 )
                {
                    state = 2.0; // won game!
                }

                if( ipx == txBricks.xy+oid.yz )
                {
                    brick = vec2(0.0, 0.0);
                }
            }
        }
        
        balPosVel.xy += dis*balPosVel.zw;
        
        // detect miss
        if( balPosVel.y<-1.0 )
        {
            state = 1.0; // game over
        }
    }
    
	//---------------------------------------------------------------------------------
	// store game state
	//---------------------------------------------------------------------------------
    fragColor = vec4(0.0);
    
 
    storeValue( txBallPosVel, vec4(balPosVel),                                  fragColor, p );
    // 重要：Flutter 的 sampler 可能进行线性采样，lane 之间如果发生轻微串扰，
    // 会把“只写在 .x 的值”与邻近 lane 的 0 混合，导致状态被污染，进而出现“球/挡板分裂”。
    // 对单标量寄存器，把值复制到 4 个 lane，提高抗串扰能力。
    storeValue( txPaddlePos,  vec4(paddlePos, paddlePos, paddlePos, paddlePos), fragColor, p );
    storeValue( txPoints,     vec4(encPoints(points)),                          fragColor, p );
    storeValue( txState,      vec4(encState(state)),                            fragColor, p );
    // lastHit 的 w 不使用，但让 z/w 相同可降低 lane2/3 混合时的误差
    storeValue( txLastHit,    vec4(encAge(lastHit.x), encAge(lastHit.y), encAge(lastHit.z), encAge(lastHit.z)), fragColor, p );
    storeValue( txBricks,     vec4(enc01(brick.x), encAge(brick.y), 0.0, 0.0),  fragColor, p );
}

#include <../common/main_shadertoy.frag>