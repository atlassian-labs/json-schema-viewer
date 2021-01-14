import { MemoryRouter, MemoryRouterProps } from 'react-router';

export class DebuggingMemoryRouter extends MemoryRouter {
  constructor(props: MemoryRouterProps) {
    super(props);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).history.listen((location: any, action: any) => { // tslint:disable-line:no-any
      console.log(
        `The current URL is ${location.pathname}${location.search}${location.hash}`
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log(`The last navigation action was ${action}`, JSON.stringify((this as any).history, null, 2));
    });
  }
}