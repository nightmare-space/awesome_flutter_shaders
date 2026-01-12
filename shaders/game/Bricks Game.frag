// Created by inigo quilez - iq/2016
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org/
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0

//
// Game rendering. Regular 2D distance field rendering.
//

#include <../common/common_header.frag>

uniform sampler2D iChannel0;

// Use standard scheme (4 physical pixels per virtual texel)
#include <../common/sg_feedback_rgba8.frag>

const vec2 VSIZE = vec2(14.0, 14.0);

// Must match BufferA encoding ranges
const float POINTS_MAX = 200.0;
const float STATE_MIN = -1.0;
const float STATE_MAX =  2.0;
const float AGE_MAX   =  4.0;

float decPoints(float s) { return sg_decodeSignedToRange(s, 0.0, POINTS_MAX); }
float decState(float s) { return sg_decodeSignedToRange(s, STATE_MIN, STATE_MAX); }
float dec01(float s) { return sg_decodeSignedTo01(s); }
float decAge(float s) { return sg_decodeSignedToRange(s, 0.0, AGE_MAX); }


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
// Bricks are drawn only for x in 1..12 (see doBrick), matching Shadertoy look.
const float brickW = 2.0/14.0;
const float brickH = 1.0/15.0;

//----------------

const vec2 shadowOffset = vec2(-0.03,0.03);

//=================================================================================================
// distance functions
//=================================================================================================

float udSegment( in vec2 p, in vec2 a, in vec2 b )
{
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}

float udHorizontalSegment( in vec2 p, in float xa, in float xb, in float y )
{
    vec2 pa = p - vec2(xa,y);
    float ba = xb - xa;
    pa.x -= ba*clamp( pa.x/ba, 0.0, 1.0 );
    return length( pa );
}

float udRoundBox( in vec2 p, in vec2 c, in vec2 b, in float r )
{
  return length(max(abs(p-c)-b,0.0))-r;
}

//=================================================================================================
// utility
//=================================================================================================

float hash1( in float n )
{
    return fract(sin(n)*138.5453123);
}

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

int GetPower10(int index) {
    if (index == 0) return 1;
    if (index == 1) return 10;
    if (index == 2) return 100;
    if (index == 3) return 1000;
    if (index == 4) return 10000;
    return 1;
}

// SkSL 不稳定/不支持的位运算替代：
//  (v >> s) & 1  -> floor(v / 2^s) mod 2
int GetBit(int value, int shift) {
    float shifted = floor(float(value) / pow(2.0, float(shift)));
    return int(mod(shifted, 2.0));
}
int PrintInt( in vec2 uv, in int value )
{
    const int maxDigits = 3;
    if( abs(uv.y-0.5)<0.5 )
    {
        int iu = int(floor(uv.x));
        if( iu>=0 && iu<maxDigits )
        {
            int power = GetPower10(maxDigits-iu-1);
            float digitF = floor(float(value) / float(power));
            int n = int(mod(digitF, 10.0));
            uv.x = fract(uv.x);//(uv.x-float(iu)); 
            ivec2 p = ivec2(floor(uv*vec2(4.0,5.0)));
            int shift = p.x + p.y*4;
            return GetBit(GetFont(n), shift);
        }
    }
    return 0;
}

//=================================================================================================

