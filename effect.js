import { TrackOpType } from "./operations.js";

let shoudTrack = true; // 是否应该依赖收集

/**
 * 对象1：propMap
 * 对象2：propMap
 * ……
 */
const targetMap = new WeakMap();
let activateEffect = null;

export function effect(fn) {
    function effectFn() {
        activateEffect = effectFn;
        fn(); // fn函数里面用到某个响应式数据，就会触发依赖收集
        activateEffect = null;
    }
    effectFn();
}

// 暂停依赖收集
export function pauseTracking() {
    shoudTrack = false;
}

// 恢复依赖收集
export function resumeTracking() {
    shoudTrack = true;
}

// 依赖收集
export function track(target, type, key){
    if(!shoudTrack) { 
        // 不依赖收集
        return;
    }
    // 收集
    console.log(activateEffect);

    if(type === TrackOpType.ITERATE) {
        console.log(`%c依赖收集[${type}]`, 'color: #f00');
        return;
    }
    console.log(`%c依赖收集[${type}]`, 'color: #f00', key);// #f00红色
}

// 派发更新
export function trigger(target, type, key) {
    console.log(`%c派发更新[${type}]`, 'color: #00f', key); // #00f蓝色
}