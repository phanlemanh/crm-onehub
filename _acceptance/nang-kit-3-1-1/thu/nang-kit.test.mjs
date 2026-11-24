import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { pathToFileURL } from "node:url";
import {
	GOC,
	LOI,
	SLUG,
	THE,
	THE_SHA,
	capVong,
	danhSachChep,
	docKho,
	docKit,
	docTai,
	git,
	giaiNenKit,
	kitGit,
	tepCuaVong,
	thuMucTam,
} from "../rang/kit.mjs";
import {
	docGioiHan,
	docT1,
	kiemCho,
	kiemDiff,
	kiemLopChep,
	kiemLuongGom,
	kiemPhanLoai,
	kiemPhien,
	kiemT1,
	kiemTenSong,
	laSoKeLai,
	soDoiChung,
	xetLuoiPr,
} from "../rang/luat.mjs";
import { ungVien } from "../rang/ung-vien.mjs";

const CAP = capVong();
const MB = CAP.nen;
const DS = danhSachChep();
const docKitLoi = (p) => docKit(`${LOI}/${p}`);
const docKhoTru = (thay, bo = []) => (d) => {
	if (bo.includes(d)) throw new Error(`ENOENT ${d}`);
	return d in thay ? thay[d] : docKho(d);
};

function cacheGia(plugin, phienBan) {
	const goc = thuMucTam(`cache-${plugin}`);
	const ra = giaiNenKit(`plugins/${plugin}`, join(goc, "x"));
	const dich = join(goc, "cache", "delivery-loop", plugin, phienBan);
	mkdirSync(join(goc, "cache", "delivery-loop", plugin), { recursive: true });
	renameSync(ra, dich);
	return { cache: join(goc, "cache"), dich };
}

function giai(doiSo) {
	return spawnSync("node", [join(GOC, "scripts", "resolve-plugin.mjs"), ...doiSo], { encoding: "utf8" });
}

describe("AC-1", () => {
	test("AC-1 «kit đọc đúng commit của thẻ v3.1.1, không phải đối tượng thẻ»", () => {
		assert.equal(git(kitGit(), "rev-parse", `${THE}^{commit}`).trim(), THE_SHA);
		assert.notEqual(git(kitGit(), "rev-parse", THE).trim(), THE_SHA);
	});

	test("AC-1 «lớp CI chép khớp từng byte bản v3.1.1»: vật thật xanh, hai bản phá đỏ", () => {
		assert.equal(DS.length, 39);
		assert.ok(DS.some((x) => x.dich === "scripts/tro-ly-quyet-dinh.cjs"));
		assert.deepEqual(kiemLopChep(DS, docKho, docKitLoi), []);
		const pm = "scripts/product-map.mjs";
		assert.deepEqual(kiemLopChep(DS, docKhoTru({ [pm]: `${docKho(pm)} ` }), docKitLoi), [`lệch bản ${THE}: ${pm}`]);
		const tl = "scripts/tro-ly-quyet-dinh.cjs";
		assert.deepEqual(kiemLopChep(DS, docKhoTru({}, [tl]), docKitLoi), [`thiếu: ${tl}`]);
		assert.notEqual(docTai(MB, "lib/workspace-record.cjs"), docKitLoi("lib/workspace-record.cjs"));
	});

	test("AC-1 «resolve-plugin.mjs khớp bản feature-loop v3.1.1»", () => {
		assert.equal(docKho("scripts/resolve-plugin.mjs"), docKit("plugins/feature-loop/scripts/resolve-plugin.mjs"));
	});

	test("AC-1 «t1_skip_globs liệt đủ 39 đích»: vật thật xanh, bản phá đỏ", () => {
		const globs = docT1(docKho("_acceptance/config.yaml"));
		assert.deepEqual(kiemT1(globs, DS), []);
		const tl = "scripts/tro-ly-quyet-dinh.cjs";
		assert.deepEqual(kiemT1(globs.filter((g) => g !== tl), DS), [`t1_skip_globs thiếu: ${tl}`]);
		assert.deepEqual(kiemT1(docT1(docTai(MB, "_acceptance/config.yaml")), DS), [`t1_skip_globs thiếu: ${tl}`]);
	});
});

