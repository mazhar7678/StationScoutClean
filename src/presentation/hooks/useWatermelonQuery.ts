import { Model, Query } from '@nozbe/watermelondb';
import { useObservable } from '@nozbe/watermelondb/hooks';

export function useWatermelonQuery<T extends Model>(
  queryFactory: () => Query<T>,
  deps: unknown[] = [],
) {
  return useObservable(() => queryFactory().observeWithColumns([]), deps, []);
}
