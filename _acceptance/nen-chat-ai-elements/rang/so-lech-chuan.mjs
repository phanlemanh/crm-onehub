#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_RANG = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_RANG);
const GOC = resolve(HERE, "..", "..", "..");
const HO_SO = resolve(HERE, "..");
const THU_MUC = join(GOC, "packages", "ui", "src", "components", "ai-elements");
const TEP_SO = join(HO_SO, "so-lech-chuan.md");
const COMPONENTS_JSON = join(GOC, "packages", "ui", "components.json");

const NHAN = {
	tep: "**Tệp:**",
	doiGi: "**Đổi gì:**",
	viSao: "**Vì sao:**",
	soDong: "**Số dòng khác:**",
	vanTay: "**Vân tay lệch:**",
};

const BA_PHAN = [
	["tep", NHAN.tep],
	["doiGi", NHAN.doiGi],
	["viSao", NHAN.viSao],
];

const LENH_THEM = ["bunx", "--bun", "ai-elements@latest", "add"];
const LENH_THEM_CHU = LENH_THEM.join(" ");
const TIEU_DE_GHI_DE = "## Chạy lại lệnh thêm sẽ ghi đè im lặng";
const TIEU_DE_BUOC = "## Sau mỗi lần kéo bản mới";
const SO_BUOC_TOI_THIEU = 4;
const SO_CHU_TOI_THIEU = 10;
const LUAT_CHAT = join(GOC, "docs", "chat-ui.md");
const HINH_CONG = join(GOC, ".githooks", "gate-shape.json");
const TEP_CLI_SUA = ["packages/ui/package.json", "bun.lock"];
const THU_MUC_TUONG_DOI = "packages/ui/src/components/ai-elements";

function boCuoc(dong) {
	console.error("");
	for (const d of dong) console.error(d);
	console.error("");
	process.exit(2);
}

function doc(duong) {
	return readFileSync(duong, "utf8");
}

function locTham() {
	const chi = [];
	const doiSo = process.argv.slice(2);
	for (let i = 0; i < doiSo.length; i += 1) {
		if (doiSo[i] === "--tep") {
			const ten = doiSo[i + 1];
			if (!ten) boCuoc(["--tep cần một tên tệp đi kèm, ví dụ --tep conversation.tsx"]);
			chi.push(ten.endsWith(".tsx") ? ten : `${ten}.tsx`);
			i += 1;
			continue;
		}
		boCuoc([`tham số lạ: ${doiSo[i]}`]);
	}
	return chi;
}

function tepTrongCay() {
	let muc;
	try {
		muc = readdirSync(THU_MUC, { withFileTypes: true });
	} catch {
		return null;
	}
	return muc
		.filter((d) => d.isFile() && d.name.endsWith(".tsx"))
		.map((d) => d.name)
		.sort();
}

