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

// // 5.2 没有依赖就不会调
// function fn1() {
//   console.log('fn1');
//   state.a; // state.c添加了，但是fn1()没有用到，所以不会再执行
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
//  * fn
//  */

// // 6.1. 需要重新依赖收集情况。两种方法。
// // （1）遍历整个targetMap，找到fn去掉再重新添加，太麻烦
// // （2）给effectFn加一个属性，记录哪些集合存着effectFn。即effectFn.depSet = [第一个集合，第二个集合，……]。通过这种方式重新依赖收集。
// function fn() {
//   console.log('fn');
//   if(state.a === 1) {
//     state.b
//   }else {
//     state.c
//   }
// }

// effect(fn); // 触发：fn()函数重新执行
// state.a = 2 // 触发：fn()函数重新执行
// state.b = 5 // 触发：fn()函数重新执行。但expect: 不会触发，因为 state.a 已经变为2 ————> 需要重新依赖收集

// // 6.2. 重新依赖收集后
// function fn() {
//   console.log('fn');
//   if(state.a === 1) {
//     state.b
//   }else {
//     state.c
//   }
// }

// effect(fn); // 触发：fn()函数重新执行
// state.a = 2 // 触发：fn()函数重新执行
// state.b = 5 // 重新依赖收集后 不会触发：fn()函数重新执行

// // 6.3. 重新依赖收集后
// function fn() {
//   console.log('fn');
//   if(state.a === 1) {
//     state.b
//   }else {
//     state.c
//   }
// }

// effect(fn); // 触发：fn()函数重新执行
// state.a = 2 // 触发：fn()函数重新执行
// state.c = 5 // 会触发：fn()函数重新执行！！

// // 7.1. 函数套函数（组件套组件），框架里很常见
// function fn() {
//   console.log('fn');
//   effect(() => {
//     console.log('inner');
//     state.a
//   })
//   state.b
// }

// effect(fn);
// /**
//  * fn
//  * inner
//  */

// // 7.2. 函数套函数（组件套组件），框架里很常见
// function fn() {
//   console.log('fn');
//   effect(() => {
//     console.log('inner');
//     state.a
//   })
//   state.b
// }

// effect(fn);
// state.a = 10
// /**
//  * fn
//  * inner
//  * inner 【state.a = 10导致的】
//  */

// // 7.3. 模拟一个执行栈 effectStack = []
// function fn() {
//   console.log('fn');
//   effect(() => {
//     console.log('inner');
//     state.a
//   })
//   state.b
// }

// effect(fn);
// state.b = 10 // expect: 重新执行fn()函数。但没有。因为【相当于执行栈】 activeEffect = fn(其实是effectFn) ---->  activeEffect = inner ----> activeEffect = null ----> 导致收集不到state.b的依赖
// /**
//  * fn
//  * inner
//  */
// // ---->  模拟一个执行栈 effectStack = []，之后的输出
// /**
//  * fn
//  * inner
//  * fn
//  * inner
//  */

// // 8. state.a++  ----> 爆栈
// function fn() {
//   console.log('fn');
//   // state.a++;
//   state.a = state.a + 1; // Uncaught RangeError: Maximum call stack size exceeded。因为state.a触发依赖收集get，state.a触发set ----> state.a触发依赖收集get，state.a触发set ----> state.a触发依赖收集get，state.a触发set ----> state.a触发依赖收集get，state.a触发set ----> ……爆栈
//   // 如果state.a触发依赖收集是当前这个函数fn()【即effectFn === activeEffect】，就return
// }

// effect(fn);

// // 9.1. 功能增强：不立即执行函数
// function fn() {
//   console.log('fn');
// }

// const effectFn = effect(fn, {
//   lazy: true,
// });
// effectFn()

// 9.2. 功能增强：控制执行次数（类似于框架最后只渲染一次）
function fn() {
  console.log("fn");
  state.a = state.a + 1;
}

let isRun = false;
const effectFn = effect(fn, {
  lazy: true,
  scheduler: (eff) => {
    // console.log('scheduler');
    Promise.resolve().then(() => {
      if (!isRun) {
        isRun = true; // 控制只执行一次
        eff();
      }
    });
  },
});

effectFn();

state.a++; 
state.a++; 
state.a++; 
state.a++; 
state.a++; 
state.a++; 
state.a++; 
state.a++; 
state.a++; 
state.a++; 
state.a++; 
