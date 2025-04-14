import { TrackOpType, TriggerOpType } from "./operations.js";

let shoudTrack = true; // 是否应该依赖收集

/**
 * 对象1：propMap
 * 对象2：propMap
 * ……
 */
const targetMap = new WeakMap();
let activateEffect = undefined;
// 
const ITERATE_KEY = Symbol('iter')

export function effect(fn) {
    function effectFn() {
        try{
            activateEffect = effectFn;
            // 为啥还要return ？
            return fn(); // fn函数里面用到某个响应式数据，就会触发依赖收集
        } finally {
            // 函数可能报错，无论如何都要执行下面这行代码
            activateEffect = null;
        }
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
    if(!shoudTrack || !activateEffect) { // 添加activateEffect没东西，也不需要依赖收集
        // 不依赖收集
        return;
    }
    // 建立对应关系
    let propMap = targetMap.get(target);
    if(!propMap) {
        propMap = new Map();
        targetMap.set(target, propMap);
    }
    // 特殊情况：迭代没有属性，用Symbol造一个，如 iter
    if(type === TriggerOpType.ITERATE) {
        // target.ITERATE_KEY 错误写法
        key = ITERATE_KEY;
    }
    let typeMap = propMap.get(key);
    if(!typeMap) {
        typeMap = new Map();
        propMap.set(key, typeMap)
    }
    let depSet = typeMap.get(type);
    if(!depSet) {
        depSet = new Set();
        typeMap.set(type, depSet)
    }
    if(!depSet.has(activateEffect)) {
        depSet.add(activateEffect);
    }
    console.log(targetMap);
    

    // // 如何获取？
    // console.log(activateEffect);

    // if(type === TrackOpType.ITERATE) {
    //     console.log(`%c依赖收集[${type}]`, 'color: #f00');
    //     return;
    // }
    // console.log(`%c依赖收集[${type}]`, 'color: #f00', key);// #f00红色
}

// 派发更新
export function trigger(target, type, key) {
    // 抽离函数
    let propMap = targetMap.get(target);
    if(!propMap) return;
    let typeMap = propMap.get(key);
    if(!typeMap) return;
    let depSet = undefined;
    if(type === TriggerOpType.SET) {
        depSet = typeMap.get(TrackOpType.GET);
    }
    if(!depSet) return;
    // 找到对应函数，依次运行
    for(const depFn in depSet.values()) {
        depFn()
    }

    // console.log(`%c派发更新[${type}]`, 'color: #00f', key); // #00f蓝色
}