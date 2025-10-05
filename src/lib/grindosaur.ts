import { type Cheerio, type CheerioAPI, load } from "cheerio";

const BASE_HOST = "https://www.grindosaur.com";
const BASE_PATH = "/en/games/digimon-story-time-stranger";
const DIGIMON_LIST_PATH = `${BASE_PATH}/digimon`;
const PROXY_PREFIX = "/api/grindosaur";

export type DigimonSummary = {
	number: string | null;
	name: string;
	slug: string;
	url: string;
	icon: string | null;
	generation: string | null;
	attribute: string | null;
	type: string | null;
};

export type EvolutionConditionRow = Record<string, string>;

export type DigimonEvolutionEntry = {
	name: string;
	slug: string | null;
	icon: string | null;
	generation: string | null;
	attribute: string | null;
	type: string | null;
	basePersonality: string | null;
};

export type AttachmentSkillRow = {
	name: string;
	icon?: string | null;
	description?: string | null;
	level?: string | null;
	power?: string | null;
	[key: string]: string | null | undefined;
};

export type DigimonDetails = {
	name: string | null;
	slug: string;
	type: string | null;
	generation: string | null;
	attribute: string | null;
	basePersonality: string | null;
	ridable: string | null;
	icon: string | null;
	evolutionConditions: EvolutionConditionRow[];
	evolvesTo: DigimonEvolutionEntry[];
	evolvesFrom: DigimonEvolutionEntry[];
	learnableAttachmentSkills: AttachmentSkillRow[];
};

const fetchOptions: RequestInit = {
	mode: "no-cors",
};

const LIST_CACHE_KEY = "digimon:cache:list";
const DETAIL_CACHE_PREFIX = "digimon:cache:detail:";

let memoryListCache: DigimonSummary[] | null = null;
const memoryDetailsCache = new Map<string, DigimonDetails>();

function resolveRequestUrl(path: string): string {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const proxyBase =
		typeof import.meta !== "undefined" && import.meta.env?.VITE_GRINDOSAUR_PROXY
			? import.meta.env.VITE_GRINDOSAUR_PROXY.trim()
			: "";

	if (proxyBase) {
		const trimmed = proxyBase.replace(/\/$/, "");
		return `${trimmed}${normalizedPath}`;
	}

	if (typeof window !== "undefined") {
		const { hostname } = window.location;
		const isLocalhost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(
			hostname,
		);
		if (isLocalhost) {
			return `${PROXY_PREFIX}${normalizedPath}`;
		}
	}

	return `${BASE_HOST}${normalizedPath}`;
}

/**
 * Scrape the Grindosaur wiki master list and return structured Digimon summaries.
 */
export async function fetchDigimonList(): Promise<DigimonSummary[]> {
	if (memoryListCache) {
		return memoryListCache;
	}

	const cached = readSessionCache<DigimonSummary[]>(LIST_CACHE_KEY);
	if (cached?.length) {
		memoryListCache = cached;
		return cached;
	}

	const response = await fetch(
		resolveRequestUrl(DIGIMON_LIST_PATH),
		fetchOptions,
	);
	if (!response.ok) {
		throw new Error(`Failed to load Digimon list (${response.status})`);
	}

	const html = await response.text();
	const $ = load(html);

	const table = $("table").filter((_, element) => {
		const captionText = $(element).find("caption").text().trim().toLowerCase();
		return (
			captionText.startsWith("all digimon in digimon story time stranger") ||
			$(element).find("thead th").first().text().trim() === "No. #"
		);
	});

	if (!table.length) {
		return [];
	}

	const summaries = table
		.first()
		.find("tbody tr")
		.map((_, row) => {
			const cells = $(row).find("td");
			if (cells.length < 6) return null;

			const number = textFromCell($(cells[0]));
			const icon = ensureAbsoluteUrl($(cells[1]).find("img").attr("src"));

			const link = $(cells[2]).find("a");
			const url = ensureAbsoluteUrl(link.attr("href"));
			const name = link.text().trim();
			const slug = url ? extractSlug(url) : slugFromName(name);

			const generation = textFromCell($(cells[3]));
			const attribute = textFromCell($(cells[4]));
			const type = textFromCell($(cells[5]));

			if (!name || !slug) {
				return null;
			}

			return {
				number: number || null,
				name,
				slug,
				icon,
				generation: generation || null,
				attribute: attribute || null,
				type: type || null,
			};
		})
		.get()
		.filter(Boolean) as DigimonSummary[];

	memoryListCache = summaries;
	writeSessionCache(LIST_CACHE_KEY, summaries);

	return summaries;
}

/**
 * Load a Digimon detail page and extract the pieces of information required by the app.
 */
