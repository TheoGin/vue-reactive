import { reactive } from "./reactive.js";

const state = reactive({
  a: 1,
  b: 2,
});

function fn() {
  state.a;
  state.b;
}

fn();

// state.a = 3;
state.a++;