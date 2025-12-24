import { Model, Query } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export function useWatermelonQuery<T extends Model>(
  queryFactory: () => Query<T>,
  deps: unknown[] = []
): T[] {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    const query = queryFactory();
    const subscription = query.observe().subscribe((records) => {
      setData(records);
    });

    return () => subscription.unsubscribe();
  }, deps);

  return data;
}
