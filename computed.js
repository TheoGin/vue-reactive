import { effect, track, trigger } from "./effect.js";
import { TrackOpTypes, TriggerOpTypes } from "./operations.js";

// 参数归一化————> 统一处理成对象
function normalizeParameter(getterOrOptions) {
    let getter, setter;
    if(typeof getterOrOptions === 'function') {
        getter = getterOrOptions;
        // 加上setter
        setter = function() {
            console.warn('Computed property was assigned to but it has no setter.');
        }
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    return {getter, setter};
}

export function computed(getterOrOptions) {
    // getterOrOptions传的参数可能是一个函数 | 对象（包含getter和setter）————> 统一处理成对象
    const { getter, setter} =  normalizeParameter(getterOrOptions);
    let value, dirty = true;
    const effectFn =  effect(getter, {
        lazy: true, //  没有访问sum.value就不会执行computed
        scheduler() {
            dirty = true;
            trigger(obj, TriggerOpTypes.SET, 'value') // obj不能写this！！！
            // effectFn(); // 没有用到sum.value，期待没有输出，但输出了。 ————> 把effect配置项`scheduler() { dirty = true;   effectFn(); }`改为`scheduler() { dirty = true;}` 即去掉 effectFn(); 
        }
    });
    // console.log(getter, setter);
    
    const obj = {
        get value() {
            track(obj, TrackOpTypes.GET, 'value');
            if(dirty) { // computed是有缓存的 ————> dirty = true，当脏的时候，才重新value = effectFn()
                value = effectFn();
                dirty = false;
            }
            return value;
            // return effectFn();
        },
        set value(newValue){
            // trigger(this, TriggerOpTypes.SET, 'value') 不能放这里，要放scheduler()里面
            setter(newValue);
        }
    }

    return obj;
}