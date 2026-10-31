import { spfi, SPFI, SPFx } from '@pnp/sp';
import { graphfi, GraphFI, SPFx as GraphSPFx } from '@pnp/graph';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import '@pnp/sp/attachments';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IServiceContext } from '../interfaces';

export function createServiceContext(context: WebPartContext): IServiceContext {
  return {
    webUrl: context.pageContext.web.absoluteUrl,
    spHttpClient: context.spHttpClient,
    msGraphClientFactory: context.msGraphClientFactory,
    pageContext: context.pageContext
  };
}

export function initializePnP(context: WebPartContext): { sp: SPFI; graph: GraphFI } {
  const sp = spfi().using(SPFx(context));
  const graph = graphfi().using(GraphSPFx(context));
  return { sp, graph };
}

export function getListTitle(listName: string): string {
  return listName;
}

export interface ISharePointListItem {
  Id?: number;
  Title?: string;
  [key: string]: unknown;
}

export interface IListQueryOptions {
  top?: number;
  skip?: number;
  orderBy?: string;
  filter?: string;
  select?: string[];
  expand?: string[];
}

export function buildSelectFields(fields: string[]): string {
  return fields.join(',');
}

export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}
