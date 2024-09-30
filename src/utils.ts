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

export const buildUrl = (
  url: string,
  params: Record<string, string | number | boolean | undefined>
) => {
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value === undefined ? "" : value.toString());
  });
  return urlObj;
};

// https://stackoverflow.com/questions/58668361/how-can-i-convert-an-async-iterator-to-an-array
export async function arrayAsyncFrom<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of gen) {
    out.push(x);
  }
  return out;
}
