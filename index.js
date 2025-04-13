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

// 2-7. 嵌套对象找，数组中明明有obj，但却返回-1，因为state[1]是：Proxy(Object) {}代理对象；而obj是： {}原始对象。 ---> 从代理对象中找，如果找不到再从原始对象找（改写查找方法的this）
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
   * -1
   */
}

fn();
