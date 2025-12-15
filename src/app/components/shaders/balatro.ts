export const vertexShader = /* glsl */ `#version 300 es
precision highp float;

in vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const fragmentShader = /* glsl */ `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

// ---------------- Original defines ----------------
#define SPIN_ROTATION 0.05
#define SPIN_SPEED 2.0
#define OFFSET vec2(0.0)
#define COLOUR_1 vec4(0.761,0.396,0.443, 1.0) // outer
#define COLOUR_2 vec4(0.561,0.29,0.325, 1.0) // inner
#define COLOUR_3 vec4(0.361,0.188,0.212, 1.0) // middle
#define CONTRAST 3.5
#define LIGTHING 0.4
#define SPIN_AMOUNT 0.25
#define PIXEL_FILTER 745.0
#define SPIN_EASE 1.5
#define PI 3.14159265359
#define IS_ROTATE true
// --------------------------------------------------

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    // float pixel_size = length(screenSize.xy) / PIXEL_FILTER;
    float pixel_size = 2.5;

    vec2 uv =
        (floor(screen_coords * (1.0 / pixel_size)) * pixel_size
        - 0.5 * screenSize) / length(screenSize)
        - OFFSET;

    float uv_len = length(uv);

    float speed = SPIN_ROTATION * SPIN_EASE * 0.2;
    if (IS_ROTATE) {
        speed = uTime * speed;
    }
    speed += 302.2;

    float new_pixel_angle =
        atan(uv.y, uv.x)
        + speed
        - SPIN_EASE * 20.0 *
          (SPIN_AMOUNT * uv_len + (1.0 - SPIN_AMOUNT));

    vec2 mid = (screenSize / length(screenSize)) * 0.5;

    uv = vec2(
        uv_len * cos(new_pixel_angle) + mid.x,
        uv_len * sin(new_pixel_angle) + mid.y
    ) - mid;

    uv *= 30.0;
    speed = uTime * SPIN_SPEED;

    vec2 uv2 = vec2(uv.x + uv.y);

    for (int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y)
            - sin(uv.x * 0.711 - uv.y);
    }

    float contrast_mod = (0.25 * CONTRAST + 0.5 * SPIN_AMOUNT + 1.2);
    float paint_res = clamp(length(uv) * 0.035 * contrast_mod, 0.0, 2.0);

    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);

    float light =
        (LIGTHING - 0.2) * max(c1p * 5.0 - 4.0, 0.0)
      + LIGTHING * max(c2p * 5.0 - 4.0, 0.0);

    return
        (0.3 / CONTRAST) * COLOUR_1
      + (1.0 - 0.3 / CONTRAST) *
        (COLOUR_1 * c1p
        + COLOUR_2 * c2p
        + vec4(c3p * COLOUR_3.rgb, c3p * COLOUR_1.a))
      + light;
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    outColor = effect(uResolution, fragCoord);
}
`;
