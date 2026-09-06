import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");

export const BANG = [
	{
		file: "_acceptance/chan-lai-component-ra-man/rang/da-tim-thay.json",
		loai: "DOC luc chay",
	},
	{
		file: "apps/app/components/agent-builder/chat-chips.tsx",
		loai: "NHAP nhu mo-dun",
	},
];

const LENH = "bunx turbo run test --filter=@crm/ui --concurrency=1";

export function doCache() {
	let ra = "";
	try {
		ra = execSync(LENH, { cwd: GOC, encoding: "utf8", stdio: "pipe", maxBuffer: 20e6 });
	} catch (e) {
		ra = `${e.stdout ?? ""}${e.stderr ?? ""}`;
	}
	const m = ra.match(/Cached:\s+(\d+) cached, (\d+) total/);
	if (m === null) return null;
	return { cached: Number(m[1]), total: Number(m[2]) };
}

export function cham(duong) {
	const nguon = readFileSync(duong, "utf8");
	writeFileSync(duong, `${nguon}\n${Date.now()}-${Math.random()}\n`);
	return nguon;
}

if (process.argv[1]?.endsWith("cache-noi-that.mjs")) {
	console.log(`bang khai: ${BANG.length} dong · lenh do: ${LENH}`);
	const loi = [];
	let daChay = 0;

	for (const dong of BANG) {
		const duong = join(GOC, dong.file);
		let goc = null;
		try {
			const moi = doCache();
			if (moi === null) {
				console.error(
					`KHONG DO DUOC: khong doc duoc trang thai cache tu dau ra turbo o luot moi cua ${dong.file}`,
				);
				process.exit(2);
			}
			const duong_tinh = doCache();
			if (duong_tinh === null) {
				console.error("KHONG DO DUOC: khong doc duoc trang thai cache o chieu duong");
				process.exit(2);
			}
			goc = cham(duong);
			const do_ = doCache();
			if (do_ === null) {
				console.error("KHONG DO DUOC: khong doc duoc trang thai cache o chieu do");
				process.exit(2);
			}
			console.log(
				`  ${dong.file}  (${dong.loai})\n    moi ${moi.cached}/${moi.total} · khong doi ${duong_tinh.cached}/${duong_tinh.total} · da cham ${do_.cached}/${do_.total}`,
			);
			for (const [ten, so] of [
				["moi", moi],
				["khong doi", duong_tinh],
				["da cham", do_],
			]) {
				if (so.total < 1) {
					console.error(
						`KHONG DO DUOC: luot "${ten}" cua ${dong.file} co total=0 — cache lanh thi cap hai chieu khong chung duoc gi.`,
					);
					process.exit(2);
				}
			}
			if (duong_tinh.cached !== duong_tinh.total)
				loi.push(
					`${dong.file}: chieu duong sai — khong doi gi ma cache KHONG trung (${duong_tinh.cached}/${duong_tinh.total})`,
				);
			if (do_.cached >= do_.total)
				loi.push(
					`${dong.file}: chieu do sai — da cham file NGOAI goi (${dong.loai}) ma cache VAN TRUNG (${do_.cached}/${do_.total}); khoa cache dang noi doi ve file nay`,
				);
			daChay += 1;
		} finally {
			if (goc !== null) writeFileSync(duong, goc);
		}
	}

	if (daChay !== BANG.length) {
		console.error(`DO: chay ${daChay} dong ma bang khai ${BANG.length} dong`);
		process.exit(1);
	}
	if (loi.length > 0) {
		for (const l of loi) console.error(`DO: ${l}`);
		process.exit(1);
	}
	console.log(
		`XANH: ca ${BANG.length} dong — khong doi thi cache trung, cham mot byte ngoai goi thi cache be. Khoa cache noi that ve ca hai loai phu thuoc.`,
	);
}
