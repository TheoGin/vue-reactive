import { track, trigger } from "./effect.js";
import { reactive } from "./reactive.js";
import { TrackOpType, TriggerOpType } from "./OpType.js";
import { hasChanged, isObject } from "./utils.js";

export const handlers = {
    get(target, key, receiver){ // receiver会受到一个代理对象Proxy
        // 依赖收集
        track(target, TrackOpType.GET, key);

        const value = target[key]; // 不能用Reflect.get(target, key, receiver)，不然又会代理？？
        if(isObject(value)) { // key是对象（嵌套对象），再递归调reactive
            // 不能写成isObject(key)，这样写key是string类型，就不可能是对象
            return reactive(value); // 要return？
        }
        // Reflect.get ( target, propertyKey [ , receiver ] )。Receiver is used as the this value
        // 通过receiver改变this指向为代理对象
        return Reflect.get(target, key, receiver); // 返回对象的相应属性值
    },
    set(target, key, value, receiver){
        // 拿旧值
        const oldValue = target[key];

        // 判断类型
        const type = target.hasOwnProperty(key) ? TriggerOpType.SET : TriggerOpType.ADD;

        // proxy里面的set需要返回一个boolean值，表示 赋值成功true | 赋值失败 ---> 
        const result = Reflect.set(target, key, value, receiver); // 设置对象的相应属性值。相当于target[key] = value，但反射赋值会返回一个boolean值
        if(!hasChanged(oldValue, value)) { // ???
            return result;
        }
        if(hasChanged(oldValue, value) && type === TriggerOpType.SET) {
            // 派发更新
            trigger(target, TriggerOpType.SET, key);
            return result;
        }
        // 派发更新
        trigger(target, TriggerOpType.ADD, key);
        return result;
    },
    has(target, key) {
        // 依赖收集
        track(target, TrackOpType.HAS, key)
        return Reflect.has(target, key)
    },
    // 遍历
    ownKeys(target) { // Reflect.ownKeys(target)只有一个参数
        console.log('ownKeys');
        
        // 依赖收集
        track(target, TrackOpType.ITERATE);
        return Reflect.ownKeys(target);
    },
    deleteProperty(target, key) {
        const hasProperty = target.hasOwnProperty(key); // 注意顺序问题，不能写在Reflect.deleteProperty(target, key)下面，因为这行代码会执行删除，删除完就不存在了！！！
        const result = Reflect.deleteProperty(target, key);
        if(hasProperty && result) { // 原有有这个属性，并且删除成功
            // 派发更新
            trigger(target, TriggerOpType.DELETE, key)
        }
        return result;
    }
}