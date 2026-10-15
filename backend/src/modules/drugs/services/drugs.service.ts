import { getPool } from '../../../database/pool.js';
import { NotFoundError } from '../../../common/errors/AppError.js';
import type { DrugSummaryDto } from '../dto/drug.dto.js';

interface RawDrugRow {
  id: string;
  name: string;
  brand_name: string | null;
  category: string;
  description: string;
  molecular_formula: string | null;
  half_life_hours: string | number | null;
  bioavailability_pct: string | number | null;
  cmax_ug_ml: string | number | null;
  tmax_hours: string | number | null;
  form: string | null;
  dosage: string | null;
  indication: string | null;
  route: string | null;
  image_url: string | null;
}

export function mapDrugRowToDto(row: RawDrugRow): DrugSummaryDto {
  return {
    id: row.id,
    name: row.name,
    brand_name: row.brand_name ?? undefined,
    category: row.category,
    description: row.description,
    molecular_formula: row.molecular_formula ?? undefined,
    half_life_hours: row.half_life_hours != null ? parseFloat(String(row.half_life_hours)) : undefined,
    bioavailability_pct: row.bioavailability_pct != null ? parseFloat(String(row.bioavailability_pct)) : undefined,
    cmax_ug_ml: row.cmax_ug_ml != null ? parseFloat(String(row.cmax_ug_ml)) : undefined,
    tmax_hours: row.tmax_hours != null ? parseFloat(String(row.tmax_hours)) : undefined,
    form: row.form ?? undefined,
    dosage: row.dosage ?? undefined,
    indication: row.indication ?? undefined,
    route: row.route ?? undefined,
    image_url: row.image_url ?? undefined
  };
}

export class DrugsService {
  /**
   * Retrieves all registered drugs ordered alphabetically by name.
   */
  public async getAllDrugs(): Promise<DrugSummaryDto[]> {
    const query = `
      SELECT
        id,
        name,
        brand_name,
        category,
        description,
        molecular_formula,
        half_life_hours,
        bioavailability_pct,
        cmax_ug_ml,
        tmax_hours,
        form,
        dosage,
        indication,
        route,
        image_url
      FROM drugs
      ORDER BY name ASC;
    `;

    const result = await getPool().query<RawDrugRow>(query);
    return result.rows.map(mapDrugRowToDto);
  }

  /**
   * Retrieves a single drug by unique identifier.
   * Throws NotFoundError (404) if drug is not found.
   */
  public async getDrugById(drugIdOrSlug: string): Promise<DrugSummaryDto> {
    const trimmed = drugIdOrSlug.trim();
    const query = `
      SELECT
        id,
        name,
        brand_name,
        category,
        description,
        molecular_formula,
        half_life_hours,
        bioavailability_pct,
        cmax_ug_ml,
        tmax_hours,
        form,
        dosage,
        indication,
        route,
        image_url
      FROM drugs
      WHERE id = $1
         OR LOWER(name) = LOWER($1)
         OR id ILIKE 'drug-' || $1 || '-%'
         OR LOWER(name) LIKE LOWER($1) || '%'
      ORDER BY
        CASE
          WHEN id = $1 THEN 1
          WHEN LOWER(name) = LOWER($1) THEN 2
          WHEN id ILIKE 'drug-' || $1 || '-%' THEN 3
          ELSE 4
        END
      LIMIT 1;
    `;

    const result = await getPool().query<RawDrugRow>(query, [trimmed]);
    if (result.rows.length === 0) {
      throw new NotFoundError('Drug', drugIdOrSlug);
    }

    return mapDrugRowToDto(result.rows[0]);
  }
}

export const drugsService = new DrugsService();
