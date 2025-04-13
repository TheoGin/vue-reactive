import { track, trigger } from "./effect.js";
import { reactive } from "./reactive.js";
import { TrackOpType, TriggerOpType } from "./operations.js";
import { hasChanged, isObject } from "./utils.js";

function get(target, key, receiver){ // receiver会受到一个代理对象Proxy
    // 依赖收集
    track(target, TrackOpType.GET, key);

    // Reflect.get ( target, propertyKey [ , receiver ] )。Receiver is used as the this value
    // 通过receiver改变this指向为代理对象
    const result = Reflect.get(target, key, receiver); // 不要用target[key]，而用 Reflect.get ，因为 Reflect.get 是底层操作，不会重新触发 Proxy 拦截。
    if(isObject(result)) { // key是对象（嵌套对象），再递归调reactive
        // 不能写成isObject(key)，这样写key是string类型，就不可能是对象
        return reactive(result); // 要return？
    }
    return result; // 返回对象的相应属性值
}

function set(target, key, value, receiver){
    // 拿旧值
    const oldValue = target[key];

    // 判断类型
    const type = target.hasOwnProperty(key) ? TriggerOpType.SET : TriggerOpType.ADD;

    // proxy里面的set需要返回一个boolean值，表示 赋值成功true | 赋值失败 ---> 
    const result = Reflect.set(target, key, value, receiver); // 设置对象的相应属性值。相当于target[key] = value，但反射赋值会返回一个boolean值
    
    // if(!hasChanged(oldValue, value)) { // ???
    // 不能简单地把 if(!result) 替换为 if(!hasChanged(oldValue, value))，因为它们服务于不同的目的，正确的做法是保留结果检查，并合理加入值变化判断作为优化。
    if(!result) { // 表示如果赋值失败，直接返回，不触发后续更新
        return result;
    }
    if(hasChanged(oldValue, value) || type === TriggerOpType.ADD) {
        // 派发更新
        trigger(target, type, key);
    }
    return result;
}
// 遍历
function ownKeys(target) { // Reflect.ownKeys(target)只有一个参数
    // 依赖收集
    track(target, TrackOpType.ITERATE);
    return Reflect.ownKeys(target);
}

function has(target, key) {
    // 依赖收集
    track(target, TrackOpType.HAS, key)
    return Reflect.has(target, key)
}

function deleteProperty(target, key) {
    const hadKey = target.hasOwnProperty(key); // 注意顺序问题，不能写在Reflect.deleteProperty(target, key)下面，因为这行代码会执行删除，删除完就不存在了！！！
    const result = Reflect.deleteProperty(target, key);
    if(hadKey && result) { // 原有有这个属性，并且删除成功
        // 派发更新
        trigger(target, TriggerOpType.DELETE, key)
    }
    return result;
}

export const handlers = {
    get,
    set,
    has,
    ownKeys, // 遍历
    deleteProperty,
}