export async function fetchDigimonDetails(
	slug: string,
): Promise<DigimonDetails> {
	const normalizedSlug = slug.toLowerCase().trim();
	const requestPath = `${BASE_PATH}/digimon/${normalizedSlug}`;
	const requestUrl = resolveRequestUrl(requestPath);
	const cacheKey = `${DETAIL_CACHE_PREFIX}${normalizedSlug}`;

	const memoryHit = memoryDetailsCache.get(normalizedSlug);
	if (memoryHit) {
		return memoryHit;
	}

	const cached = readSessionCache<DigimonDetails>(cacheKey);
	if (cached) {
		memoryDetailsCache.set(normalizedSlug, cached);
		return cached;
	}

	const response = await fetch(requestUrl, fetchOptions);

	if (!response.ok) {
		throw new Error(
			`Failed to load Digimon page for ${slug} (${response.status})`,
		);
	}

	const html = await response.text();
	const $ = load(html);

	const quickFacts = parseQuickFacts($);
	const name = quickFacts.name ?? fallbackNameFromSlug(normalizedSlug);

	const icon = resolveDigimonIcon($, name, normalizedSlug);
	const evolutionConditions = parseConditionsTable($);
	const evolvesTo = parseEvolutionSection($, "Evolves to");
	const evolvesFrom = parseEvolutionSection($, "Evolves from");
	const learnableAttachmentSkills = parseAttachmentSkills($);

	const details: DigimonDetails = {
		name,
		slug: normalizedSlug,
		type: quickFacts.type ?? null,
		generation: quickFacts.generation ?? null,
		attribute: quickFacts.attribute ?? null,
		basePersonality: quickFacts.basePersonality ?? null,
		ridable: quickFacts.ridable ?? null,
		icon,
		evolutionConditions,
		evolvesTo,
		evolvesFrom,
		learnableAttachmentSkills,
	};

	memoryDetailsCache.set(normalizedSlug, details);
	writeSessionCache(cacheKey, details);

	return details;
}

function parseQuickFacts($: CheerioAPI) {
	const table = $("table")
		.filter(
			(_, element) =>
				$(element).find("caption").text().trim() === "Quick Facts",
		)
		.first();

	const quickFacts: {
		name?: string | null;
		generation?: string | null;
		attribute?: string | null;
		type?: string | null;
		basePersonality?: string | null;
		ridable?: string | null;
	} = {};

	if (!table.length) {
		return quickFacts;
	}

	table.find("tbody tr").each((_, row) => {
		const label = $(row).find("th").first().text().trim();
		const valueCell = $(row).find("td").first();
		const value = valueCell.text().trim() || null;

		switch (label) {
			case "Name":
				quickFacts.name = value;
				break;
			case "Generation":
				quickFacts.generation = value;
				break;
			case "Attribute":
				quickFacts.attribute = value;
				break;
			case "Type":
				quickFacts.type = value;
				break;
			case "Base Personality":
				quickFacts.basePersonality = value;
				break;
			case "Ridable":
				quickFacts.ridable = value;
				break;
			default:
				break;
		}
	});

	return quickFacts;
}

function textFromCell(cell: Cheerio<any>) {
	return cell.text().replace(/\s+/g, " ").trim();
}

function parseConditionsTable($: CheerioAPI): EvolutionConditionRow[] {
	const heading = findHeading($, "Evolution Conditions");
	if (!heading.length) return [];

	const table = heading.nextUntil("h2, h3").find("table").first();
	if (!table.length) return [];

	const headers = table
		.find("thead th")
		.map((_, header) => $(header).text().replace(/\s+/g, " ").trim())
		.get();

	return table
		.find("tbody tr")
		.toArray()
		.map((row) => {
			const cells = $(row).find("td");
			if (!cells.length) return null;

			const entry: EvolutionConditionRow = {};
			cells.each((index, cell) => {
				const key = headers[index] || `Column ${index + 1}`;
				entry[key] = $(cell).text().replace(/\s+/g, " ").trim();
			});

			return entry;
		})
		.filter(Boolean) as EvolutionConditionRow[];
}

function parseEvolutionSection(
	$: CheerioAPI,
	label: "Evolves to" | "Evolves from",
): DigimonEvolutionEntry[] {
	const heading = findHeading($, label);
	if (!heading.length) return [];

	const table = heading.nextUntil("h2, h3").find("table").first();
	if (!table.length) return [];

	const headers = table
		.find("thead th")
		.map((_, header) => $(header).text().trim())
		.get();

	return table
		.find("tbody tr")
		.map((_, row) => {
			const entry: DigimonEvolutionEntry = {
				name: "",
				slug: null,
				icon: null,
				generation: null,
				attribute: null,
				type: null,
				basePersonality: null,
			};

			$(row)
				.find("td")
				.each((index, cell) => {
					const header = headers[index] ?? "";
					const cellEl = $(cell);

					switch (header) {
						case "Icon":
							entry.icon = ensureAbsoluteUrl(cellEl.find("img").attr("src"));
							break;
						case "Name": {
							const link = cellEl.find("a").first();
							const href = ensureAbsoluteUrl(link.attr("href"));
							entry.name = link.text().trim() || cellEl.text().trim();
							entry.slug = href ? extractSlug(href) : slugFromName(entry.name);
							break;
						}
						case "Generation":
							entry.generation = cellEl.text().trim() || null;
							break;
						case "Attribute":
							entry.attribute = cellEl.text().trim() || null;
							break;
						case "Type":
							entry.type = cellEl.text().trim() || null;
							break;
						default: {
							// Handle variations like "Base Perso." and other headers gracefully
							const normalized = header.toLowerCase();
							if (normalized.startsWith("base perso")) {
								entry.basePersonality = cellEl.text().trim() || null;
							}
							break;
						}
					}
				});

			return entry.name ? entry : null;
		})
		.get()
		.filter(Boolean) as DigimonEvolutionEntry[];
}

