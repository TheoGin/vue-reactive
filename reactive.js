// let data1 = true, data2, data3;

// tag(data2);

// function fn(){
//     // ...
//     if(data1) {
//         data2;
//     } else {
//         data3;
//     }
//     // ...
// }

// data2: fn;

// // --->
// const proxy = reactive(data2);

import { handlers } from './handlers.js';
import { isObject } from './utils.js';

// 用WeakMap缓存，因为WeakMap是弱引用，只要它们没有其他的引用存在，会进行垃圾回收。
const targetMap = new WeakMap(); 
export function reactive(target) {
    // 传的不是对象，直接返回 值
    if(!isObject(target)) {
        return target;
    }
    if(targetMap.has(target)) {
        return targetMap.get(target);// 如果已经代理过了，直接返回
    }
    // 代码臃肿——》抽离handlers模块
    const proxy = new Proxy(target, handlers)
    targetMap.set(target, proxy)
    return proxy;
}