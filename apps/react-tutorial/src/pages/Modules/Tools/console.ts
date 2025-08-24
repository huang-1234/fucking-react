export class ConsoleColor {
  namespace: string;
  constructor(namespace: string = 'Modules') {
    this.namespace = namespace;
  }
  logGroup(title: string, fn: () => void) {
    console.group(title);
    fn();
    console.groupEnd();
  }
  logGroupColor(title: string, current: any, payload: any, next: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.groupCollapsed(
        `%c ${this.namespace} %c${title}`,
        'color:darkgrey;font-weight:normal',
        'font-weight:bold',
      );
      console.log('%c current', 'color: darkgrey;font-weight:bold', current);
      console.log('%c payload', 'color: cornflowerblue;font-weight:bold', payload);
      console.log('%c next', 'color: darkcyan;font-weight:bold', next);
      console.groupEnd();
    }
  }
}

export const consoleColor = new ConsoleColor();