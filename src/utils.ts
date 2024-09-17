export const unwrap = <T extends unknown>(t: T | null | undefined): T => {
  if (t === undefined) {
    throw new Error("Encountered unexpected undefined value");
  }
  if (t === null) {
    throw new Error("Encountered unexpected null value");
  }
  return t;
};

export function assertUnreachable(_: never): never {
  throw new Error("Encountered unreachable code");
}

export const chooseRandom = <T extends unknown>(arr: [T, ...T[]]) =>
  unwrap(arr[chooseRandomIndex(arr)]);

export const chooseRandomIndex = <T extends unknown>(arr: [T, ...T[]]): number =>
  Math.floor(Math.random() * arr.length);
