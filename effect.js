import { TrackOpType } from "./operations.js";

let shoudTracking = true;
export function pauseTracking() {
    shoudTracking = false;
}
export function resumeTracking() {
    shoudTracking = true;
}

// 依赖收集
export function track(target, type, key){
    if(!shoudTracking) { 
        // 不依赖收集
        return;
    }
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