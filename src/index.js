// @flow

type WrapperFn = (...args: mixed[]) => void;
type CancelFn = {|
  cancel: () => void,
|};
type ResultFn = WrapperFn & CancelFn;

export default (fn: Function): ResultFn => {
  let lastArgs: mixed[] = [];
  let frameId: ?AnimationFrameID = null;

  const wrapperFn: WrapperFn = (...args: mixed[]): void => {
    // Always capture the latest value
    lastArgs = args;

    // There is already a frame queued
    if (frameId) {
      return;
    }

    // Schedule a new frame
    frameId = requestAnimationFrame(() => {
      frameId = null;
      fn(...lastArgs);
    });
  };

  // Adding cancel property to result function
  wrapperFn.cancel = () => {
    if (!frameId) {
      return;
    }

    cancelAnimationFrame(frameId);
    frameId = null;
  };

  const resultFn: ResultFn = (wrapperFn: any);

  return resultFn;
};
