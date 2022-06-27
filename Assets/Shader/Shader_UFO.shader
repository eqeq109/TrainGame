Shader "Custom/Shader_UFO"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)
        _MainTex ("Albedo (RGB)", 2D) = "white" {}
        _SubTex ("Ray Fx", 2D) = "White" {}
        _RayFxAlpha ("Ray Fx Alpha",  Range(0, 1)) = 0
        [Space]
        _Alpha ("Alpha", Range(0, 1)) = 1
        _Spread ("Ray Spread", Range(0,1)) = 0
    }
    SubShader
    {
        Tags { "RenderType"="Transparent" "Queue"="Transparent+1" } //

        ZWrite off

        CGPROGRAM
        #pragma surface surf Standard alpha:blend noambient noforwardadd nolightmap novertexlights noshadow

        // Use shader model 3.0 target, to get nicer looking lighting
        #pragma target 3.0

        sampler2D _MainTex;
        sampler2D _SubTex;

        struct Input
        {
            float2 uv_MainTex;
            float2 uv_SubTex;
        };

        fixed4 _Color;
        fixed _Alpha;
        fixed _RayFxAlpha;
        float _Spread;

        UNITY_INSTANCING_BUFFER_START(Props)
        UNITY_INSTANCING_BUFFER_END(Props)

        void surf (Input IN, inout SurfaceOutputStandard o)
        {
            fixed4 c = tex2D (_MainTex, IN.uv_MainTex);
            fixed4 fxColor = tex2D (_SubTex, IN.uv_SubTex);
            //o.Albedo = c.rgb;
            o.Emission = lerp(c.rgb, c.rgb + fxColor.rgb * fxColor.a, _RayFxAlpha) * _Color;

            o.Alpha = smoothstep(0 + _Spread, 1, c.a * _Alpha);
        }
        ENDCG
    }
    FallBack "Diffuse"
}
