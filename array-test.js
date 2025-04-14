import { reactive } from "./reactive.js";

// 【数组】
// const arr = [1, 2, 3];
// const state = reactive(arr);

// 1. 监听：对象——>代理（数组和对象一样）
// 2. 读信息：依赖收集
// // 2-1. 通过下标读
// function fn() {
//   state[0] // 0就是键key ---> 依赖收集[get]0
// }

// // 2-2. 通过for循环遍历读
// function fn() {
//   for(let i = 0; i < state.length; i++) {
//     state[i]
//   }
//   /**
//    * 依赖收集[get]length
//    * 依赖收集[get]0
//    * 依赖收集[get]length
//    * 依赖收集[get]1
//    * 依赖收集[get]length
//    * 依赖收集[get]2
//    * 依赖收集[get]length
//    */
// }

// // 2-3. 通过for-of遍历读，会出现Uncaught TypeError: Cannot convert a Symbol value to a string. 因为for-of的键是：Symbol(Symbol.iterator)，通过迭代器遍历。 console.log(`%c依赖收集[${type}]${key}`, 'color: #f00');改为 ---> console.log(`%c依赖收集[${type}]`, 'color: #f00', key);
// function fn() {
//   for(const i of state) {
//     i
//   }
//   /**
//    * 依赖收集[get] Symbol(Symbol.iterator)
//    * 依赖收集[get] length
//    * 依赖收集[get] 0
//    * 依赖收集[get] length
//    * 依赖收集[get] 1
//    * 依赖收集[get] length
//    * 依赖收集[get] 2
//    * 依赖收集[get] length
//    */
// }

// // 2-4. 通过includes(searchElement) 方法用来判断一个数组是否包含一个指定的值
// function fn() {
//   console.log(state.includes(2)); // 2是searchElement
//   /**
//    * 依赖收集[get] includes
//    * 依赖收集[get] length
//    * 依赖收集[get] 0
//    * 依赖收集[get] 1
//    * true
//    */
// }

// // 2-5. 通过lastIndexOf(searchElement) 方法返回数组中给定元素最后一次出现的索引，如果不存在则返回 -1。
// const arr = [1, 2, , ,]; // 稀疏数组
// const state = reactive(arr);
// function fn() {
//   console.log(state.lastIndexOf(5));
//   /**
//    * 依赖收集[get] lastIndexOf
//    * 依赖收集[get] length
//    * 依赖收集[has] 3
//    * 依赖收集[has] 2
//    * 依赖收集[has] 1
//    * 依赖收集[get] 1
//    * 依赖收集[has] 0
//    * 依赖收集[get] 0
//    * -1
//    */
// }

// // 2-6. 通过indexOf(searchElement) 方法返回数组中第一次出现给定元素的下标，如果不存在则返回 -1。
// const arr = [1, 2, 3]; 
// const state = reactive(arr);
// function fn() {
//   console.log(state.indexOf(2));
//   /**
//    * 依赖收集[get] indexOf
//    * 依赖收集[get] length
//    * 依赖收集[has] 0
//    * 依赖收集[get] 0
//    * 依赖收集[has] 1
//    * 依赖收集[get] 1
//    * 1
//    */
// }

// 2-7. 嵌套对象找，数组中明明有obj，但却返回-1，因为state[1]是：Proxy(Object) {}代理对象；而obj是： {}原始对象。 ---> 从代理对象中找，如果找不到再从原始对象找（改写查找方法的this）【第二种方法：传入的原始对象转换为代理对象】
const obj = {}
const arr = [1, obj, 3];
const state = reactive(arr);
function fn() {
  // console.log(state[1], obj); // Proxy(Object) {} {}
  console.log(state.indexOf(obj));
  /**
   * 依赖收集[get] indexOf
   * 依赖收集[get] length
   * 依赖收集[has] 0
   * 依赖收集[get] 0
   * 依赖收集[has] 1
   * 依赖收集[get] 1
   * 依赖收集[has] 2
   * 依赖收集[get] 2
   * -1   有问题，应为1
   */
}

// 3. 写信息：派发更新
// // 3-1. 通过下标更改state[0] = 5已有值的值————> set
// const arr = [1, 2, 3];
// const state = reactive(arr);
// function fn() {
//   state[0] = 5 // 派发更新[set] 0
// }

// // 3-2. 通过下标更改state[0] = 5原来是undefined的值————> add
// const arr = [, 2, 3];
// const state = reactive(arr);
// function fn() {
//   state[0] = 5 // 派发更新[add] 0
// }

// // 3-3. 通过 index ≥ length 改变数组
// const arr = [1, 2, 3];
// const state = reactive(arr);
// function fn() {
//   state[5] = 8 // 派发更新[add] 5。有问题，长度变为6，但却没有触发派发更新[set] length————》手动触发length
//   /**
//     k. If index ≥ length, then
//     i. Set lengthDesc.[[Value]] to index + 1𝔽.
//     ii. Set succeeded to ! OrdinaryDefineOwnProperty(A, "length", lengthDesc).
//    */
// }

// // 3-4. 通过 length变大 改变数组
// const arr = [1, 2, 3, 4, 5, 6];
// const state = reactive(arr);
// function fn() {
//   state.length = 8 // 派发更新[set] length
//   console.log(state);
// }

// // 3-5. 通过 length变小 改变数组
// const arr = [1, 2, 3, 4, 5, 6];
// const state = reactive(arr);
// function fn() {
//   state.length = 3 // 派发更新[set] length. 有问题，没有触发delete ---> 手动触发delete
//   console.log(state);
//   /**
//    * 派发更新[set] length
//    * 派发更新[delete] 3
//    * 派发更新[delete] 4
//    * 派发更新[delete] 5
//    */
// }

// // 3-6.1. 通过 push 改变数组
// const arr = [1, 2, 3, 4, 5, 6];
// const state = reactive(arr);
// function fn() {
//   state.push(7) // 有问题，不应该触发：依赖收集[get] length ---> 遇到 length 暂停依赖收集，过了 length 恢复依赖收集
//   console.log(state);
//   /**
//    * 依赖收集[get] push
//    * 依赖收集[get] length   不应该触发
//    * 派发更新[add] 6
//    * 派发更新[set] length
//    * Proxy(Array) {0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7}
//    */
// }

// // 3-6.2. 通过 "pop", "unshift", "shift", "splice" 和push类似 改变数组
// const arr = [1, 2, 3, 4, 5, 6];
// const state = reactive(arr);
// function fn() {
//   // state.pop() // 删除数组最后一个元素
//   // state.shift() // 删除数组第一个元素
//   // state.unshift(11) // 向数组开头添加元素11
//   // console.log(state.splice(1)); // splice(start) 从下标1开始删除，一直到最后，state剩下：Proxy(Array) {0: 1}
//   console.log(state.splice(1, 3)); // splice(start, deleteCount) 从下标1开始删除，删3个，state剩下：Proxy(Array) {0: 1, 1: 5, 2: 6}
//   console.log(state);
// }

fn();
