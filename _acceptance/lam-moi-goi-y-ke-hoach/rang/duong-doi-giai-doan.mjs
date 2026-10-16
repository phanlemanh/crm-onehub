// Hồ sơ _acceptance/lam-moi-goi-y-ke-hoach — E10: mọi lời gọi deals.setStage / deals.bulkSetStage trong apps/app
// nằm trong bảng bốn nơi khai trước, và khối đối số mutationOptions của từng nơi gọi cache.deal — để lời hứa
// «sửa một chỗ trong cache.deal là phủ mọi đường đổi giai đoạn» được đo lại mỗi lượt, không chỉ grep lúc thiết kế.
//   node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs [--tu-thu]
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THU_TUC = ["deals.setStage", "deals.bulkSetStage"];
const BANG = [
	["apps/app/components/crm/stage-stepper.tsx", "deals.setStage"],
	["apps/app/components/crm/stage-change.tsx", "deals.setStage"],
	["apps/app/app/(app)/[slug]/deals/use-deal-board-move.ts", "deals.setStage"],
	[
		"apps/app/app/(app)/[slug]/deals/deals-bulk-actions.tsx",
		"deals.bulkSetStage",
	],
];

function* tepMa(thuMuc) {
	for (const ten of readdirSync(thuMuc)) {
		if (ten === "node_modules" || ten === ".next" || ten === "test") continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) yield* tepMa(duong);
		else if (/\.(ts|tsx)$/.test(ten)) yield duong;
	}
}

function khoiDoiSo(chu, batDau) {
	let sau = 0;
	for (let i = batDau; i < chu.length; i += 1) {
		if (chu[i] === "(") sau += 1;
		else if (chu[i] === ")") {
			sau -= 1;
			if (sau === 0) return chu.slice(batDau, i + 1);
		}
	}
	return chu.slice(batDau);
}

function quet(goc) {
	const loi = [];
	const daThay = new Map();
	for (const tep of tepMa(join(goc, "apps/app"))) {
		const chu = readFileSync(tep, "utf8");
		const tuongDoi = relative(goc, tep);
		for (const thuTuc of THU_TUC) {
			const moc = `${thuTuc}.mutationOptions(`;
			let i = chu.indexOf(moc);
			while (i !== -1) {
				const khoa = `${tuongDoi}#${thuTuc}`;
				if (!BANG.some(([t, tt]) => `${t}#${tt}` === khoa))
					loi.push(`gy-lm: duong doi giai doan chua khai ${tuongDoi}`);
				else {
					const khoi = khoiDoiSo(chu, i + moc.length - 1);
					if (!khoi.includes("cache.deal("))
						loi.push(`gy-lm: duong khong lam moi cache.deal ${tuongDoi}`);
					daThay.set(khoa, true);
				}
				i = chu.indexOf(moc, i + moc.length);
			}
		}
	}
	let daKiem = 0;
	for (const [tep, thuTuc] of BANG) {
		if (daThay.has(`${tep}#${thuTuc}`)) daKiem += 1;
		else loi.push(`gy-lm: duong da khai khong con ${tep}`);
	}
	if (daKiem !== BANG.length && loi.length === 0)
		loi.push("gy-lm: bang thieu o");
	return { loi, daKiem };
}

function cayGia(sua) {
	const goc = mkdtempSync(join(tmpdir(), "gy-lm-duong-"));
	for (const [tep] of BANG) {
		const dich = join(goc, tep);
		mkdirSync(dirname(dich), { recursive: true });
		writeFileSync(dich, readFileSync(join(GOC, tep), "utf8"));
	}
	sua(goc);
	return goc;
}

if (process.argv.includes("--tu-thu")) {
	const ca = [
		["lanh", () => {}, null],
		[
			"bo cache.deal",
			(g) => {
				const t = join(g, BANG[0][0]);
				writeFileSync(
					t,
					readFileSync(t, "utf8").replace(
						"await cache.deal(dealId);",
						"await Promise.resolve(dealId);",
					),
				);
			},
			"gy-lm: duong khong lam moi cache.deal",
		],
		[
			"them duong ngoai bang",
			(g) => {
				const t = join(g, "apps/app/components/crm/doi-giai-doan-moi.tsx");
				writeFileSync(
					t,
					"const m = useMutation(trpc.deals.setStage.mutationOptions({ onSuccess: () => cache.deal() }));\n",
				);
			},
			"gy-lm: duong doi giai doan chua khai",
		],
	];
	const hong = [];
	for (const [ten, sua, ghim] of ca) {
		const g = cayGia(sua);
		const { loi } = quet(g);
		rmSync(g, { recursive: true, force: true });
		const dung =
			ghim === null ? loi.length === 0 : loi.some((l) => l.startsWith(ghim));
		console.log(
			`tu thu ${ten}: ${dung ? "dung" : "SAI"} — ${loi.join(" | ") || "khong loi"}`,
		);
		if (!dung) hong.push(ten);
	}
	if (hong.length > 0) {
		console.log(`tu thu hong: ${hong.join(", ")}`);
		process.exit(2);
	}
	console.log("tu thu: 3/3 ca dung");
	process.exit(0);
}

const { loi, daKiem } = quet(GOC);
for (const l of loi) console.log(l);
console.log(
	`duong-doi-giai-doan: da kiem ${daKiem}/${BANG.length} noi, ${loi.length} loi`,
);
process.exit(loi.length === 0 ? 0 : 1);
