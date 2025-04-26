import pgtools from 'pgtools';

import { DB_NAME } from './env.config';
import { config } from '../util/db.util';

const db_name = DB_NAME as string;

pgtools
  .createdb(config, db_name)
  .then(() => {
    console.log(`Database ${db_name} created successfully`);
  })
  .catch((error) => {
    if (error.name === 'duplicate_database') {
      console.log(`Database ${db_name} already exists`);
    } else {
      console.error(`Error creating database ${db_name}:`, error);
    }
  });
