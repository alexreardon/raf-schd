// @flow
import { replaceRaf } from 'raf-stub';
import rafScheduler from '../src/';

replaceRaf();

beforeEach(() => {
  requestAnimationFrame.reset();
});

describe('behaviour', () => {
  it('should not execute a callback before a animation frame', () => {
    const myMock = jest.fn();
    const fn = rafScheduler(myMock);

    fn();

    expect(myMock).toHaveBeenCalledTimes(0);
  });

  it('should execute a callback after an animation frame', () => {
    const myMock = jest.fn();
    const fn = rafScheduler(myMock);

    fn();
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
  });

  it('should not execute multiple times if waiting for a frame', () => {
    const myMock = jest.fn();
    const fn = rafScheduler(myMock);

    fn();
    fn();
    fn();
    fn();

    requestAnimationFrame.step();
    expect(myMock).toHaveBeenCalledTimes(1);

    // should have no impact
    requestAnimationFrame.step();
    requestAnimationFrame.flush();
    expect(myMock).toHaveBeenCalledTimes(1);
  });

  it('should execute the callback with the latest value', () => {
    const myMock = jest.fn();
    const fn = rafScheduler(myMock);

    fn(1);
    fn(2);
    fn(3);
    fn(4);
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0][0]).toBe(4);
  });

  it('should execute the callbacks with the latest value when there are multiple args', () => {
    const myMock = jest.fn();
    const fn = rafScheduler(myMock);

    fn(1, 2, 3);
    fn(4, 5, 6);
    fn(7, 8, 9);
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0]).toEqual([7, 8, 9]);
  });

  it('should return the exact value that was passed to the callback', () => {
    const myMock = jest.fn();
    const fn = rafScheduler(myMock);
    const value = { hello: 'world' };

    fn(value);
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(1);
    expect(myMock.mock.calls[0][0]).toBe(value);
  });

  it('should return the frame id', () => {
    const myMock = jest.fn();
    const fn = rafScheduler(myMock);

    const frameId: number = fn();

    expect(frameId).toEqual(expect.any(Number));
  });

  it('should not execute the queued frame if it is cancelled', () => {
    const myMock = jest.fn();
    const fn = rafScheduler(myMock);

    const frameId: number = fn();
    cancelAnimationFrame(frameId);
    // would normally release the function
    requestAnimationFrame.step();

    expect(myMock).toHaveBeenCalledTimes(0);
  });
});

describe('respecting original "this" context', () => {
  it('should respect new bindings', () => {
    const mock = jest.fn();
    const Foo = function (a: number) {
      this.a = a;
    };
    Foo.prototype.callMock = function () {
      return mock(this.a);
    };
    const foo = new Foo(10);
    const schedule = rafScheduler(function () {
      foo.callMock();
    });

    schedule();
    requestAnimationFrame.step();

    expect(mock).toBeCalledWith(10);
  });

  it('should respect explicit bindings', () => {
    const mock = jest.fn();
    const callMock = function () {
      mock(this.a);
    };
    const foo = {
      a: 50,
    };
    const bound = callMock.bind(foo);
    const schedule = rafScheduler(bound);

    schedule();
    requestAnimationFrame.step();

    expect(mock).toBeCalledWith(foo.a);
  });

  it('should respect implicit bindings', () => {
    const mock = jest.fn();
    const foo = {
      a: 50,
      callMock: function () {
        mock(this.a);
      },
    };

    const schedule = rafScheduler(function () {
      foo.callMock();
    });

    schedule();
    requestAnimationFrame.step();

    expect(mock).toBeCalledWith(foo.a);
  });

  it('should respect ignored bindings', () => {
    const mock = jest.fn();
    const callMock = function () {
      // $ExpectError - this should throw!
      mock(this.a);
    };
    const schedule = rafScheduler(function () {
      callMock.call(null);
    });

    schedule();

    expect(() => requestAnimationFrame.step()).toThrow();
  });
});

