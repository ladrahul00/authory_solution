// import { Injectable } from '@nestjs/common';

import { Resource } from "../commons/types";

// @Injectable()
export class ArticleService extends Resource
{
  public getHello(): string {
    return 'articles coming in';
  }
}
