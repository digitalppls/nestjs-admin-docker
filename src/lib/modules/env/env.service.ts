import { Secret, applySecrets } from './secret.decorator.js';
import { NodeEnv } from './node-env.enum.js';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  validate,
} from 'class-validator';

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsNotEmpty()
  NODE_ENV: NodeEnv = NodeEnv.Production;

  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  LOGIN_URL: string = '';

  // POSTGRES-----------------------------------------------------------------------
  @IsNotEmpty()
  @IsString()
  POSTGRES_USER: string = 'admin';

  @Secret() // SECRET
  @IsNotEmpty()
  @IsString()
  POSTGRES_PASSWORD: string = '';

  @IsNotEmpty()
  POSTGRES_DB: string = '';

  @IsNotEmpty()
  POSTGRES_HOST: string = '';

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  POSTGRES_PORT: number = 0;
}

@Injectable()
export class ENV {
  private envs: EnvironmentVariables = new EnvironmentVariables();
  constructor(private configService: ConfigService) {
    for (const key of Object.keys(this.envs)) {
      const value = this.configService.get(key);
      console.log(key, value);
      if (value) {
        this.envs[key] = value;
        // console.log("ENV", key, value);
      }
    }

    this.envs = plainToInstance(EnvironmentVariables, this.envs);
    applySecrets(
      this.envs,
      this.envs.NODE_ENV === 'production' ? 'PROD' : 'DEV',
    );

    validate(this.envs).then((errors) => {
      if (errors.length > 0) {
        throw new Error(errors.toString());
      } else {
        Logger.debug('Environments validation succeed', 'ENV');
      }
    });
  }

  get<T = string>(k: keyof EnvironmentVariables): T {
    return this.envs[k] as T;
  }
}
