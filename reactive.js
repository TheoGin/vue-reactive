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

import { track, trigger } from './effect.js'

export function reactive(target) {
    return new Proxy(target, {
        get(target, key){
            // 依赖收集
            track(target, key);
            return target[key]; // 返回对象的相应属性值
        },
        set(target, key, value){
            // 派发更新
            trigger(target, key);
            // proxy里面的set需要返回一个boolean值，表示 赋值成功true | 赋值失败 ---> 
            return Reflect.set(target, key, value); // 设置对象的相应属性值。相当于target[key] = value，但反射赋值会返回一个boolean值
        },
    })
}