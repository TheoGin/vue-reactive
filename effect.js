
export function track(target, key){
    console.log(`%c依赖收集${key}`, 'color: #f00');
}

export function trigger(target, key) {
    console.log(`%c派发更新${key}`, 'color: #00f');
    
}