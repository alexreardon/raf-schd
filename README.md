# raf-schd

A scheduler based on [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). It throttles calls to a function and only invokes it with the latest argument in the frame period.

[![Build Status](https://travis-ci.org/alexreardon/raf-schd.svg?branch=master)](https://travis-ci.org/alexreardon/raf-schd) [![dependencies](https://david-dm.org/alexreardon/raf-schd.svg)](https://david-dm.org/alexreardon/raf-schd) [![npm](https://img.shields.io/npm/v/raf-schd.svg)](https://www.npmjs.com/package/raf-schd) [![SemVer](https://img.shields.io/badge/SemVer-2.0.0-brightgreen.svg)](http://semver.org/spec/v2.0.0.html)

```js
import rafSchd from 'raf-schd';

const expensiveFn = arg => {
  //...
  console.log(arg);
};

const schedule = rafSchd(expensiveFn);

schedule('foo');
schedule('bar');
schedule('baz');

// animation frame fires

// => 'baz'
```

## Why?

`raf-schd` supports the use case where you only want to perform an action in an animation frame with the latest value. This an **extremely** useful performance optmisation.

### Without `raf-schd`

> Optimised scroll listener example taken from [MDN](https://developer.mozilla.org/en-US/docs/Web/Events/scroll)

```js
var last_known_scroll_position = 0;
var ticking = false;

function doSomething(scroll_pos) {
  // do something with the scroll position
}

window.addEventListener('scroll', function(e) {
  last_known_scroll_position = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(function() {
      doSomething(last_known_scroll_position);
      ticking = false;
    });
  }
  ticking = true;
});
```

### With `raf-schd`

```js
import rafSchd from 'raf-schd';

function doSomething(scroll_pos) {
  // do something with the scroll position
}

const schedule = rafSchd(doSomething);

window.addEventListener('scroll', function() {
  schedule(window.scrollY);
});
```

## Types

### `rafSchedule`

```js
type rafSchedule = (fn: Function) => ResultFn;

// Adding a .cancel property to the WrapperFn

type WrapperFn = (...arg: mixed[]) => void;
type CancelFn = {|
  cancel: () => void,
|};
type ResultFn = WrapperFn & CancelFn;
```

At the top level `raf-schd` accepts any function a returns a new `ResultFn` (a function that wraps your original function).

The `ResultFn` will execute your function with the **latest arguments** provided to it on the next animation frame.

### Throttled with latest argument

```js
import rafSchd from 'raf-schd';

const doSomething = () => {...};

const schedule = rafSchd(doSomething);

schedule(1, 2);
schedule(3, 4);
schedule(5, 6);

// animation frame fires

// do something called with => '5, 6'
```

### Cancelling a frame with `.cancel`

`raf-schd` adds a `.cancel` property to the `ResultFn` so that it can be easily cancelled. The frame will only be cancelled if it has not yet executed.

```js
const scheduled = rafSchd(doSomething);

schedule('foo');

scheduled.cancel();

// now doSomething will not be executed in the next animation frame
```

## Is this a `throttle`, `debounce` or something else?

`raf-schd` is very close to a regular `throttle` function. However, rather than waiting for a fixed period of time before the wrapped function is called (such as `20ms`), `raf-schd` waits for an animation frame.

### Differences to `throttle`

- No leading function call. The wrapped function is not called on the first call.

```js
const scheduled = rafSchd(console.log);

schedule('foo');
// function not called yet

// after an animation frame
// => console.log('foo');
```

## Testing your code

If you want to really ensure that your code is working how you intend it to - use [`raf-stub`](https://github.com/alexreardon/raf-stub) to test your animation frame logic.

## Installation

```bash
# yarn
yarn add raf-schd

# npm
npm install raf-schd --save
```

## Module usage

### ES6 module

```js
import rafSchd from 'raf-schd';
```

### CommonJS

If you are in a CommonJS environment (eg [Node](https://nodejs.org)), then **you will need add `.default` to your import**:

```js
const rafSchd = require('raf-schd').default;
```