describe("AC-2", () => {
	const YML = ".github/workflows/tin-hieu-gom.yml";

	test("AC-2 «tin-hieu-gom.yml kéo thẻ v3.1.1, phần còn lại bằng nhánh chính»: vật thật xanh, ba bản phá đỏ", () => {
		const moi = docKho(YML);
		const cu = docTai(MB, YML);
		assert.deepEqual(kiemLuongGom(moi, cu), []);
		assert.deepEqual(kiemLuongGom(cu, cu), [`KIT_REF phải đúng một dòng ${THE} (thấy v3.0.0)`]);
		const hai = moi.replace(/^(\s*KIT_REF:.*)$/m, "$1\n$1");
		assert.deepEqual(kiemLuongGom(hai, cu), [`KIT_REF phải đúng một dòng ${THE} (thấy ${THE},${THE})`]);
		const khac = moi.replace("bun install --frozen-lockfile", "bun install");
		assert.deepEqual(kiemLuongGom(khac, cu), ["tin-hieu-gom.yml đổi ngoài dòng KIT_REF"]);
	});

	test("AC-2 «bộ giải kit của phiên gom và của kiểm chéo đêm ra bản 3.1.1»: vật thật xanh, đối chứng đỏ", async () => {
		const { GOM } = await import(pathToFileURL(join(GOC, "scripts", "tin-hieu", "gom-cau-hinh.ts")).href);
		const ag = cacheGia("acceptance-gate", "3.1.1");
		const doiSo = GOM.kit.giai.slice(1);
		const r = giai([...doiSo, "--cache-root", ag.cache]);
		assert.equal(r.status, 0, r.stderr);
		assert.equal(r.stdout.trim(), ag.dich);
		const rong = thuMucTam("cache-rong");
		const rDo = giai([...doiSo, "--cache-root", rong]);
		assert.equal(rDo.status, 1);
		assert.match(rDo.stderr, /no usable install of "acceptance-gate"/);
		const { KIEM_CHEO } = await import(pathToFileURL(join(GOC, "scripts", "kiem-cheo", "cau-hinh.mjs")).href);
		const g = KIEM_CHEO.goiDieuPhoi;
		const dp = cacheGia("dispatch", "3.1.1");
		const r2 = giai(["--plugin", g.plugin, ...g.can.flatMap((t) => ["--require", t]), "--cache-root", dp.cache]);
		assert.equal(r2.status, 0, r2.stderr);
		assert.equal(r2.stdout.trim(), dp.dich);
	});
});

describe("AC-3", () => {
	const ST = ".claude/settings.json";

	test("AC-3 «settings chỉ đổi ref chợ sang v3.1.1»: vật thật xanh, ba bản phá đỏ", () => {
		const moi = JSON.parse(docKho(ST));
		const cu = JSON.parse(docTai(MB, ST));
		assert.deepEqual(kiemPhien(moi, cu), []);
		assert.deepEqual(kiemPhien(cu, cu), [`ref của chợ delivery-loop phải là ${THE} (thấy v3.0.0)`]);
		const quyen = structuredClone(moi);
		quyen.permissions = { ...(quyen.permissions ?? {}), allow: [...(quyen.permissions?.allow ?? []), "Bash(ls:*)"] };
		assert.deepEqual(kiemPhien(quyen, cu), ["settings đổi ngoài ref chợ: permissions"]);
		const tat = structuredClone(moi);
		tat.enabledPlugins["knowledge@delivery-loop"] = false;
		assert.deepEqual(kiemPhien(tat, cu), ["settings đổi ngoài ref chợ: enabledPlugins"]);
		const dao = Object.fromEntries(Object.entries(moi).reverse());
		assert.deepEqual(kiemPhien(dao, cu), ["settings đổi thứ tự khoá"]);
	});

	test("AC-3 «chợ của thẻ mang tên delivery-loop và đủ sáu plugin đang bật»: vật thật xanh, bản phá đỏ", () => {
		const mk = JSON.parse(docKit(".claude-plugin/marketplace.json"));
		const bat = Object.entries(JSON.parse(docKho(ST)).enabledPlugins)
			.filter(([k, v]) => v === true && k.endsWith("@delivery-loop"))
			.map(([k]) => k.split("@")[0]);
		assert.equal(bat.length, 6);
		assert.deepEqual(kiemCho(mk, bat), []);
		const thieu = { ...mk, plugins: mk.plugins.filter((p) => p.name !== "roadmap") };
		assert.deepEqual(kiemCho(thieu, bat), ["chợ của thẻ không có plugin roadmap"]);
	});
});

