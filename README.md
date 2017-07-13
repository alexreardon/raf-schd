# raf-schd

A scheduler based on [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). It throttles calls to a function and only invokes it with the latest argument in the frame period.


[![Build Status](https://travis-ci.org/alexreardon/raf-schd.svg?branch=master)](https://travis-ci.org/alexreardon/raf-schd) [![dependencies](https://david-dm.org/alexreardon/raf-schd.svg)](https://david-dm.org/alexreardon/raf-schd) [![SemVer](https://img.shields.io/badge/SemVer-2.0.0-brightgreen.svg)](http://semver.org/spec/v2.0.0.html)


```js
import rafScheduler from 'raf-schd';

const expensiveFn = (arg) => {
  //...
  console.log(arg);
}

const schedule = rafScheduler(expensiveFn);

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
import rafScheduler from 'raf-schd';

function doSomething(scroll_pos) {
  // do something with the scroll position
}

const scheduled = rafSchedule(doSomething);

window.addEventListener('scroll', function() {
  schedule(window.scrollY);
});
```

## Types

### `rafSchduler`

```js
type rafScheduler = (fn: Function) => ResultFn

type ResultFn = (...arg: any[]) => number;
```

At the top level `raf-schd` accepts any function a returns a new `ResultFn` (a function that wraps your original function). When executed, the `ResultFn` returns a `number`. This number is the animation frame id. You can use this frame id to cancel the scheduled frame using `cancelAnimationFrame(id)`;

The `ResultFn` will execute your function with the **latest arguments** provided to it on the next animation frame.

**Throttled with latest argument**

```js
import rafScheduler from 'raf-schd';

const doSomething = () => {...};

const schedule = rafScheduler(doSomething);

schedule(1, 2);
schedule(3, 4);
schedule(5, 6);

// animation frame fires

// do something called with => '5, 6'
```


**Cancelling a frame**

```js
const scheduled = rafSchedule(doSomething);

const frameId = schedule('foo');

cancelAnimationFrame(frameId);

// now doSomething will not be executed in the next animation frame
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
import rafScheduler from 'raf-schd';
```

### CommonJS

If you are in a CommonJS environment (eg [Node](https://nodejs.org)), then **you will need add `.default` to your import**:

```js
const rafScheduler = require('raf-schd').default;
```



