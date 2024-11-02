import "reflect-metadata";

// Декоратор @Secret, который сохраняет путь к секрету в метаданных
export function Secret(): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    Reflect.defineMetadata("secret", propertyKey, target, propertyKey);
  };
}

import "reflect-metadata";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { Logger } from "@nestjs/common";

// Функция для чтения и применения секретов на основе метаданных
export function applySecrets(target: any, prefix:"DEV"|"PROD"="DEV") {
  for (const propertyKey of Object.keys(target)) {
    const secretKey = Reflect.getMetadata("secret", target, propertyKey);

    if (secretKey) {
      const secretPath = existsSync(`/run/secrets/${prefix}_${String(propertyKey)}`)
            ? `/run/secrets/${prefix}_${String(propertyKey)}`
            : join(process.cwd(), ".secrets", 'dev', `DEV_${String(propertyKey)}`);
      try {
        // console.log("SECRET", propertyKey, secretPath);
        const data = readFileSync(secretPath, { encoding: "utf8" }).trim(); // Удаляем пробелы в начале и конце
        // console.log("SECRET", secretPath, data)
        target[propertyKey] = data;
      } catch (error: any) {
        Logger.debug(`Пропуск секрета '${secretPath}', используется .env`);
      }
    }
  }
}
