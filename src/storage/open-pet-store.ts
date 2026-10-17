import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { createPetRepository, type PetDatabase, type PetRepository, type SqlExecutor, type SqlValue } from './pet-repository';

let opening: Promise<PetRepository> | undefined;

function executor(connection: SQLite.SQLiteDatabase): SqlExecutor {
  return {
    execAsync: sql => connection.execAsync(sql),
    runAsync: (sql, ...params) => connection.runAsync(sql, ...params),
    getAllAsync: <T>(sql: string, ...params: SqlValue[]) => connection.getAllAsync<T>(sql, ...params),
    getFirstAsync: <T>(sql: string, ...params: SqlValue[]) => connection.getFirstAsync<T>(sql, ...params),
  };
}

export function openPetStore(): Promise<PetRepository> {
  if (!opening) {
    opening = (async () => {
      const connection = await SQLite.openDatabaseAsync('puppy-favorites.db');
      const database: PetDatabase = {
        ...executor(connection),
        async transaction<T>(task: (transaction: SqlExecutor) => Promise<T>): Promise<T> {
          let result!: T;
          if (Platform.OS === 'web') {
            await connection.withTransactionAsync(async () => { result = await task(executor(connection)); });
          } else {
            await connection.withExclusiveTransactionAsync(async transaction => { result = await task(executor(transaction)); });
          }
          return result;
        },
      };
      return createPetRepository(database);
    })().catch(error => { opening = undefined; throw error; });
  }
  return opening;
}
