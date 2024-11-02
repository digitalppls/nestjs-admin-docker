import { Module, UnauthorizedException } from '@nestjs/common';
import { AdminModule } from '@adminjs/nestjs';
import { ConfigModule } from '@nestjs/config';
import { Resource, Database, Adapter } from '@adminjs/sql';
import AdminJS from 'adminjs';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ENVModule } from './lib/modules/env/env.module.js';
import { ENV } from './lib/modules/env/env.service.js';
import axios from 'axios';

function getPostgresUrl(env: ENV) {
  const connectionString = `postgresql://${env.get('POSTGRES_USER')}:${env.get('POSTGRES_PASSWORD')}@${env.get('POSTGRES_HOST')}:${env.get('POSTGRES_PORT')}/${env.get('POSTGRES_DB')}`;
  return {
    connectionString,
    database: env.get('POSTGRES_DB'),
  };
}

AdminJS.registerAdapter({
  Database,
  Resource,
});

@Module({
  imports: [
    ENVModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    AdminModule.createAdminAsync({
      inject: [ENV],
      useFactory: async (env: ENV) => {
        const db = await new Adapter(
          'postgresql',
          await getPostgresUrl(env),
        ).init();
        return {
          adminJsOptions: {
            rootPath: '/admin',
            // Rename "organizations" to your table name or set "resources" to []
            resources: [...db.tables()],
          },
          auth: {
            authenticate: async (email, password) => {
              try {
                const response = await axios.post(env.get('LOGIN_URL'), {
                  email,
                  password,
                });
                console.log(response.data?.user?.roles);
                if (
                  response.data.token &&
                  response.data.user?.roles?.find(
                    (x) => x.role?.toUpperCase() === 'ADMIN',
                  )
                ) {
                  return { email };
                }
                throw new UnauthorizedException(response.data.message);
              } catch (e) {}
              // console.log(email,db.table("user").knex.select().where({ email, password }));
            },
            cookiePassword: 'kspodfksdfoasmdgisdfsdfsd',
            cookieName: 'adminjs',
          },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'asdfsfsfsdfsdd3ghghdsdacvf',
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
