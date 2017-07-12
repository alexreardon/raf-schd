// @flow
export default (fn: Function) => {
  let lastArgs: any[] = [];
  let frameId: ?number = null;

  return (...args: any[]): number => {
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
};