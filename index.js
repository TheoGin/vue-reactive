import { reactive } from "./reactive.js";
import { effect } from "./effect.js";

const obj = {
  a: 1,
  b: 2,
};
const state = reactive(obj);

// 【数据和函数的内在联系】
// // 1. 两个函数都用到了state.a 和state.b ————> 收集依赖的时候要记录这两个函数用集合【const dep = new Set()】
// function fn() {
//   state.a
//   state.b
// }

// function fn2() {
//   state.a
//   state.b
// }
// fn();

// // 2. 嵌套函数的时候，应该记录的是fn()依赖state.a ？还是记录的是fn2()依赖state.a，
// // ————> 打标记，由用户自己来定，类似于 reactive(obj)
// // ————> effect(fn)
// function fn() {
//   function fn2() {
//     state.a
//   }
//   fn2()
// }
// // //  这个场景比如在react里面
// // function render() {
// //   function render2() {
// //     let data = method(); 
// //     // 调用method()方法返回的数据，应该记录的是method()依赖method里面的数据 ？还是记录的是render2()依赖method里面的数据 ？还是记录的是render()依赖method里面的数据 ？
// //     // ————> 打标记，由用户自己来定，类似于 reactive(obj)
// //     // ————> effect(fn)
// //   }
// // }

// // 标记fn这个函数对应的依赖
// effect(fn);

// // 3. 目前fn依赖的是 state.a 和 state.b；但是如果state.a = 2，则依赖就会变成 state.a 和 state.c
// /*
// if(state.a == 1) {
//   state.b
// } else {
//   state.c;
// }
//   为什么state.a = 2之后重新调用的是上面这几行？
//   ————> activateEffect 不能只收集 fn ，而activateEffect要收集 { activateEffect = fn;  fn();  activateEffect = null; } 这三行
//   ————> 以便依赖 从state.a 和 state.b 变到  state.a 和 state.c，会重新收集依赖
// */
// function fn() {
//   if(state.a == 1) {
//     // console.log('state.b');
//     state.b
//   } else {
//     // console.log('state.c');
//     state.c;
//   }
// }

// state.a = 2
// effect(fn);

// // 4. 两个函数都依赖state.a 和 state.b ————> depSet就会有两个函数
// /*
// value: Set(2)
// [[Entries]]
// 0: function effectFn() { try{ activateEffect = effectFn;  return fn();  } finally {  activateEffect = null; } }
// 1: function effectFn() { try{ activateEffect = effectFn;  return fn();  } finally {  activateEffect = null; } }
// size: 2
// */
// function fn() {
//   if(state.a == 1) {
//     state.b
//   } else {
//     state.c;
//   }
// }

// effect(fn);

// // 5.1 propMap拿到的可能是不止一种，如`state.c`有get，但 `for (const key in state) { }` 还有iterate
// function fn1() {
//   console.log('fn1');
//   state.c;
// }

// effect(fn1);

// function fn() {
//   console.log('fn');
//   // state.c
//   for (const key in state) { }
// }

// effect(fn);

// state.c = 3
// /**
//  * fn1
//  * fn
//  * fn1
//  * fn
//  */

// 5.2 没有依赖就不会调
function fn1() {
  console.log('fn1');
  state.a; // state.c添加了，但是fn1()没有用到，所以不会再执行
}

effect(fn1);

function fn() {
  console.log('fn');
  // state.c
  for (const key in state) { }
}

effect(fn);

state.c = 3
/**
 * fn1
 * fn
 * fn
 */