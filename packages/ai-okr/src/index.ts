import {
	createGateway,
	type LanguageModel,
	type LanguageModelMiddleware,
	wrapLanguageModel,
} from "ai";

type ThamSoGoi = Parameters<
	NonNullable<LanguageModelMiddleware["transformParams"]>
>[0]["params"];

type ProviderOptions = NonNullable<ThamSoGoi["providerOptions"]>;

export const DAU_ONEHUB = "onehub";
const MUC_SUY_NGHI = "low";

export type DauOnehub = {
	zeroDataRetention: boolean;
	thinkingLevel: string | null;
};

export type ModelCoSan = Exclude<LanguageModel, string>;

export type TuyChonZdr = {
	tags: readonly string[];
	tranRaMoiLoiGoi: number;
};

export type TaoNha = (cauHinh?: {
	apiKey?: string;
}) => (modelId: string) => ModelCoSan;

export type XuongModelZdr = TuyChonZdr & {
	modelId: string;
	khoa?: string;
	tao?: TaoNha;
};

export function tuyChonZdr(tags: readonly string[]) {
	return {
		providerOptions: {
			gateway: { zeroDataRetention: true, tags: [...tags] },
			google: { thinkingConfig: { thinkingLevel: MUC_SUY_NGHI } },
			vertex: { thinkingConfig: { thinkingLevel: MUC_SUY_NGHI } },
		},
	} satisfies { providerOptions: ProviderOptions };
}

export function tronTuyChon(
	cu: ProviderOptions | undefined,
	tags: readonly string[],
): ProviderOptions {
	const ep: ProviderOptions = tuyChonZdr(tags).providerOptions;
	const khoa = new Set([...Object.keys(cu ?? {}), ...Object.keys(ep)]);
	return Object.fromEntries(
		[...khoa].map((k) => [k, { ...(cu?.[k] ?? {}), ...(ep[k] ?? {}) }]),
	);
}

function dauCua(params: ThamSoGoi): DauOnehub {
	const po = params.providerOptions ?? {};
	const gateway = po.gateway as { zeroDataRetention?: boolean } | undefined;
	const google = po.google as
		| { thinkingConfig?: { thinkingLevel?: string } }
		| undefined;
	return {
		zeroDataRetention: gateway?.zeroDataRetention === true,
		thinkingLevel: google?.thinkingConfig?.thinkingLevel ?? null,
	};
}

export function middlewareZdr(v: TuyChonZdr): LanguageModelMiddleware {
	return {
		transformParams: async ({ params }) => ({
			...params,
			maxOutputTokens: Math.min(
				params.maxOutputTokens ?? v.tranRaMoiLoiGoi,
				v.tranRaMoiLoiGoi,
			),
			providerOptions: tronTuyChon(params.providerOptions, v.tags),
		}),
		wrapGenerate: async ({ doGenerate, params }) => {
			const kq = await doGenerate();
			return {
				...kq,
				providerMetadata: {
					...(kq.providerMetadata ?? {}),
					[DAU_ONEHUB]: dauCua(params),
				},
			};
		},
		wrapStream: async ({ doStream, params }) => {
			const kq = await doStream();
			const dau = dauCua(params);
			const stream = kq.stream.pipeThrough(
				new TransformStream({
					transform(phan, dieuKhien) {
						dieuKhien.enqueue(
							phan.type === "finish"
								? {
										...phan,
										providerMetadata: {
											...(phan.providerMetadata ?? {}),
											[DAU_ONEHUB]: dau,
										},
									}
								: phan,
						);
					},
				}),
			);
			return { ...kq, stream };
		},
	};
}

export function bocModelZdr(
	model: ModelCoSan,
	tuyChon: TuyChonZdr,
): ModelCoSan {
	return wrapLanguageModel({
		model,
		middleware: middlewareZdr(tuyChon),
	});
}

export function nhaGateway(
	khoa: string | undefined,
	tao: TaoNha = createGateway,
): (modelId: string) => ModelCoSan {
	const k = khoa?.trim();
	return k ? tao({ apiKey: k }) : tao();
}

export function xuongModelZdr(v: XuongModelZdr): ModelCoSan {
	return wrapLanguageModel({
		model: nhaGateway(v.khoa, v.tao)(v.modelId),
		middleware: middlewareZdr(v),
		modelId: v.modelId,
	});
}
