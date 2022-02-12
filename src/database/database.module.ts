
import { Module } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Module({
    providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (): Promise<Db> => {
        try {
            const { MONGODB_URL, MONGODB_DATABASE} = process.env;

            console.log('#DEBUG MONGODB_URL', MONGODB_URL);
            
            const client = await MongoClient.connect(MONGODB_URL);

            return client.db(MONGODB_DATABASE);
        } catch (e) {
          throw e;
        }
      }
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}
