const LOCAL_HOSTS = new Set([
	"localhost",
	"127.0.0.1",
	"::1",
	"[::1]",
	"0.0.0.0",
]);

export function hostCua(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}

export function laKhoCucBo(url: string): boolean {
	return LOCAL_HOSTS.has(hostCua(url));
}

export function loiKhoXa(command: string, url: string, from: string): string {
	const host = hostCua(url);
	return [
		"",
		`  Refusing to run ${command} against ${host}.`,
		"",
		`  That is not a local database, and ${command} can rewrite or drop`,
		`  schemas. The value came from ${from}.`,
		"",
		from.endsWith(".env.local")
			? [
					"  `.env.local` overrides `.env`, and `vercel env pull` writes",
					"  production credentials into it. Either remove DATABASE_URL from",
					"  that file, or pull Vercel's environment somewhere inert:",
					"",
					"    vercel env pull .env.vercel",
				].join("\n")
			: "  Check which file is winning:  grep -m1 DATABASE_URL .env .env.local",
		"",
		"  To do this deliberately anyway:",
		"",
		`    ALLOW_REMOTE_DB=1 bun run ${command}`,
		"",
	].join("\n");
}
