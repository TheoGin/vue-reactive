import { reactive } from "./reactive.js";
import { effect } from "./effect.js";
import { computed } from "./computed.js";

const state = reactive({
  a: 1,
  b: 2,
});

const sum = computed(() => {
  console.log("computed");
  return state.a + state.b;
});

// 1. 没有访问sum.value就不会执行computed ————> 在使用effect加入lazy: true配置项
// console.log(sum.value);

// 2. 读多次会调用多次computed，但computed是有缓存的 ————> dirty = true，当脏的时候，才重新value = effectFn()，否则不调用computed
// console.log(sum.value);
// console.log(sum.value);
// console.log(sum.value);
// console.log(sum.value);
// console.log(sum.value);

// // 3. 加了好多次，但sum.value还是3，用的还是之前的数据。什么时候会脏？getter重新运行的时候，因为依赖它的数据变化，导致getter重新运行，这时候数据又变脏了 ————> 在使用effect加入配置项。这样在派发更新的时候就不会调用effectFn()函数，而是调用scheduler()配置好的函数。脏了之后再调用`dirty = true; effectFn();`
// state.a++;
// state.a++;
// state.a++;
// state.a++;
// console.log(sum.value);
// console.log(sum.value);
// console.log(sum.value);
// console.log(sum.value);

// // 4. 没有用到sum.value，期待没有输出，但输出了。 ————> 把effect配置项`scheduler() { dirty = true;   effectFn(); }`改为`scheduler() { dirty = true;}` 即去掉 effectFn();
// console.log(sum.value);
// console.log(sum.value);
// console.log(sum.value);
// state.a++;
// state.a++;
// state.a++;
// /**
//  * computed
//  * 3
//  * 3
//  * 3
//  * computed // 期待没有输出，但输出了。因为state.a++之后，后面没有用到
//  * computed // 期待没有输出，但输出了。因为state.a++之后，后面没有用到
//  * computed // 期待没有输出，但输出了。因为state.a++之后，后面没有用到
//  */
// console.log(sum.value);
// console.log(sum.value);
// console.log(sum.value);

// 4. computed不是直接用的，是放到effect里面用的，比如在组件的渲染函数的模版里面使用了这个计算属性。相当于effect(() => { console.log('render', sum.value); })，因为在vue是把渲染函数放到effect里面去执行的。但有问题：state.a++之后，没有重新运行() => { console.log('render', sum.value); }，因为state.a变了，导致运行`scheduler() { dirty = true;}`就结束了，即`() => { console.log('render', sum.value); }`这个函数和sum.value没有建立关联 ————>  （1）get value()中加入依赖收集`track(obj, TrackOpTypes.GET, 'value')`来建立关联；（2）在`scheduler()中加入trigger(obj, TriggerOpTypes.SET, 'value')`，改变的时候除了dirty改为true，还要派发更新
effect(() => {
  console.log("render", sum.value);
});
state.a++; // 没有重新运行() => { console.log('render', sum.value); }
state.a++; // 没有重新运行() => { console.log('render', sum.value); }
state.a++; // 没有重新运行() => { console.log('render', sum.value); }
/**
 * computed
 * render 3
 */