function parseAttachmentSkills($: CheerioAPI): AttachmentSkillRow[] {
	const heading = findHeading($, "Learnable Attachment Skills");
	if (!heading.length) return [];

	const section = heading.nextUntil("h2, h3");
	const table = section.find("table").first();

	if (!table.length) {
		// If there's no table, check if the section explicitly says none are available
		const hasNoSkillsMessage = section
			.find("p")
			.filter((_, p) =>
				$(p).text().toLowerCase().includes("does not possess"),
			).length;

		return hasNoSkillsMessage ? [] : [];
	}

	const headers = table
		.find("thead th")
		.map((_, header) => normalizeKey($(header).text()))
		.get();

	return table
		.find("tbody tr")
		.map((_, row) => {
			const entry: AttachmentSkillRow = { name: "" };

			$(row)
				.find("td")
				.each((index, cell) => {
					const key = headers[index] ?? `column${index}`;
					const cellEl = $(cell);

					if (key === "icon") {
						entry.icon = ensureAbsoluteUrl(cellEl.find("img").attr("src"));
						return;
					}

					const value = cellEl.text().replace(/\s+/g, " ").trim() || null;
					if (key === "name") {
						entry.name = value ?? "";
					} else {
						entry[key] = value;
					}
				});

			return entry.name ? entry : null;
		})
		.get()
		.filter(Boolean) as AttachmentSkillRow[];
}

function findHeading($: CheerioAPI, label: string) {
	const lowerLabel = label.toLowerCase();
	return $("h2, h3").filter(
		(_, element) => $(element).text().trim().toLowerCase() === lowerLabel,
	);
}

function normalizeKey(label: string) {
	return label
		.toLowerCase()
		.replace(/[^a-z0-9]+([a-z0-9])/g, (_, char) => char.toUpperCase())
		.replace(/[^a-z0-9]/g, "");
}

function ensureAbsoluteUrl(url?: string | null): string | null {
	if (!url) return null;
	try {
		const parsed = url.startsWith("http")
			? new URL(url)
			: new URL(url.startsWith("/") ? url : `/${url}`, BASE_HOST);
		return parsed.toString();
	} catch (error) {
		console.warn("Failed to normalize URL", url, error);
		return null;
	}
}

function extractSlug(url: string) {
	try {
		const parsed = new URL(url);
		const segments = parsed.pathname.split("/").filter(Boolean);
		return segments[segments.length - 1];
	} catch (error) {
		console.warn("Failed to extract slug from URL", url, error);
		return slugFromName(url);
	}
}

function slugFromName(name: string) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function fallbackNameFromSlug(slug: string) {
	return slug
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function resolveDigimonIcon($: CheerioAPI, name: string | null, slug: string) {
	const sluggedIcon = $("img").filter((_, img) => {
		const src = $(img).attr("src");
		return src?.includes(`/${slug}-icon`) ?? false;
	});

	if (sluggedIcon.length) {
		return ensureAbsoluteUrl(sluggedIcon.first().attr("src"));
	}

	if (name) {
		const iconByName = $("img").filter((_, img) => {
			const alt = $(img).attr("alt")?.toLowerCase() ?? "";
			return alt.startsWith(name.toLowerCase()) && alt.includes("icon");
		});

		if (iconByName.length) {
			return ensureAbsoluteUrl(iconByName.first().attr("src"));
		}
	}

	return null;
}

function readSessionCache<T>(key: string): T | null {
	const storage = getSessionStorage();
	if (!storage) return null;

	const raw = storage.getItem(key);
	if (!raw) return null;

	try {
		return JSON.parse(raw) as T;
	} catch (error) {
		console.warn("Failed to parse session cache entry", key, error);
		storage.removeItem(key);
		return null;
	}
}

function writeSessionCache<T>(key: string, value: T) {
	const storage = getSessionStorage();
	if (!storage) return;

	try {
		storage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.warn("Failed to persist session cache entry", key, error);
	}
}

function getSessionStorage(): Storage | null {
	if (typeof window === "undefined") return null;
	try {
		return window.sessionStorage;
	} catch (error) {
		console.warn("Session storage unavailable", error);
		return null;
	}
}
