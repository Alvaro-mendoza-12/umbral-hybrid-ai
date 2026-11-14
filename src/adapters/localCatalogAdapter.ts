import {
  CURATED_CATALOG_DATE,
  CURATED_CATALOG_VERSION,
  curatedOpportunities,
} from '../data/opportunities';
import {
  computeOpportunityStatus,
  filterOpportunities,
  formatIsoDate,
  isSafeHttpsUrl,
} from '../domain/catalogRules';
import type { CatalogFilters, Locale, Opportunity } from '../domain/types';
import type { CatalogPort } from '../ports/catalogPort';

export class LocalCatalogAdapter implements CatalogPort {
  private readonly items: readonly Opportunity[];

  constructor(items: readonly Opportunity[] = curatedOpportunities) {
    this.items = items;
  }

  async listOpportunities(
    filters: CatalogFilters,
    now: Date = new Date(),
  ): Promise<Opportunity[]> {
    return filterOpportunities(this.items, filters, now);
  }

  async getOpportunityById(id: string): Promise<Opportunity | undefined> {
    return this.items.find((item) => item.id === id);
  }

  getCatalogMetadata(): {
    version: string;
    lastCuratedAt: string;
    sourceKind: 'curated_local_snapshot';
    isCachedOffline: boolean;
  } {
    return {
      version: CURATED_CATALOG_VERSION,
      lastCuratedAt: CURATED_CATALOG_DATE,
      sourceKind: 'curated_local_snapshot',
      isCachedOffline: true,
    };
  }

  formatOpportunityExportSummary(opportunity: Opportunity, locale: Locale): string {
    const computedStatus = computeOpportunityStatus(opportunity);
    const verifiedDate = formatIsoDate(opportunity.verifiedAt, locale);
    const safeUrl = isSafeHttpsUrl(opportunity.officialUrl)
      ? opportunity.officialUrl
      : 'Unavailable';

    const lines = [
      `# ${opportunity.title[locale]}`,
      `- ${locale === 'es' ? 'Institución' : 'Provider'}: ${opportunity.providerName[locale]}`,
      `- ${locale === 'es' ? 'Ubicación' : 'Location'}: ${opportunity.locationLabel[locale]}`,
      `- ${locale === 'es' ? 'Estado calculado' : 'Computed status'}: ${computedStatus}`,
      `- ${locale === 'es' ? 'Plazo' : 'Deadline'}: ${opportunity.deadline.label[locale]}`,
      `- ${locale === 'es' ? 'Verificado el' : 'Verified on'}: ${verifiedDate}`,
      `- ${locale === 'es' ? 'Fuente oficial' : 'Official source'}: ${safeUrl}`,
      '',
      `## ${locale === 'es' ? 'Requisitos declarados' : 'Declared requirements'}`,
      ...opportunity.requirements.map((req) => `- ${req.text[locale]}`),
      '',
      `## ${locale === 'es' ? 'Condiciones clave' : 'Key conditions'}`,
      ...opportunity.conditions.map((cond) => `- ${cond.text[locale]}`),
    ];

    if (opportunity.unknownFields.length > 0) {
      lines.push(
        '',
        `## ${locale === 'es' ? 'Datos pendientes o no publicados' : 'Unpublished or pending verification'}`,
        ...opportunity.unknownFields.map((item) => `- ${item[locale]}`),
      );
    }

    return lines.join('\n');
  }
}

export const localCatalogAdapter = new LocalCatalogAdapter();
