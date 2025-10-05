import dataIconUrl from "@/assets/digimon-types/data-icon.png";
import virusIconUrl from "@/assets/digimon-types/virus-icon.png";
import vaccineIconUrl from "@/assets/digimon-types/vaccine-icon.png";
import othersIconUrl from "@/assets/digimon-types/others-icon.png";

/**
 * Resolve the attribute icon for a Digimon attribute string.
 */
export function resolveAttributeIcon(
	attribute: string | null | undefined,
): string | null {
	if (!attribute) {
		return othersIconUrl;
	}

	const normalized = attribute.trim().toLowerCase();
	const key = normalized.split(/[\s/-]+/)[0];
	const iconMap: Record<string, string> = {
		vaccine: vaccineIconUrl,
		virus: virusIconUrl,
		data: dataIconUrl,
	};

	return iconMap[key] ?? iconMap[normalized] ?? othersIconUrl;
}
