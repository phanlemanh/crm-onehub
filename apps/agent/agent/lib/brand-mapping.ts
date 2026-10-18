import type { Prisma } from "@crm/db";
import type { Brand } from "@crm/validation/brand-raw";

export type BrandUpdate = Prisma.CompanyUpdateInput;

export type CompanySnapshot = {
	name: string;
	nameIsPlaceholder: boolean;
	description: string | null;
	logoUrl: string | null;
	logoDarkUrl: string | null;
	iconUrl: string | null;
	iconDarkUrl: string | null;
	iconTone: string | null;
	brandColor: string | null;
	industry: string | null;
	subIndustry: string | null;
	city: string | null;
	stateCode: string | null;
	country: string | null;
	countryCode: string | null;
	phone: string | null;
	email: string | null;
	linkedinUrl: string | null;
	twitterUrl: string | null;
	githubUrl: string | null;
	pricingUrl: string | null;
	careersUrl: string | null;
};

type LogoMode = "light" | "dark" | "has_opaque_background";

function pickEntry(
	logos: Brand["logos"],
	type: "logo" | "icon",
	mode?: LogoMode,
) {
	return (logos ?? []).find(
		(logo) =>
			logo?.url &&
			logo.type === type &&
			(mode === undefined || logo.mode === mode),
	);
}

function pickLogo(
	logos: Brand["logos"],
	type: "logo" | "icon",
	mode?: LogoMode,
): string | null {
	return pickEntry(logos, type, mode)?.url ?? null;
}

function pickIcon(logos: Brand["logos"]) {
	return (
		pickEntry(logos, "icon", "has_opaque_background") ??
		pickEntry(logos, "icon", "light") ??
		pickEntry(logos, "icon")
	);
}

function iconTone(logos: Brand["logos"]): string | null {
	const icon = pickIcon(logos);
	if (!icon) return null;

	if (icon.mode === "has_opaque_background") return "opaque";

	const rgb = parseHex(icon.colors?.find((colour) => colour?.hex)?.hex);
	if (!rgb) return null;

	const [r, g, b] = rgb;
	const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
	if (saturation > 0.12) return null;

	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	if (luminance < 0.2) return "dark";
	if (luminance > 0.8) return "light";
	return null;
}

function parseHex(
	hex: string | null | undefined,
): [number, number, number] | null {
	const match = /^#?([0-9a-f]{6})$/i.exec(hex?.trim() ?? "");
	if (!match?.[1]) return null;

	const value = Number.parseInt(match[1], 16);
	return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function social(socials: Brand["socials"], type: string): string | null {
	return (socials ?? []).find((entry) => entry?.type === type)?.url ?? null;
}

function clean(value: string | null | undefined): string | null {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

export type MayDien = ReadonlySet<string>;

const KHONG_DIEN_LAI = new Set([
	"name",
	"logoUrl",
	"logoDarkUrl",
	"iconUrl",
	"iconDarkUrl",
	"iconTone",
]);

function fillable(
	key: string,
	current: CompanySnapshot,
	mayDien: MayDien,
): boolean {
	if (key === "iconUrl") return true;
	if (key === "name") return current.nameIsPlaceholder;
	if (mayDien.has(key)) return true;
	return current[key as keyof CompanySnapshot] === null;
}

const KHONG_CO: MayDien = new Set();

const DIA_CHI = [
	["city", (brand: Brand) => brand.address?.city],
	["stateCode", (brand: Brand) => brand.address?.state_code],
	["country", (brand: Brand) => brand.address?.country],
	["countryCode", (brand: Brand) => brand.address?.country_code],
] as const;

const SNAPSHOT_RONG: CompanySnapshot = {
	name: "",
	nameIsPlaceholder: false,
	description: null,
	logoUrl: null,
	logoDarkUrl: null,
	iconUrl: null,
	iconDarkUrl: null,
	iconTone: null,
	brandColor: null,
	industry: null,
	subIndustry: null,
	city: null,
	stateCode: null,
	country: null,
	countryCode: null,
	phone: null,
	email: null,
	linkedinUrl: null,
	twitterUrl: null,
	githubUrl: null,
	pricingUrl: null,
	careersUrl: null,
};

export function truongMayDien(
	brandCu: Brand,
	current: CompanySnapshot,
): MayDien {
	const cu = brandToUpdate(brandCu, SNAPSHOT_RONG);

	return new Set(
		Object.entries(cu)
			.filter(
				([key, value]) =>
					!KHONG_DIEN_LAI.has(key) &&
					value !== undefined &&
					current[key as keyof CompanySnapshot] === value,
			)
			.map(([key]) => key),
	);
}

export function brandToUpdate(
	brand: Brand,
	current: CompanySnapshot,
	mayDien: MayDien = KHONG_CO,
): BrandUpdate {
	const update: BrandUpdate = {};

	const fill = <K extends keyof CompanySnapshot & keyof BrandUpdate>(
		key: K,
		value: string | null,
	) => {
		if (!value || !fillable(key, current, mayDien)) return;
		if (mayDien.has(key) && current[key] === value) return;
		update[key] = value;
	};

	fill("name", clean(brand.title));

	fill("description", clean(brand.description) ?? clean(brand.slogan));

	fill("logoUrl", pickLogo(brand.logos, "logo", "light"));
	fill("logoDarkUrl", pickLogo(brand.logos, "logo", "dark"));

	fill("iconUrl", pickIcon(brand.logos)?.url ?? null);

	fill("iconDarkUrl", pickLogo(brand.logos, "icon", "dark"));
	fill("iconTone", iconTone(brand.logos));

	fill("brandColor", clean(brand.colors?.[0]?.hex));

	const eic = brand.industries?.eic?.[0];
	fill("industry", clean(eic?.industry));
	fill("subIndustry", clean(eic?.subindustry));

	fill("city", clean(brand.address?.city));
	fill("stateCode", clean(brand.address?.state_code));
	fill("country", clean(brand.address?.country));
	fill("countryCode", clean(brand.address?.country_code));

	const coDiaChi = DIA_CHI.some(([, lay]) => clean(lay(brand)) !== null);
	if (coDiaChi) {
		for (const [key, lay] of DIA_CHI) {
			if (
				mayDien.has(key) &&
				clean(lay(brand)) === null &&
				current[key] !== null
			) {
				update[key] = null;
			}
		}
	}

	fill("phone", clean(brand.phone));
	fill("email", clean(brand.email));

	fill("linkedinUrl", social(brand.socials, "linkedin"));
	fill(
		"twitterUrl",
		social(brand.socials, "x") ?? social(brand.socials, "twitter"),
	);
	fill("githubUrl", social(brand.socials, "github"));

	fill("pricingUrl", clean(brand.links?.pricing));
	fill("careersUrl", clean(brand.links?.careers));

	return update;
}

export function stillFillable(
	update: BrandUpdate,
	current: CompanySnapshot,
	mayDien: MayDien = KHONG_CO,
): BrandUpdate {
	return Object.fromEntries(
		Object.entries(update).filter(
			([key, value]) =>
				fillable(key, current, mayDien) &&
				(key === "iconUrl" || current[key as keyof CompanySnapshot] !== value),
		),
	);
}

export function filledFields(update: BrandUpdate): string[] {
	return Object.entries(update)
		.filter(([, value]) => value !== null)
		.map(([key]) => key);
}

export function clearedFields(update: BrandUpdate): string[] {
	return Object.entries(update)
		.filter(([, value]) => value === null)
		.map(([key]) => key);
}
