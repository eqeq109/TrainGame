Shader "Custom/Shader_Train"
{
    Properties
    {
        _MainColor ("Body Color", Color) = (1,1,1,1)
        _SubColor ("Wheel Color", Color) = (1,1,1,1)
        _Alpha ("Alpha", Range(0,1)) = 1
        _MainTex ("Albedo (RGB)", 2D) = "white" {}
        _MaskMap ("Mask Texture", 2D) = "white" {}
        //_Glossiness ("Smoothness", Range(0,1)) = 0.5
        //_Metallic ("Metallic", Range(0,1)) = 0.0
    }
    SubShader
    {
        Tags { "RenderType"="Transparent" "Queue" = "Transparent" }
        
        // Extra Pass Start
        zwrite on
        ColorMask 0
        CGPROGRAM

        #pragma surface surf _NoLit nolight keepalpha noambient noforwardadd nolightmap novertexlights noshadow

        struct Input
        {
            float2 color:COLOR;
        };

        void surf (Input IN, inout SurfaceOutput o)
        {
        }
        float4 Lighting_NoLit(SurfaceOutput s, float3 lightDir, float atten)
        {
            return 0;
        }
        ENDCG
        // Extra Pass End


        zwrite off
        CGPROGRAM
        // Physically based Standard lighting model, and enable shadows on all light types
        #pragma surface surf Standard alpha:blend

        // Use shader model 3.0 target, to get nicer looking lighting
        #pragma target 3.0

        sampler2D _MainTex;
        sampler2D _MaskMap;

        struct Input
        {
            float2 uv_MainTex;
            float2 uv_MaskMap;
        };

        fixed4 _MainColor;
        fixed4 _SubColor;
        fixed _Alpha;
        //half _Glossiness;
        //half _Metallic;

        // // Add instancing support for this shader. You need to check 'Enable Instancing' on materials that use the shader.
        // // See https://docs.unity3d.com/Manual/GPUInstancing.html for more information about instancing.
        // // #pragma instancing_options assumeuniformscaling
        // UNITY_INSTANCING_BUFFER_START(Props)
        //     // put more per-instance properties here
        // UNITY_INSTANCING_BUFFER_END(Props)

        void surf (Input IN, inout SurfaceOutputStandard o)
        {
            fixed4 mask = tex2D(_MaskMap, IN.uv_MaskMap);

            fixed rMask = mask.r; // body part of train
            fixed bMask = mask.b; // wheel part of train

            // Albedo comes from a texture tinted by color
            fixed4 c = tex2D (_MainTex, IN.uv_MainTex) * _MainColor;
            
            c.rgb = lerp(c.rgb, _SubColor, bMask);

            o.Albedo = c.rgb;

            // Metallic and smoothness come from slider variables
            //o.Metallic = _Metallic;
            //o.Smoothness = _Glossiness;
            o.Alpha = _Alpha;
        }
        ENDCG
    }
    FallBack "Diffuse"
}
