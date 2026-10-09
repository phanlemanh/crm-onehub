export function lech(ma, kyVong) {
	return ma !== kyVong && !(kyVong !== 0 && ma === 0);
}

function laSo(x) {
	return Number.isInteger(x);
}

function jsonCuoi(text) {
	const dau = text.lastIndexOf("\n{");
	if (dau === -1 && !text.startsWith("{")) return null;
	const tu = dau === -1 ? 0 : dau + 1;
	try {
		return JSON.parse(text.slice(tu));
	} catch {
		return null;
	}
}

export function docKetLan(stdout) {
	const o = jsonCuoi(String(stdout ?? "").trim());
	if (!o || typeof o !== "object") {
		throw new Error("khong doc duoc JSON ket qua cua lan tren stdout");
	}
	if (!Array.isArray(o.suites) || !o.suites.every((s) => laSo(s?.exit))) {
		throw new Error("JSON cua lan thieu mang suites {cmd, exit}");
	}
	if (!o.slugs || typeof o.slugs !== "object") {
		throw new Error("JSON cua lan thieu slugs");
	}
	const ra = [];
	for (const [slug, s] of Object.entries(o.slugs)) {
		if (!Array.isArray(s?.lech)) {
			throw new Error(`JSON cua lan: slug ${slug} thieu mang lech`);
		}
		for (const e of s.lech) {
			if (
				typeof e?.id !== "string" ||
				typeof e?.cmd !== "string" ||
				!laSo(e?.exit) ||
				!laSo(e?.expected)
			) {
				throw new Error(
					`JSON cua lan: muc lech cua ${slug} sai khuon {id, cmd, exit, expected}`,
				);
			}
			ra.push({
				slug,
				id: e.id,
				lenh: e.cmd,
				ma: e.exit,
				kyVong: e.expected,
			});
		}
	}
	return {
		suite: o.suites.map((s, i) => ({ i: i + 1, lenh: s.cmd, ma: s.exit })),
		lech: ra,
	};
}
