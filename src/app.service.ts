// import { Injectable } from '@nestjs/common';

import { Resource } from "./commons/types";

// @Injectable()
export class AppService extends Resource
{
  public getHello(): string {
    return 'Hello World!';
  }
}
