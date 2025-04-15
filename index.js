import { reactive } from "./reactive.js";
import { effect } from "./effect.js";
import { computed } from "./computed.js";


const obj = {
  a: 1,
  b: 2
}

const state = reactive(obj)

const sum = computed(() => {
  console.log('computed');
  return state.a + state.b;
})

console.log(sum.value);
// state.a++;