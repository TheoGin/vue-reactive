import { TrackOpTypes, TriggerOpTypes } from "./operations.js";

let shoudTrack = true; // 是否应该依赖收集

/**
 * 对象1：propMap
 * 对象2：propMap
 * ……
 */
const targetMap = new WeakMap();
let activeEffect = undefined;
// 
const ITERATE_KEY = Symbol('iter')

export function effect(fn) {
    function effectFn() {
        try{
            activeEffect = effectFn;
            // 每次调用前先清除之前收集的依赖，以便重新依赖收集。
            cleanup(effectFn);
            // 为啥还要return ？
            return fn(); // fn函数里面用到某个响应式数据，就会触发依赖收集
        } finally {
            // 函数可能报错，无论如何都要执行下面这行代码
            activeEffect = null;
        }
    }
    // 给effectFn加一个属性，记录哪些集合存着effectFn。即effectFn.depSet = [第一个集合，第二个集合，……]。通过这种方式重新依赖收集。
    effectFn.depSet = [] // 用来记录哪些集合存着effectFn
    effectFn();
}

// 清除之前收集的依赖
function cleanup(effectFn) {
    const {depSet} = effectFn;
    if(!depSet.length) { // 之前没有收集这个依赖，return
        return;
    }
    for (const dep of depSet) {
        // 从dep集合中去掉effectFn这个函数
        dep.delete(effectFn);
    }
    // 还要effectFn.depSet = [第一个集合，第二个集合，……]改为 effectFn.depSet = []，即设置为空
    depSet.length = 0;
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
    if(!shoudTrack || !activeEffect) { // 添加activeEffect没东西，也不需要依赖收集
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
    // if(type === TriggerOpTypes.ITERATE) { // TriggerOpTypes里面没有ITERATE！！！
    if(type === TrackOpTypes.ITERATE) {
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
    if(!depSet.has(activeEffect)) {
        depSet.add(activeEffect);
        // effectFn.depSet = [第一个集合，第二个集合，……]。通过这种方式重新依赖收集。
        activeEffect.depSet.push(depSet)
    }
    // console.log(targetMap);

    // // 如何获取？
    // console.log(activeEffect);

    // if(type === TrackOpTypes.ITERATE) {
    //     console.log(`%c依赖收集[${type}]`, 'color: #f00');
    //     return;
    // }
    // console.log(`%c依赖收集[${type}]`, 'color: #f00', key);// #f00红色
}

// 派发更新
export function trigger(target, type, key) {
    const effectFns = getEffectFns(target, type, key);
    for (const effectFn of effectFns) {
        effectFn();
    }
    // console.log(`%c派发更新[${type}]`, 'color: #00f', key); // #00f蓝色
}

// 抽离函数！！！
function getEffectFns(target, type, key){
    let propMap = targetMap.get(target);
    if(!propMap) return;

    // propMap拿到的可能是不止一种，如拿到get，可能还有iterate
    const keys = [key]; // 可能是[type, ITERATE_KEY]
    // 添加或删除属性会影响 `for (const key in state) { }` 遍历
    if(type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
        keys.push(ITERATE_KEY); // 加入iterate属性，如 ['c', Symbol(iter)]
    }

    /**
     * set --对应--> get
     * add --对应--> get, has, iterate
     * delete --对应--> get, has, iterate
     */
    const triggerTypeMap = {
        [TriggerOpTypes.SET]: [TrackOpTypes.GET],
        [TriggerOpTypes.ADD]: [TrackOpTypes.GET, TrackOpTypes.HAS, TrackOpTypes.ITERATE],
        [TriggerOpTypes.DELETE]: [TrackOpTypes.GET, TrackOpTypes.HAS, TrackOpTypes.ITERATE],
    }

    // 结果集合
    const effectFns = new Set();
    for (const k of keys) {
        let typeMap = propMap.get(k); // Map(1) {'get' => Set(1)}
        if(!typeMap) continue; // 可能有这个属性，但没有建立依赖
        
        const trackTypes = triggerTypeMap[type]; // ['get', 'has', 'iterate']
        
        for (const trackType of trackTypes) {
            const depSet = typeMap.get(trackType);
            if(!depSet) {
                continue;
            }
            for (const effectFn of depSet) {
                effectFns.add(effectFn);
            }
        }
    }

    return effectFns;
}