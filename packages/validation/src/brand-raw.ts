import { z } from "zod";

const mau = z.object({ hex: z.string().nullish(), name: z.string().nullish() });

export const brandSchema = z.object({
	domain: z.string().nullish(),
	title: z.string().nullish(),
	description: z.string().nullish(),
	slogan: z.string().nullish(),
	email: z.string().nullish(),
	phone: z.string().nullish(),
	colors: z.array(mau).nullish(),
	logos: z
		.array(
			z.object({
				url: z.string().nullish(),
				mode: z.string().nullish(),
				type: z.string().nullish(),
				colors: z.array(mau).nullish(),
			}),
		)
		.nullish(),
	socials: z
		.array(z.object({ type: z.string().nullish(), url: z.string().nullish() }))
		.nullish(),
	address: z
		.object({
			city: z.string().nullish(),
			state_code: z.string().nullish(),
			country: z.string().nullish(),
			country_code: z.string().nullish(),
		})
		.nullish(),
	industries: z
		.object({
			eic: z
				.array(
					z.object({
						industry: z.string().nullish(),
						subindustry: z.string().nullish(),
					}),
				)
				.nullish(),
		})
		.nullish(),
	links: z
		.object({
			pricing: z.string().nullish(),
			careers: z.string().nullish(),
		})
		.nullish(),
});

export type Brand = z.infer<typeof brandSchema>;

export const brandRawSchema = z.object({ brand: brandSchema.nullish() });

export type DocBrandRaw =
	| { ok: true; brand: Brand | null }
	| { ok: false; loi: string };

export function docBrandRaw(raw: unknown): DocBrandRaw {
	const ket = brandRawSchema.safeParse(raw);
	if (!ket.success) return { ok: false, loi: z.prettifyError(ket.error) };
	return { ok: true, brand: ket.data.brand ?? null };
}
