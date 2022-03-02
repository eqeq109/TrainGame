export type TEasing = (time: number) => number;

export type TEasingTwoParam = (start: number, end: number, time: number) => number;

export interface IEasingMap {
    linear: TEasing;
    quadratic: TEasing;
    cubic: TEasing;
    elastic: TEasing;
    inQuad: TEasing;
    outQuad: TEasing;
    inOutQuad: TEasing;
    inCubic: TEasing;
    outCubic: TEasing;
    inOutCubic: TEasing;
    inQuart: TEasing;
    outQuart: TEasing;
    inOutQuart: TEasing;
    inQuint: TEasing;
    outQuint: TEasing;
    inOutQuint: TEasing;
    inSine: TEasing;
    outSine: TEasing;
    inOutSine: TEasing;
    inExpo: TEasing;
    outExpo: TEasing;
    inOutExpo: TEasing;
    inCirc: TEasing;
    inCirc2: TEasingTwoParam;
    outCirc: TEasing;
    inOutCirc: TEasing;
    inBounce: TEasingTwoParam;
    outBounce: TEasingTwoParam;
    inOutBounce: TEasingTwoParam;
}

export const easing: IEasingMap = {
    // No easing, no acceleration
    linear: (t) => t,

    // Accelerates fast, then slows quickly towards end.
    quadratic: (t) => t * (-(t * t) * t + 4 * t * t - 6 * t + 4),

    // Overshoots over 1 and then returns to 1 towards end.
    cubic: (t) => t * (4 * t * t - 9 * t + 6),

    // Overshoots over 1 multiple times - wiggles around 1.
    elastic: (t) => t * (33 * t * t * t * t - 106 * t * t * t + 126 * t * t - 67 * t + 15),

    // Accelerating from zero velocity
    inQuad: (t) => t * t,

    // Decelerating to zero velocity
    outQuad: (t) => t * (2 - t),

    // Acceleration until halfway, then deceleration
    inOutQuad: (t) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

    // Accelerating from zero velocity
    inCubic: (t) => t * t * t,

    // Decelerating to zero velocity
    outCubic: (t) => (--t) * t * t + 1,

    // Acceleration until halfway, then deceleration
    inOutCubic: (t) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

    // Accelerating from zero velocity
    inQuart: (t) => t * t * t * t,

    // Decelerating to zero velocity
    outQuart: (t) => 1 - (--t) * t * t * t,

    // Acceleration until halfway, then deceleration
    inOutQuart: (t) => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

    // Accelerating from zero velocity
    inQuint: (t) => t * t * t * t * t,

    // Decelerating to zero velocity
    outQuint: (t) => 1 + (--t) * t * t * t * t,

    // Acceleration until halfway, then deceleration
    inOutQuint: (t) => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,

    // Accelerating from zero velocity
    inSine: (t) => -Math.cos(t * (Math.PI / 2)) + 1,

    // Decelerating to zero velocity
    outSine: (t) => Math.sin(t * (Math.PI / 2)),

    // Accelerating until halfway, then decelerating
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

    // Exponential accelerating from zero velocity
    inExpo: (t) => Math.pow(2, 10 * (t - 1)),

    // Exponential decelerating to zero velocity
    outExpo: (t) => -Math.pow(2, -10 * t) + 1,

    // Exponential accelerating until halfway, then decelerating
    inOutExpo: (t) => {
        t /= .5;
        if (t < 1) return Math.pow(2, 10 * (t - 1)) / 2;
        t--;
        return (-Math.pow(2, -10 * t) + 2) / 2;
    },

    // Circular accelerating from zero velocity
    inCirc: (t) => -Math.sqrt(1 - t * t) + 1,

    inCirc2: (s: number, e: number, t: number) => {
        e -= s;
        return -e * (Math.sqrt(1 - t * t) - 1) + s;
    },

    inBounce:  (start: number, end: number, value: number) => 
    {
        end -= start;
        let d: number = 1;
        return end - easing.outBounce(0, end, d - value) + start;
    },

    outBounce: (start: number, end: number, value: number) => 
    {
        value /= 1;
        end -= start;
        if (value < (1 / 2.75))
        {
            return end * (7.5625 * value * value) + start;
        }
        else if (value < (2 / 2.75))
        {
            value -= (1.5 / 2.75);
            return end * (7.5625 * (value) * value + 0.75) + start;
        }
        else if (value < (2.5 / 2.75))
        {
            value -= (2.25 / 2.75);
            return end * (7.5625 * (value) * value + 0.9375) + start;
        }
        else
        {
            value -= (2.625 / 2.75);
            return end * (7.5625 * (value) * value + 0.984375) + start;
        }
    }, 
    
    inOutBounce: (start: number, end: number, value: number) => {
        end -= start;
        let d: number = 1;
        if (value < d * 0.5) return easing.inBounce(0, end, value * 2) * 0.5 + start;
        else return easing.outBounce(0, end, value * 2 - d) * 0.5 + end * 0.5 + start;
    },

    // Circular decelerating to zero velocity Moves VERY fast at the beginning and
    // then quickly slows down in the middle. This tween can actually be used
    // in continuous transitions where target value changes all the time,
    // because of the very quick start, it hides the jitter between target value changes.
    outCirc: (t) => Math.sqrt(1 - (t = t - 1) * t),
    


    // Circular acceleration until halfway, then deceleration
    inOutCirc: (t) => {
        t /= .5;
        if (t < 1) return -(Math.sqrt(1 - t * t) - 1) / 2;
        t -= 2;
        return (Math.sqrt(1 - t * t) + 1) / 2;
    }
};