describe("AC-4", () => {
	const coChu = (sha) =>
		(sha ? git(GOC, "grep", "-l", "-F", "v3.0.0", sha) : git(GOC, "grep", "-l", "-F", "v3.0.0"))
			.split("\n")
			.filter(Boolean)
			.map((t) => (sha ? t.slice(sha.length + 1) : t));

	test("AC-4 «không tệp sống nào còn chữ v3.0.0»: vật thật xanh, bản cấy đỏ", () => {
		const ds = coChu();
		assert.deepEqual(kiemTenSong(ds), []);
		assert.ok(ds.includes("_acceptance/chuyen-cho-delivery-loop-3-0/contract.md"));
		assert.ok(ds.includes(`_acceptance/${SLUG}/contract.md`));
		assert.ok(laSoKeLai(`_acceptance/${SLUG}/contract.md`));
		assert.ok(!laSoKeLai("_acceptance/config.yaml"));
		assert.deepEqual(kiemTenSong([...ds, ".github/workflows/tin-hieu-gom.yml", "CLAUDE.md"]), [
			"tệp sống còn v3.0.0: .github/workflows/tin-hieu-gom.yml",
			"tệp sống còn v3.0.0: CLAUDE.md",
		]);
		assert.deepEqual(kiemTenSong(coChu(MB)).sort(), [
			"tệp sống còn v3.0.0: .claude/settings.json",
			"tệp sống còn v3.0.0: .github/workflows/tin-hieu-gom.yml",
		]);
	});
});

describe("AC-5", () => {
	const du = "rules ran=9 declared-off=0 expected=9";
	const nen = `${du}\nOK [a]\nOK [b]\n`;

	test("AC-5 «hàm so đối chứng»: cùng tập OK xanh; lệch, VIOLATION, thiếu luật, hồ sơ thôi OK, VIOLATION ngoài vòng đều đỏ đúng thông điệp", () => {
		const dau = (van) => ({ van, slug: SLUG });
		assert.deepEqual(soDoiChung({ nenCu: nen, nenMoi: nen, dau: dau(`${nen}VIOLATION [${SLUG}]: x\n`) }).loi, []);
		assert.deepEqual(soDoiChung({ nenCu: nen, nenMoi: `${du}\nOK [a]\n`, dau: dau(nen) }).loi, [
			"tập OK của hai lớp chép trên merge-base lệch",
		]);
		assert.deepEqual(soDoiChung({ nenCu: `${nen}VIOLATION [a]: x\n`, nenMoi: nen, dau: dau(nen) }).loi, ["merge-base có VIOLATION"]);
		assert.deepEqual(soDoiChung({ nenCu: "OK [a]\nOK [b]\n", nenMoi: nen, dau: dau(nen) }).loi, [
			"lớp chép nhánh chính: lưới không chạy đủ luật",
		]);
		assert.deepEqual(soDoiChung({ nenCu: nen, nenMoi: nen, dau: dau(`${du}\nOK [a]\n`) }).loi, ["hồ sơ thôi OK trên HEAD: b"]);
		assert.deepEqual(soDoiChung({ nenCu: nen, nenMoi: nen, dau: dau(`${nen}VIOLATION [PR]: x\n`) }).loi, [
			"VIOLATION ngoài vòng trên HEAD: 1",
		]);
	});

	test("AC-5 «lưới chế độ PR chỉ báo hồ sơ của vòng»: của vòng xanh, hồ sơ khác đỏ", () => {
		assert.deepEqual(xetLuoiPr(`VIOLATION [${SLUG}]: verdict=REJECT\nOK [a]\n`).loi, []);
		assert.equal(xetLuoiPr(`VIOLATION [${SLUG}]: x\n`).cuaVong, 1);
		assert.deepEqual(xetLuoiPr("VIOLATION [chuyen-cho-delivery-loop-3-0]: stale\n").loi, [
			"lưới PR báo hồ sơ khác vòng: chuyen-cho-delivery-loop-3-0",
		]);
		assert.deepEqual(xetLuoiPr("VIOLATION [PR]: code ngoài hồ sơ\n").loi, ["lưới PR báo hồ sơ khác vòng: PR"]);
	});
});

