// General imports
import path from 'path';
// MikroORM imports
import { MikroORM } from '@mikro-orm/core';
// Custom imports
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    entities: [Post, User],
    dbName: 'project-test-v1',
    type: 'postgresql',
    debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];
