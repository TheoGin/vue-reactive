import { track, trigger, pauseTracking, resumeTracking } from "./effect.js";
import { reactive } from "./reactive.js";
import { TrackOpType, TriggerOpType } from "./operations.js";
import { hasChanged, isObject } from "./utils.js";

// const arrayInstrumentations = { // instrumentation仪器仪表
//     includes: () => {},
//     lastIndexOf: () => {},
//     indexOf: () => {},
// }
// 每个方法里面做的事情一样————》
const arrayInstrumentations = {};
const RAW = Symbol("raw"); // 要加分号！！！
["includes", "lastIndexOf", "indexOf"].forEach((key) => {
  arrayInstrumentations[key] = function (...args) {
    // this ---> Proxy
    // 1. 从代理对象中找
    const res = Array.prototype[key].apply(this, args);
    // 2. 如果找不到再从原始对象找
    if (res < 0 || res === false) {
      // lastIndexOf, lastIndexOf没找到返回-1 或者！！！ includes没找到返回false
      return Array.prototype[key].apply(this[RAW], args); // this.RAW错误写法；应该this[RAW]，会调用get，就会触发key === RAW
    }
    return res;
  };
}); // 要加分号！！！
// shift()：删除数组第一个元素
["push", "pop", "unshift", "shift", "splice"].forEach((key) => {
  arrayInstrumentations[key] = function (...args) {
    pauseTracking(); // 暂停依赖收集
    const res = Array.prototype[key].apply(this, args);
    resumeTracking(); // 恢复依赖收集
    return res;
  };
});

function get(target, key, receiver) {
  // receiver会受到一个代理对象Proxy

  // 依赖收集
  track(target, TrackOpType.GET, key);

  if (key === RAW) {
    return target;
  }

  // if(key === 'includes' || key === 'lastIndexOf' || key === 'indexOf') { // 可改写为arrayInstrumentations.hasOwnProperty(key)
  // 改写的方法有我们重写的，并且target是数组 ---> 返回我们改写的方法
  if (arrayInstrumentations.hasOwnProperty(key) && Array.isArray(target)) {
    return arrayInstrumentations[key]; // arrayInstrumentations[key]是改动之后的方法
  }

  // Reflect.get ( target, propertyKey [ , receiver ] )。Receiver is used as the this value
  // 通过receiver改变this指向为代理对象
  const result = Reflect.get(target, key, receiver); // 不要用target[key]，而用 Reflect.get ，因为 Reflect.get 是底层操作，不会重新触发 Proxy 拦截。
  if (isObject(result)) {
    // key是对象（嵌套对象），再递归调reactive
    // 不能写成isObject(key)，这样写key是string类型，就不可能是对象
    return reactive(result); // 要return？
  }
  return result; // 返回对象的相应属性值
}

function set(target, key, value, receiver) {
  // 拿旧值
  const oldValue = target[key];

  // 判断类型
  const type = target.hasOwnProperty(key)
    ? TriggerOpType.SET
    : TriggerOpType.ADD;

  const oldLen = Array.isArray(target) ? target.length : undefined;

  // proxy里面的set需要返回一个boolean值，表示 赋值成功true | 赋值失败 --->
  const result = Reflect.set(target, key, value, receiver); // 设置对象的相应属性值。相当于target[key] = value，但反射赋值会返回一个boolean值

  // newLen不写在这，因为result赋值失败就没必要拿newLen
  // const newLen = Array.isArray(target)? target.length : undefined;

  // if(!hasChanged(oldValue, value)) { // ???
  // 不能简单地把 if(!result) 替换为 if(!hasChanged(oldValue, value))，因为它们服务于不同的目的，正确的做法是保留结果检查，并合理加入值变化判断作为优化。
  if (!result) {
    // 表示如果赋值失败，直接返回，不触发后续更新
    return result;
  }
  const newLen = Array.isArray(target) ? target.length : undefined;
  if (hasChanged(oldValue, value) || type === TriggerOpType.ADD) {
    // 派发更新
    trigger(target, type, key);
    // 设置的不是length属性 派发更新后需要做的事情
    // 1. target是一个数组
    // 2. length前后值不一样
    if (Array.isArray(target) && oldLen !== newLen) {
      if (key !== "length") {
        // 3. 设置的不是length属性
        // ————》手动触发length
        trigger(target, TriggerOpType.SET, "length");
      } else {
        // 设置是length属性
        // length变小，手动触发delete
        for (let i = newLen; i < oldLen; i++) {
          trigger(target, TriggerOpType.DELETE, i.toString()); // i.toString() 保持key都是字符串
        }
      }
    }
  }
  return result;
}
// 遍历
function ownKeys(target) {
  // Reflect.ownKeys(target)只有一个参数
  // 依赖收集
  track(target, TrackOpType.ITERATE);
  return Reflect.ownKeys(target);
}

function has(target, key) {
  // 依赖收集
  track(target, TrackOpType.HAS, key);
  return Reflect.has(target, key);
}

function deleteProperty(target, key) {
  const hadKey = target.hasOwnProperty(key); // 注意顺序问题，不能写在Reflect.deleteProperty(target, key)下面，因为这行代码会执行删除，删除完就不存在了！！！
  const result = Reflect.deleteProperty(target, key);
  if (hadKey && result) {
    // 原有有这个属性，并且删除成功
    // 派发更新
    trigger(target, TriggerOpType.DELETE, key);
  }
  return result;
}

export const handlers = {
  get,
  set,
  has,
  ownKeys, // 遍历
  deleteProperty,
};
