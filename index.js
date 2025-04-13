import { reactive } from "./reactive.js";

const obj = {
  a: 0,
  b: 2,
  // // 为什么this指向代理对象才能收集到a和b?
  // get c() {
  //   console.log(this); // this指向是obj，应为代理对象才能收集到a和b
  //   // this ---> Proxy(Object) {a: 0, b: 2, d: {…}}
  //   return this.a + this.b;
  // },
  // d: {
  //   e: 3,
  //   f: {
  //     g: 4
  //   }
  // }
};

// state.a = 3;
// state.a++;

// 1. 监听：对象——>代理
// // 1-1. 传的不是对象
// const state = reactive(123);
// console.log(state);

// // 1-2. 传的是同一个对象，state1 === state2 false，应为true ——> WeakMap
// const state1 = reactive(obj);
// const state2 = reactive(obj);
// console.log(state1 === state2);

// // 2. 读信息：依赖收集
// const state = reactive(obj);
// // 2-1. get c() {   return this.a + this.b; }，依赖收集只有c，依赖收集应为a, b, c ——> Reflect.get ( target, propertyKey [ , receiver ] )，通过receiver改变this指向为代理对象
// function fn() {
//   state.c
// }

// // 2-2. d: {    e: 3  } 依赖收集只有d，依赖收集应为d, e，嵌套对象也需要代理 ——> 递归
// const state = reactive(obj);
// function fn() {
//   state.d.e;
//   state.d.f.g;
// }

// // 2-3. "k" in obj 没有依赖收集；一开始没有某个属性，后面有某个属性，会影响函数的结果，所以也应该收集依赖
// /* in --内部方法--> [[HasProperty]]
// 【Internal Method】 【Proxy Handler Method】
//  [[HasProperty]]           has
// */
// const state = reactive(obj);
// function fn() {
//   "k" in state;
// }
// fn();
// state.k = 111;

// // 2-4. for(const key in state) { } | Object.keys(state) 没有依赖收集；一开始不存在，后面存在，会影响函数的结果，所以也应该收集依赖
// const state = reactive(obj);
// function fn() {
//   for(const key in state) { }
//   Object.keys(state)
// }

// 3. 写信息：派发更新
// // 3-1. 原有有这个属性——>修改；原来没有这个属性——>添加
// const state = reactive(obj);
// function fn() {
//   state.abc = 11
//   state.a = 11
// }

// // 3-2. 删除一个不存在的属性，不应该派发更新
// const state = reactive(obj);
// function fn() {
//   delete state.abc
//   delete state.a
// }

// 3-2. 相同值不应该set修改
const state = reactive(obj);
function fn() {
  1/state.a
}

state.a = 0;

fn();
