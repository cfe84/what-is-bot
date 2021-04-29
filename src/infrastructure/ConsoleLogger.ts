import { ILogger } from "../domain";

export class ConsoleLogger implements ILogger {
  debug(...messages: any[]): void {
    if (process.env.Debug) {
      console.debug(messages)
    }
  }
  log(...messages: any[]): void {
    console.log(messages)
  }
  warn(...messages: any[]): void {
    console.warn(messages)
  }
  error(...messages: any[]): void {
    console.error(messages)
  }

}