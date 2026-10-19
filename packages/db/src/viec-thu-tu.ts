const SO = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const KHONG = "0";

function giua(a: string, b: string | null): string {
	if (b !== null) {
		let n = 0;
		while ((a[n] ?? KHONG) === b[n]) n++;
		if (n > 0) return b.slice(0, n) + giua(a.slice(n), b.slice(n));
	}
	const soA = a ? SO.indexOf(a[0] ?? KHONG) : 0;
	const soB = b !== null ? SO.indexOf(b[0] ?? KHONG) : SO.length;
	if (soB - soA > 1) return SO[Math.round((soA + soB) / 2)] ?? KHONG;
	if (b !== null && b.length > 1) return b.slice(0, 1);
	return (SO[soA] ?? KHONG) + giua(a.slice(1), null);
}

export function khoaGiua(truoc: string | null, sau: string | null): string {
	if (truoc !== null && sau !== null && !(truoc < sau)) {
		throw new Error(`kv: khoa nguoc ${truoc} ${sau}`);
	}
	return giua(truoc ?? "", sau);
}

export function khoaLienTiep(n: number): string[] {
	const ds: string[] = [];
	let truoc: string | null = null;
	for (let i = 0; i < n; i++) {
		const k = khoaGiua(truoc, null);
		ds.push(k);
		truoc = k;
	}
	return ds;
}