describe("AC-6", () => {
	test("AC-6 «làn khô khớp diff, xếp lớp đúng, gioi-han khớp đỏ vì vòng»: vật thật xanh, bốn bản phá đỏ", () => {
		const pl = JSON.parse(docKho(`_acceptance/${SLUG}/evidence/phan-loai.json`));
		const cay = (sha) =>
			git(GOC, "ls-tree", "-r", sha)
				.split("\n")
				.filter((d) => d && !d.split("\t")[1].startsWith("_acceptance/"))
				.join("\n");
		const suy = ungVien(GOC, tepCuaVong(CAP), SLUG).ungVien.map((r) => `${r.ho_so}/${r.eval}`);
		const gioiHan = docGioiHan(docKho(`_acceptance/${SLUG}/contract.md`));
		const goc = { pl, ungVienSuy: suy, gioiHan, cayTip: cay(pl.sha_tip), cayDau: cay("HEAD"), nen: MB };
		assert.ok(suy.length > 0);
		assert.deepEqual(kiemPhanLoai(goc), []);
		assert.deepEqual(kiemPhanLoai({ ...goc, cayTip: cay(MB) }), ["làn khô không chạy trên cây HEAD"]);
		const xanhChinh = Object.keys(pl.tip).find((e) => pl.nhanh_chinh[e]?.dat);
		assert.ok(xanhChinh, "làn khô có ít nhất một eval chạy trên nhánh chính và xanh");
		const pha = structuredClone(pl);
		pha.tip[xanhChinh] = { ma: 1, dat: false };
		pha.lop[xanhChinh] = "do-ca-hai";
		assert.ok(kiemPhanLoai({ ...goc, pl: pha }).includes(`${xanhChinh}: xếp đỏ cả hai bên mà nhánh chính xanh`));
		assert.deepEqual(kiemPhanLoai({ ...goc, ungVienSuy: suy.slice(1) }), ["ứng viên lệch tập suy từ diff"]);
		assert.deepEqual(kiemPhanLoai({ ...goc, gioiHan: [...gioiHan, "khong-co/E1"] }), ["gioi-han không khớp đỏ vì vòng"]);
	});
});

describe("AC-7", () => {
	test("AC-7 «diff từ nhánh chính chỉ chạm tệp viết trước»: vật thật 0 tệp lạ, bản cấy đỏ", () => {
		const doi = tepCuaVong(CAP);
		assert.ok(doi.length > 0);
		assert.deepEqual(kiemDiff(doi), []);
		assert.deepEqual(kiemDiff([...doi, "packages/core/src/agreements.ts", "_acceptance/chuyen-cho-delivery-loop-3-0/evals.yaml"]), [
			"tệp ngoài danh sách: packages/core/src/agreements.ts",
			"tệp ngoài danh sách: _acceptance/chuyen-cho-delivery-loop-3-0/evals.yaml",
		]);
	});
});
