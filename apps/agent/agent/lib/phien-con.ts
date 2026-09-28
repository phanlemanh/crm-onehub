const TOKEN_PHIEN_CON = /^subagent:([^:]+):/;

export type NguCanhKenh = {
	readonly channel?: {
		readonly kind?: string;
		readonly continuationToken?: string;
	};
	readonly session?: {
		readonly id?: string;
		readonly parent?: {
			readonly sessionId?: string;
			readonly rootSessionId?: string;
		} | null;
	};
};

export function phienChaCua(ctx: NguCanhKenh): string | null {
	return (
		ctx.session?.parent?.sessionId ??
		TOKEN_PHIEN_CON.exec(ctx.channel?.continuationToken ?? "")?.[1] ??
		null
	);
}

export function phienGocCua(ctx: NguCanhKenh): string | null {
	return ctx.session?.parent?.rootSessionId ?? phienChaCua(ctx);
}