float doBrick( in ivec2 id, out vec3 col, out float glo, out vec2 cen )
{
    float alp = 0.0;
    
    glo = 0.0;
    col = vec3(0.0);
    cen = vec2(0.0);
    
    if( id.x>0 && id.x<13 && id.y>=0 && id.y<12 )
    {
        vec4 brickRaw = SG_LOAD_VEC4( iChannel0, txBricks.xy + id, VSIZE );
        vec2 brickHere = vec2( dec01(brickRaw.x), decAge(brickRaw.y) );

        alp = 1.0;
        glo = 0.0;
        if( brickHere.x < 0.5 )
        {
            // brickHere.y stores age since hit
            float t = max(0.0, brickHere.y - 0.1);
            alp = exp(-2.0*t );
            glo = exp(-4.0*t );
        }
         
        if( alp>0.001 )
        {
            float fid = hash1( float(id.x*3 + id.y*16) );
            col = vec3(0.5,0.5,0.6) + 0.4*sin( fid*2.0 + 4.5 + vec3(0.0,1.0,1.0) );
            if( hash1(fid*13.1)>0.85 )
            {
                col = 1.0 - 0.9*col;
                col.xy += 0.2;
            }
        }
        
        cen = vec2( -1.0 + float(id.x)*brickW + 0.5*brickW,
                     1.0 - float(id.y)*brickH - 0.5*brickH );
    }

    return alp;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (2.0*fragCoord-iResolution.xy) / iResolution.y;
    float px = 2.0/iResolution.y;
    
    //------------------------
    // load game state
    //------------------------
    vec4  balPosVel = SG_LOAD_VEC4( iChannel0, txBallPosVel, VSIZE );
    vec2  ballPos   = balPosVel.xy;

    // 这些寄存器在 BufferA 中会把标量复制到 4 个 lane（抗线性采样串扰）。
    // 这里用平均值读取，进一步降低偶发 lane 混合导致的状态抖动。
    vec4 paddleRaw = SG_LOAD_VEC4( iChannel0, txPaddlePos, VSIZE );
    float paddlePos = dot(paddleRaw, vec4(0.25));

    vec4 pointsRaw = SG_LOAD_VEC4( iChannel0, txPoints, VSIZE );
    float points    = decPoints( dot(pointsRaw, vec4(0.25)) );

    vec4 stateRaw = SG_LOAD_VEC4( iChannel0, txState, VSIZE );
    float state     = decState( dot(stateRaw, vec4(0.25)) );
    vec4  lastHitRaw = SG_LOAD_VEC4( iChannel0, txLastHit, VSIZE );
    vec3  lastHit   = vec3( decAge(lastHitRaw.x), decAge(lastHitRaw.y), decAge(lastHitRaw.z) );

    
    //------------------------
    // draw
    //------------------------
    vec3 col = vec3(0.0);
    vec3 emi = vec3(0.0);
    
    // board
    {
        col = 0.6*vec3(0.4,0.6,0.7)*(1.0-0.4*length( uv ));
        col *= 1.0 - 0.1*smoothstep( 0.0,1.0,sin(uv.x*80.0)*sin(uv.y*80.0))*(1.0 - smoothstep( 1.0, 1.01, abs(uv.x) ) );
    }    

    // bricks
    {
        float b = brickW*0.17;

        // soft shadow
        {
            vec2 st = uv + shadowOffset;
            ivec2 id = ivec2(floor( vec2( (1.0+st.x)/brickW, (1.0-st.y)/brickH) ));

            vec3 bcol; vec2 bcen; float bglo;

            float sha = 0.0;
            for( int j=-1; j<=1; j++ )
        	for( int i=-1; i<=1; i++ )
        	{
                ivec2 idr = id + ivec2(i, j );
                float alp = doBrick( idr, bcol, bglo, bcen );
                float f = udRoundBox( st, bcen, 0.5*vec2(brickW,brickH)-b, b );
                float s = 1.0 - smoothstep( -brickH*0.5, brickH*1.0, f ); 
                s = mix( 0.0, s, alp );
                sha = max( sha, s );
            }
            col = mix( col, col*0.4, sha );
        }
    

        ivec2 id = ivec2(floor( vec2( (1.0+uv.x)/brickW, (1.0-uv.y)/brickH) ));
        
        // shape
        {
            vec3 bcol; vec2 bcen; float bglo;
            float alp = doBrick( id, bcol, bglo, bcen );
            if( alp>0.0001 )
            {
                float f = udRoundBox( uv, bcen, 0.5*vec2(brickW,brickH)-b, b );
                bglo  += 0.6*smoothstep( -4.0*px, 0.0, f );

                bcol *= 0.7 + 0.3*smoothstep( -4.0*px, -2.0*px, f );
                bcol *= 0.5 + 1.7*bglo;
                col = mix( col, bcol, alp*(1.0-smoothstep( -px, px, f )) );
            }
        }
        
        // gather glow
        for( int j=-1; j<=1; j++ )
        for( int i=-1; i<=1; i++ )
        {
            ivec2 idr = id + ivec2(i, j );
            vec3 bcol = vec3(0.0); vec2 bcen; float bglo;
            float alp = doBrick( idr, bcol, bglo, bcen );
            float f = udRoundBox( uv, bcen, 0.5*vec2(brickW,brickH)-b, b );
            emi += bcol*bglo*exp(-600.0*f*f);
        }
    }    
    
    
    // ball 
    {
        float hit = exp(-4.0*lastHit.y );

        // shadow
        float f = 1.0-smoothstep( ballRadius*0.5, ballRadius*2.0, length( uv - ballPos + shadowOffset ) );
        col = mix( col, col*0.4, f );

        // shape
        f = length( uv - ballPos ) - ballRadius;
        vec3 bcol = vec3(1.0,0.6,0.2);
        bcol *= 1.0 + 0.7*smoothstep( -3.0*px, -1.0*px, f );
        bcol *= 0.7 + 0.3*hit;
        col = mix( col, bcol, 1.0-smoothstep( 0.0, px, f ) );
        
        emi  += bcol*0.75*hit*exp(-500.0*f*f );
    }
    
    
    // paddle
    {
        float hit2 = exp(-4.0*lastHit.x );
        float hit = hit2 * sin(20.0*lastHit.x);
        float y = uv.y + 0.04*hit * (1.0-pow(abs(uv.x-paddlePos)/(paddleSize*0.5),2.0));

        // shadow
        float f = udHorizontalSegment( vec2(uv.x,y)+shadowOffset, paddlePos-paddleSize*0.5,paddlePos+paddleSize*0.5,paddlePosY );
        f = 1.0-smoothstep( paddleWidth*0.5*0.5, paddleWidth*0.5*2.0, f );
        col = mix( col, col*0.4, f );

        // shape
        f = udHorizontalSegment( vec2(uv.x,y), paddlePos-paddleSize*0.5, paddlePos+paddleSize*0.5,paddlePosY ) - paddleWidth*0.5;
        vec3 bcol = vec3(1.0,0.6,0.2);
        bcol *= 1.0 + 0.7*smoothstep( -3.0*px, -1.0*px, f );
        bcol *= 0.7 + 0.3*hit2;
        col = mix( col, bcol, 1.0-smoothstep( -px, px, f ) );
        emi  += bcol*0.75*hit2*exp( -500.0*f*f );

    }

    
    // borders
    {
        float f = abs(abs(uv.x)-1.02);
        f = min( f, udHorizontalSegment(uv,-1.0,1.0,1.0) );
        f *= 2.0;
        float a = 0.8 + 0.2*sin(2.6*iTime) + 0.1*sin(4.0*iTime);
        float hit  = exp(-4.0*lastHit.z );
        //
        a *= 1.0-0.3*hit;
        col += a*0.5*vec3(0.6,0.30,0.1)*exp(- 30.0*f*f);
        col += a*0.5*vec3(0.6,0.35,0.2)*exp(-150.0*f*f);
        col += a*1.7*vec3(0.6,0.50,0.3)*exp(-900.0*f*f);
    }
    
    // score
    {
        // Lower the HUD a bit so it doesn't touch the top border.
        float f = float(PrintInt( (uv-vec2(-1.5,0.72))*10.0, int(points) ));
        col = mix( col, vec3(1.0,1.0,1.0), f );
    }
    
    
    // add emmission
    col += emi;
    

    //------------------------
    // game over
    //------------------------
    col = mix( col, vec3(1.0,0.5,0.2), state * (0.5+0.5*sin(30.0*iTime)) );

    fragColor = vec4(col,1.0);
}

#include <../common/main_shadertoy.frag>