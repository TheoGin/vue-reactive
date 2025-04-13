
// 判断value是否为对象
export function isObject(value) {
    return typeof value === 'object' && value !== null
}

// 判断两个值是否有变化
export function hasChanged(oldValue, newValue) {
    /** Object.is() 确定两个值是否为相同值。
     * 0 === -0 // true
     * Object.is(0, -0) // false
     * 
     * NaN === NaN // false 
     * Object.is(NaN, NaN) // true
     */
    return !Object.is(oldValue, newValue); // 是相同就没有变化 ——》要取反
}