function dungSanTam(ten) {
	const tam = mkdtempSync(join(tmpdir(), "so-lech-chuan-"));
	mkdirSync(join(tam, "src", "styles"), { recursive: true });
	mkdirSync(join(tam, "src", "components"), { recursive: true });
	writeFileSync(join(tam, "src", "styles", "globals.css"), "");
	writeFileSync(
		join(tam, "package.json"),
		`${JSON.stringify({ name: "so-lech-chuan-san-tam", private: true, type: "module" }, null, 2)}\n`,
	);
	writeFileSync(
		join(tam, "tsconfig.json"),
		`${JSON.stringify({ compilerOptions: { baseUrl: ".", paths: { "@crm/ui/*": ["./src/*"] } } }, null, 2)}\n`,
	);
	copyFileSync(COMPONENTS_JSON, join(tam, "components.json"));
	const chay = spawnSync(
		LENH_THEM[0],
		[...LENH_THEM.slice(1), ...ten.map((t) => t.replace(/\.tsx$/, ""))],
		{ cwd: tam, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
	);
	return { tam, chay };
}

function tach(chu) {
	return chu.split("\n");
}

function lech(cu, moi) {
	const a = tach(cu);
	const b = tach(moi);
	const n = a.length;
	const m = b.length;
	const bang = new Int32Array((n + 1) * (m + 1));
	for (let i = n - 1; i >= 0; i -= 1) {
		for (let j = m - 1; j >= 0; j -= 1) {
			bang[i * (m + 1) + j] =
				a[i] === b[j]
					? bang[(i + 1) * (m + 1) + j + 1] + 1
					: Math.max(bang[(i + 1) * (m + 1) + j], bang[i * (m + 1) + j + 1]);
		}
	}
	const ra = [];
	let i = 0;
	let j = 0;
	while (i < n && j < m) {
		if (a[i] === b[j]) {
			i += 1;
			j += 1;
			continue;
		}
		if (bang[(i + 1) * (m + 1) + j] >= bang[i * (m + 1) + j + 1]) {
			ra.push(`-${a[i]}`);
			i += 1;
			continue;
		}
		ra.push(`+${b[j]}`);
		j += 1;
	}
	while (i < n) {
		ra.push(`-${a[i]}`);
		i += 1;
	}
	while (j < m) {
		ra.push(`+${b[j]}`);
		j += 1;
	}
	return ra;
}

function vanTay(dong) {
	return createHash("sha256").update(dong.join("\n")).digest("hex").slice(0, 16);
}

function docSo() {
	if (!existsSync(TEP_SO)) {
		boCuoc([
			`KHÔNG ĐO ĐƯỢC: không có sổ lệch chuẩn ở ${relative(GOC, TEP_SO)}.`,
			"AC-8 đòi một sổ; không có sổ thì phép đo không có vế để đối chiếu.",
		]);
	}
	const chu = doc(TEP_SO);
	const dong = tach(chu);
	const muc = new Map();
	let dangMo = null;
	for (const d of dong) {
		const dau = /^###\s+(\S+\.tsx)\s*$/.exec(d);
		if (dau) {
			dangMo = { ten: dau[1], than: [] };
			muc.set(dau[1], dangMo);
			continue;
		}
		if (/^##\s+/.test(d)) {
			dangMo = null;
			continue;
		}
		if (dangMo) dangMo.than.push(d);
	}
	return { chu, muc };
}

function phanTrong(than, nhan) {
	for (const d of than) {
		const at = d.indexOf(nhan);
		if (at === -1) continue;
		const sau = d.slice(at + nhan.length).trim();
		if (sau !== "") return sau;
	}
	return "";
}

const chiTep = locTham();
const tep = tepTrongCay();
if (tep === null) {
	boCuoc([
		`KHÔNG ĐO ĐƯỢC: không đọc được ${relative(GOC, THU_MUC)}.`,
		"Không có tập quan sát thì không có tập lệch.",
	]);
}
if (tep.length === 0) {
	boCuoc([
		`KHÔNG ĐO ĐƯỢC: ${relative(GOC, THU_MUC)} không có tệp .tsx nào.`,
		"Tập rỗng không phải là không lệch.",
	]);
}

const canXet = chiTep.length > 0 ? chiTep : tep;
const thieuTrongCay = canXet.filter((t) => !tep.includes(t));
if (thieuTrongCay.length > 0) {
	boCuoc([
		`KHÔNG ĐO ĐƯỢC: --tep gọi tên ${thieuTrongCay.join(", ")}, không có trong ${relative(GOC, THU_MUC)}.`,
	]);
}

if (!existsSync(COMPONENTS_JSON)) {
	boCuoc([
		`KHÔNG ĐO ĐƯỢC: không có ${relative(GOC, COMPONENTS_JSON)}, nên CLI không biết ghi bản tươi theo lối nào.`,
	]);
}

const san = dungSanTam(canXet);
let banTuoi = new Map();
try {
	const loi = `${san.chay.stdout ?? ""}${san.chay.stderr ?? ""}`.trim();
	if (san.chay.error) {
		boCuoc([
			`KHÔNG ĐO ĐƯỢC: không chạy được bunx ai-elements@latest — ${san.chay.error.message}`,
			"CLI hỏng KHÔNG được đọc là “không tệp nào lệch”.",
		]);
	}
	if (san.chay.status !== 0) {
		boCuoc([
			`KHÔNG ĐO ĐƯỢC: bunx ai-elements@latest add thoát mã ${san.chay.status}.`,
			"Thường là mạng hoặc quyền. CLI hỏng KHÔNG được đọc là “không tệp nào lệch”.",
			"",
			loi.split("\n").slice(-12).join("\n"),
		]);
	}
	for (const t of canXet) {
		const duong = join(san.tam, "src", "components", "ai-elements", t);
		if (!existsSync(duong)) {
			boCuoc([
				`KHÔNG ĐO ĐƯỢC: CLI chạy xong nhưng không ghi ${t} vào sân tạm.`,
				"Không có bản thượng nguồn để so thì không có tập lệch.",
			]);
		}
		banTuoi.set(t, doc(duong));
	}
} finally {
	rmSync(san.tam, { recursive: true, force: true });
}

const doDuoc = new Map();
for (const t of canXet) {
	const dongLech = lech(banTuoi.get(t), doc(join(THU_MUC, t)));
	doDuoc.set(t, { soDong: dongLech.length, vanTay: vanTay(dongLech) });
}

const so = docSo();
const tapLech = canXet.filter((t) => doDuoc.get(t).soDong > 0);
const tapMuc = [...so.muc.keys()].filter((t) => chiTep.length === 0 || chiTep.includes(t));

console.log("RĂNG SỔ LỆCH CHUẨN");
console.log(`Gốc kho: ${GOC}`);
console.log(`Sổ: ${relative(GOC, TEP_SO)}`);
console.log(
	`Bản tươi: bunx --bun ai-elements@latest add ${canXet.map((t) => t.replace(/\.tsx$/, "")).join(" ")} (sân tạm, đã xoá)`,
);
console.log("");
console.log(`Đo bản tươi so bản trong cây — ${canXet.length} tệp:`);
for (const t of canXet) {
	const d = doDuoc.get(t);
	console.log(
		`   ${t}: ${d.soDong} dòng khác · vân tay ${d.vanTay}${d.soDong === 0 ? " · không lệch" : ""}`,
	);
}
console.log("");
console.log(`Tệp lệch đo được (${tapLech.length}): ${tapLech.join(", ") || "—"}`);
console.log(`Mục trong sổ (${tapMuc.length}): ${tapMuc.join(", ") || "—"}`);
console.log("");

const van = [];

for (const t of tapLech) {
	if (!so.muc.has(t)) {
		van.push(
			`THIẾU MỤC: ${t} lệch ${doDuoc.get(t).soDong} dòng so bản thượng nguồn nhưng không có mục nào trong sổ — thêm một mục "### ${t}" đủ ba phần.`,
		);
	}
}

for (const t of tapMuc) {
	if (doDuoc.get(t) && doDuoc.get(t).soDong === 0) {
		van.push(
			`MỤC THỪA: ${t} có mục trong sổ nhưng bản trong cây trùng bản thượng nguồn ở mọi dòng — xoá mục "### ${t}".`,
		);
		continue;
	}
	if (!doDuoc.has(t)) {
		van.push(
			`MỤC THỪA: ${t} có mục trong sổ nhưng không có tệp đó trong ${relative(GOC, THU_MUC)} — xoá mục "### ${t}".`,
		);
	}
}

for (const [ten, muc] of so.muc) {
	if (chiTep.length > 0 && !chiTep.includes(ten)) continue;
	for (const [, nhan] of BA_PHAN) {
		if (phanTrong(muc.than, nhan) === "") {
			van.push(`MỤC KHUYẾT: "### ${ten}" thiếu phần ${nhan.replace(/\*/g, "")}`);
		}
	}
	const d = doDuoc.get(ten);
	if (!d || d.soDong === 0) continue;
	const khaiDong = phanTrong(muc.than, NHAN.soDong);
	const khaiVanTay = phanTrong(muc.than, NHAN.vanTay);
	if (khaiDong === "" || khaiVanTay === "") {
		van.push(
			`MỤC KHUYẾT: "### ${ten}" thiếu ${khaiDong === "" ? NHAN.soDong.replace(/\*/g, "") : ""}${khaiDong === "" && khaiVanTay === "" ? " và " : ""}${khaiVanTay === "" ? NHAN.vanTay.replace(/\*/g, "") : ""} — hai phần này là chỗ sổ chịu chiều đỏ`,
		);
		continue;
	}
	const soKhai = Number.parseInt(khaiDong.replace(/[^0-9]/g, ""), 10);
	if (soKhai !== d.soDong) {
		van.push(
			`SỐ LỆCH SAI: ${ten} — sổ khai ${soKhai} dòng khác, đo được ${d.soDong}. Bản trong cây hoặc bản thượng nguồn đã đổi mà sổ chưa đọc lại.`,
		);
	}
	const vanTayKhai = (/[0-9a-f]{8,}/.exec(khaiVanTay) ?? [""])[0];
	if (vanTayKhai !== d.vanTay) {
		van.push(
			`VÂN TAY SAI: ${ten} — sổ khai ${vanTayKhai || "(không đọc được)"}, đo được ${d.vanTay}. Đọc lại diff của ${ten} rồi cập nhật mục, đừng chỉ sửa con số.`,
		);
	}
}

function thanMuc(chu, tieuDe) {
	const dong = tach(chu);
	const dau = dong.findIndex((d) => d.trim() === tieuDe);
	if (dau === -1) return null;
	const than = [];
	for (let i = dau + 1; i < dong.length; i += 1) {
		if (/^##\s+/.test(dong[i])) break;
		than.push(dong[i]);
	}
	return than;
}

function docBuoc(than) {
	const buoc = [];
	let dangMo = null;
	for (const d of than) {
		const dau = /^\s*(\d+)\.\s+(.*)$/.exec(d);
		if (dau) {
			dangMo = { so: Number(dau[1]), dong: [dau[2]] };
			buoc.push(dangMo);
			continue;
		}
		if (dangMo && d.trim() !== "") dangMo.dong.push(d.trim());
	}
	return buoc.map((b) => ({ so: b.so, chu: b.dong.join(" ").trim() }));
}

function demChu(chu) {
	return chu
		.replace(/`[^`]*`/g, " ")
		.replace(/[*_#>-]/g, " ")
		.split(/\s+/)
		.filter((t) => /\p{L}/u.test(t)).length;
}

function vatThat() {
	const can = [];

	can.push({
		can: LENH_THEM_CHU,
		vi_sao: `lệnh thêm mà chính răng này chạy, và ${relative(GOC, LUAT_CHAT)} kê ở Rule 2`,
	});

	can.push({
		can: relative(GOC, TEP_RANG),
		vi_sao: "chính răng đọc sổ này; không nêu thì không ai biết chạy lại cái gì",
	});

	can.push({
		can: THU_MUC_TUONG_DOI,
		vi_sao: "thư mục mang bốn tệp vendored, nơi bản vá phải chép lại vào",
	});

	for (const t of TEP_CLI_SUA) {
		can.push({ can: t, vi_sao: "tệp mà lệnh thêm tự sửa, phải hoàn nguyên tay" });
	}

	for (const c of JSON.parse(doc(HINH_CONG)).checkers) {
		can.push({
			can: `bun run ${c.id}`,
			vi_sao: `lệnh cổng khai ở ${relative(GOC, HINH_CONG)}`,
		});
	}

	return can;
}

if (chiTep.length === 0) {
	for (const duong of [LUAT_CHAT, HINH_CONG, ...TEP_CLI_SUA.map((t) => join(GOC, t)), join(GOC, THU_MUC_TUONG_DOI)]) {
		if (!existsSync(duong)) {
			boCuoc([
				`KHÔNG ĐO ĐƯỢC: ${relative(GOC, duong)} không còn trong kho.`,
				"Răng này kiểm sổ bằng quan hệ với vật có thật; vật mất thì phép đo không còn chỗ neo.",
			]);
		}
	}

	if (!doc(LUAT_CHAT).includes(LENH_THEM_CHU)) {
		boCuoc([
			`KHÔNG ĐO ĐƯỢC: ${relative(GOC, LUAT_CHAT)} không còn nêu lệnh "${LENH_THEM_CHU}".`,
			"Lệnh trong sổ phải là lệnh mà luật của kho kê; luật đổi thì sửa cả hai chỗ rồi chạy lại.",
		]);
	}

	const thanGhiDe = thanMuc(so.chu, TIEU_DE_GHI_DE);
	if (thanGhiDe === null) {
		van.push(
			`SỔ KHUYẾT: không có mục "${TIEU_DE_GHI_DE}" — AC-8 đòi sổ nói thành lời việc chạy lại lệnh thêm sẽ ghi đè bản vá, và nói ở đúng mục của nó.`,
		);
	} else {
		const chuGhiDe = thanGhiDe.join(" ");
		if (!chuGhiDe.includes(LENH_THEM_CHU)) {
			van.push(
				`SỔ KHUYẾT: mục "${TIEU_DE_GHI_DE}" không nêu lệnh thật "${LENH_THEM_CHU}" — răng này chạy đúng lệnh đó và ${relative(GOC, LUAT_CHAT)} kê đúng lệnh đó. Cảnh báo không gọi tên thứ gây hại thì không ai tránh được nó.`,
			);
		}
		const cauCanhBao = chuGhiDe
			.split(/(?<=[.!?])\s+/)
			.filter(
				(c) =>
					c.includes("ghi đè") &&
					(c.includes("không hỏi") ||
						c.includes("không báo") ||
						c.includes("im lặng")),
			);
		if (cauCanhBao.length === 0) {
			van.push(
				`SỔ KHUYẾT: mục "${TIEU_DE_GHI_DE}" không có câu nào vừa nói "ghi đè" vừa nói việc đó xảy ra không hỏi, không báo. Tiêu đề một mục không phải là lời cảnh báo.`,
			);
		}
	}

	const thanBuoc = thanMuc(so.chu, TIEU_DE_BUOC);
	if (thanBuoc === null) {
		van.push(
			`SỔ KHUYẾT: không có mục "${TIEU_DE_BUOC}" — AC-8 đòi liệt kê các bước sau mỗi lần kéo bản mới.`,
		);
	} else {
		const buoc = docBuoc(thanBuoc);
		if (buoc.length < SO_BUOC_TOI_THIEU) {
			van.push(
				`SỔ KHUYẾT: mục "${TIEU_DE_BUOC}" chỉ có ${buoc.length} bước đánh số, cần ít nhất ${SO_BUOC_TOI_THIEU}.`,
			);
		}

		for (const b of buoc) {
			const soChu = demChu(b.chu);
			const coNeo = /`[^`]+`/.test(b.chu);
			if (soChu < SO_CHU_TOI_THIEU || !coNeo) {
				van.push(
					`BƯỚC RỖNG NGHĨA: bước ${b.so} có ${soChu} chữ và ${coNeo ? "" : "không "}nêu vật nào trong dấu nháy ngược — một bước phải nói làm gì (từ ${SO_CHU_TOI_THIEU} chữ) và gọi tên vật phải chạm.`,
				);
			}
		}

		const chuBuoc = buoc.map((b) => b.chu).join("\n");
		for (const v of vatThat()) {
			if (!chuBuoc.includes(v.can)) {
				van.push(
					`BƯỚC THIẾU VẬT: không bước nào nêu "${v.can}" — ${v.vi_sao}. Bước không gọi tên vật thì không ai làm lại được nó.`,
				);
			}
		}
	}
}

if (van.length > 0) {
	console.error(`RĂNG SỔ LỆCH CHUẨN ĐỎ — ${van.length} chỗ:`);
	for (const v of van) console.error(`  ${v}`);
	console.error("");
	process.exit(1);
}

console.log(
	`XANH: ${tapLech.length} tệp lệch, ${tapMuc.length} mục trong sổ, hai tập trùng nhau; mỗi mục đủ ba phần và khai đúng số dòng lẫn vân tay lệch.`,
);
process.exit(0);
