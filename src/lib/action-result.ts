export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: string): ActionResult<T> {
  return { ok: false, error };
}

export function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.data;
}
