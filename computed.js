import { effect } from "./effect.js";

// 参数归一化————> 统一处理成对象
function normalizeParameter(getterOrOptions) {
    if(typeof getterOrOptions === 'function') {
        getterOrOptions.getter = getterOrOptions;
        // 加上setter
        getterOrOptions.setter = function() {
            console.log('warn: not assign set');
        }
    } else {
        getterOrOptions.getter = getterOrOptions.get;
        getterOrOptions.setter = getterOrOptions.set;
    }
    return getterOrOptions;
}

export function computed(getterOrOptions) {
    // getterOrOptions传的参数可能是一个函数 | 对象（包含getter和setter）————> 统一处理成对象
    const { getter, setter} =  normalizeParameter(getterOrOptions);
    effect(getter);
    console.log(getter, setter);
    
    const obj = {
        get value() {
            return getter();
        }
    }

    return obj;
}