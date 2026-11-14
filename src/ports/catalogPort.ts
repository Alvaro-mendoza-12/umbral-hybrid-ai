import type { CatalogFilters, Locale, Opportunity } from '../domain/types';

export interface CatalogPort {
  listOpportunities(filters: CatalogFilters, now?: Date): Promise<Opportunity[]>;
  getOpportunityById(id: string): Promise<Opportunity | undefined>;
  getCatalogMetadata(): {
    version: string;
    lastCuratedAt: string;
    sourceKind: 'curated_local_snapshot';
    isCachedOffline: boolean;
  };
  formatOpportunityExportSummary(opportunity: Opportunity, locale: Locale): string;
}
