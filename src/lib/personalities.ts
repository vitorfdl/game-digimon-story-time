import personalitiesRaw from "@/assets/data/personalities.jsonc?raw";

type PersonalitySkill = {
	name: string;
	effect: string;
};

export type PersonalityEntry = {
	name: string;
	stat: string;
	skills: PersonalitySkill[];
};

export type PersonalityCategory = {
	name: string;
	stat: string;
	personalities: PersonalityEntry[];
	category_skills: PersonalitySkill[];
};

export type PersonalityDataset = {
	categories: PersonalityCategory[];
};

let cache: PersonalityDataset | null = null;

function stripJsonComments(input: string): string {
	return input
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/(^|[\t\s])\/\/.*$/gm, (_, prefix) => {
			const preserved = typeof prefix === "string" ? prefix : "";
			return preserved;
		});
}

function parseJsonc(): PersonalityDataset {
	const sanitized = stripJsonComments(personalitiesRaw);
	return JSON.parse(sanitized) as PersonalityDataset;
}

export function getPersonalities(): PersonalityDataset {
	if (!cache) {
		cache = parseJsonc();
	}
	return cache;
}

export function getPersonalityNames(): string[] {
	return getPersonalities()
		.categories.flatMap((category) =>
			category.personalities.map((entry) => entry.name),
		)
		.sort((a, b) => a.localeCompare(b));
}
