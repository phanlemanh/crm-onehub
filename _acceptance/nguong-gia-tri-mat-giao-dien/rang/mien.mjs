export function dongMien(soText, khoa) {
	const ra = new Set();
	for (const l of soText.split("\n")) {
		if (!l.trim()) continue;
		let d;
		try {
			d = JSON.parse(l);
		} catch {
			continue;
		}
		if (!d.decided_by?.trim() || !Array.isArray(d[khoa])) continue;
		for (const hs of d[khoa]) ra.add(hs);
	}
	return ra;
}

export function dongChot(soText) {
	const ra = [];
	for (const l of soText.split("\n")) {
		if (!l.trim()) continue;
		let d;
		try {
			d = JSON.parse(l);
		} catch {
			continue;
		}
		if (d.chot_nguong && d.decided_by?.trim()) ra.push(d);
	}
	return ra;
}

export function daChot(chot, hs) {
	return chot.some(
		(d) =>
			d.chot_nguong.ho_so === "*" || (d.chot_nguong.ho_so ?? []).includes(hs),
	);
}
