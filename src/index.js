// @flow

type WrapperFn = (...args: mixed[]) => void;
type CancelFn = {|
  cancel: () => void,
|};
type ResultFn = WrapperFn & CancelFn;

type Options = {|
  leading: boolean,
|};

const defaultOptions: Options = {
  leading: false,
};

export default (fn: Function, options?: Options = defaultOptions): ResultFn => {
  let lastArgs: mixed[] = [];
  let frameId: ?AnimationFrameID = null;

  const wrapperFn: WrapperFn = (...args: mixed[]): void => {
    // Always capture the latest value
    lastArgs = args;

    // There is already a frame queued
    if (frameId) {
      return;
    }

    // no frame queued - execute fn if leading
    if (options.leading) {
      fn(...lastArgs);
    }

    // Schedule a new frame
    frameId = requestAnimationFrame(() => {
      frameId = null;

      // leading call already executed
      if (options.leading && args === lastArgs) {
        return;
      }

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
