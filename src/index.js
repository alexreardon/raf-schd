// @flow
type ResultFn = (...arg: any[]) => number;

export default (fn: Function): ResultFn => {
  let lastArgs: any[] = [];
  let frameId: ?number = null;

  const result: ResultFn = (...args: any): number => {
    // Always capture the latest value
    lastArgs = args;

    // There is already a frame queued
    if (frameId) {
      return frameId;
    }

    // Schedule a new frame
    frameId = requestAnimationFrame(() => {
      frameId = null;
      fn(...lastArgs);
    });

    return frameId;
  };

  // Adding cancel property to result function
  result.cancel = () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
  };

  return result;
};