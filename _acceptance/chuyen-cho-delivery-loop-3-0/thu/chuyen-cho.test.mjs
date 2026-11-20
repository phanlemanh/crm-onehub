import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { pathToFileURL } from "node:url";
import {
	GOC,
	LOI,
	SLUG,
	THE,
	THE_SHA,
	coKit,
	danhSachChep,
	kitGit,
	docKho,
	docKit,
	docTai,
	git,
	giaiNenKit,
	NEN,
	capVong,
	tepCuaVong,
	thuMucTam,
} from "../rang/kit.mjs";
import {
	docT1,
	kiemCho,
	kiemConChepCu,
	kiemLopChep,
	kiemNapChepCu,
	kiemLuongGom,
	kiemMau,
	kiemPhanConLai,
	kiemPhien,
	kiemSkillGom,
	kiemT1,
	kiemTat,
	soDoiChung,
} from "../rang/luat.mjs";
import { kiemDiff, kiemGhim, kiemPhanLoai, docMucGhim } from "../rang/ghim.mjs";

const CAP = capVong();
const MB = CAP.nen;
const DS = danhSachChep();
const docKhoTru = (thay) => (d) => (d in thay ? thay[d] : docKho(d));

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
	test("AC-1 «lớp CI chép khớp từng byte bản v3.0.0»: vật thật xanh, hai bản phá đỏ", () => {
		assert.equal(DS.length, 38, "INIT-CI-COPY-LIST của 3.0.0 có 38 mục");
		const doc = (n) => docKit(`${LOI}/${n}`);
		assert.deepEqual(kiemLopChep(DS, docKho, doc), []);
		const lech = docKhoTru({ "scripts/pre-merge-check.sh": `${docKho("scripts/pre-merge-check.sh")}#` });
		assert.deepEqual(kiemLopChep(DS, lech, doc), [`lệch bản ${THE}: scripts/pre-merge-check.sh`]);
		const thieu = (d) => {
			if (d === "lib/ho-goi.cjs") throw new Error("ENOENT");
			return docKho(d);
		};
		assert.deepEqual(kiemLopChep(DS, thieu, doc), ["thiếu: lib/ho-goi.cjs"]);
	});

	test("AC-1 «resolve-plugin.mjs khớp bản feature-loop v3.0.0»", () => {
		const kit = docKit("plugins/feature-loop/scripts/resolve-plugin.mjs");
		assert.equal(docKho("scripts/resolve-plugin.mjs"), kit);
		assert.notEqual(docTai(NEN, "scripts/resolve-plugin.mjs"), kit, "đối chứng: bản nhánh chính khác bản 3.0.0");
	});

	test("AC-1 «không còn tệp chép cũ dưới dieu-phoi/, oxlint thôi trỏ nó»: vật thật xanh, bản phá đỏ", () => {
		const theoDoi = git(GOC, "ls-files").split("\n").filter(Boolean);
		assert.deepEqual(kiemConChepCu(theoDoi), []);
		assert.deepEqual(kiemConChepCu([...theoDoi, "dieu-phoi/scripts/dot.mjs"]), ["còn tệp chép cũ: dieu-phoi/scripts/dot.mjs"]);
		assert.ok(!docKho(".oxlintrc.json").includes("dieu-phoi/"), ".oxlintrc.json còn trỏ dieu-phoi/");
		assert.ok(docTai(NEN, ".oxlintrc.json").includes("dieu-phoi/scripts/**"), "đối chứng: nhánh chính có dòng ấy");
	});

	test("AC-1 «kit đọc đúng commit của thẻ v3.0.0, không phải đối tượng thẻ»", () => {
		const commit = git(kitGit(), "rev-parse", `${THE}^{commit}`).trim();
		const doiTuong = git(kitGit(), "rev-parse", THE).trim();
		assert.equal(commit, THE_SHA);
		assert.notEqual(doiTuong, THE_SHA, "đối chứng: đối tượng thẻ khác commit");
	});

	test("AC-1 «không mã nào nạp bản chép cũ dieu-phoi/scripts/»: vật thật xanh, bản cấy đỏ", () => {
		const tep = git(GOC, "ls-files", "*.mjs", "*.cjs", "*.js", "*.ts", "*.tsx").split("\n").filter((t) => t && !t.startsWith("_acceptance/"));
		assert.ok(tep.length > 500, `chỉ quét ${tep.length} tệp mã`);
		const nd = tep.map((t) => ({ tep: t, noiDung: readFileSync(join(GOC, t), "utf8") }));
		assert.deepEqual(kiemNapChepCu(nd), []);
		assert.deepEqual(kiemNapChepCu([{ tep: "scripts/tin-hieu.mjs", noiDung: "import { gocKhoChinh } from '../dieu-phoi/scripts/dot.mjs';" }]), [
			"nạp bản chép cũ: scripts/tin-hieu.mjs -> ../dieu-phoi/scripts/dot.mjs",
		]);
	});

	test("AC-1 «t1_skip_globs liệt đủ 38 đích, không còn đích cũ»: vật thật xanh, hai bản phá đỏ", () => {
		const globs = docT1(docKho("_acceptance/config.yaml"));
		assert.deepEqual(kiemT1(globs, DS), []);
		assert.deepEqual(kiemT1(globs.filter((g) => g !== "lib/ho-goi.cjs"), DS), ["t1_skip_globs thiếu: lib/ho-goi.cjs"]);
		assert.deepEqual(kiemT1([...globs, "dieu-phoi/scripts/dot.mjs"], DS), ["t1_skip_globs còn đích cũ: dieu-phoi/scripts/dot.mjs"]);
	});
});

describe("AC-2", () => {
	test("AC-2 «tin-hieu-gom.yml kéo delivery-loop v3.0.0»: vật thật xanh, bốn bản phá đỏ", () => {
		const txt = docKho(".github/workflows/tin-hieu-gom.yml");
		assert.deepEqual(kiemLuongGom(txt), []);
		assert.deepEqual(kiemLuongGom(txt.replace("KIT_REF: v3.0.0", "KIT_REF: v2.36.0")), ["KIT_REF phải đúng một dòng v3.0.0 (thấy v2.36.0)"]);
		assert.ok(kiemLuongGom(txt.replace("phanlemanh/delivery-loop \"", "phanlemanh/acceptance-gate-kit \"")).includes("còn chữ acceptance-gate-kit"));
		assert.deepEqual(kiemLuongGom(txt.replace("acceptance-gate@delivery-loop", "acceptance-gate@kho-khac")), [
			"thiếu dòng: claude plugin install acceptance-gate@delivery-loop",
		]);
		assert.ok(kiemLuongGom(`${txt}\n# acceptance-gate-kit\n`).includes("còn chữ acceptance-gate-kit"));
	});

	test("AC-2 «không tệp nào dưới .github/ còn tên kho kit cũ»", () => {
		const tep = git(GOC, "ls-files", ".github").split("\n").filter(Boolean);
		assert.ok(tep.length >= 9, `chỉ quét ${tep.length} tệp`);
		assert.deepEqual(tep.filter((t) => readFileSync(join(GOC, t), "utf8").includes("acceptance-gate-kit")), []);
	});

	test("AC-2 «bộ giải kit của phiên gom tìm được acceptance-gate 3.0.0, hai skill tên mới có trên kit»: vật thật xanh, đối chứng đỏ", async () => {
		const { GOM } = await import(pathToFileURL(join(GOC, "scripts", "tin-hieu", "gom-cau-hinh.ts")).href);
		const { cache, dich } = cacheGia("acceptance-gate", "3.0.0");
		const doiSo = GOM.kit.giai.slice(1);
		const r = giai([...doiSo, "--cache-root", cache]);
		assert.equal(r.status, 0, r.stderr);
		assert.equal(r.stdout.trim(), dich);
		const cu = doiSo.map((a) => (a === "skills/signal-intake/SKILL.md" ? "skills/gom-tin-hieu/SKILL.md" : a));
		assert.notDeepEqual(cu, doiSo, "đối chứng phải đổi đúng một --require");
		const rCu = giai([...cu, "--cache-root", cache]);
		assert.equal(rCu.status, 1);
		assert.match(rCu.stderr, /no usable install of "acceptance-gate"/);
		const loiDan = GOM.moHinh.loiDan([], { banGom: "x.md", lenh: [] });
		assert.deepEqual(kiemSkillGom(GOM.moHinh.skill, loiDan, coKit), []);
		assert.deepEqual(kiemSkillGom(["acceptance-gate:gom-tin-hieu"], "/acceptance-gate:gom-tin-hieu", coKit), [
			`skill không có trên kit ${THE}: acceptance-gate:gom-tin-hieu`,
			"lời dặn còn tên cũ: acceptance-gate:gom-tin-hieu",
		]);
	});
});

describe("AC-3 và AC-4", () => {
	const st = JSON.parse(docKho(".claude/settings.json"));
	test("AC-3 «phiên khai chợ delivery-loop v3.0.0, bật sáu plugin»: vật thật xanh, bốn bản phá đỏ", () => {
		assert.deepEqual(kiemPhien(st), []);
		const ban = () => structuredClone(st);
		const a = ban();
		a.extraKnownMarketplaces["acceptance-gate-kit"] = { source: { source: "github", repo: "phanlemanh/acceptance-gate-kit" } };
		assert.deepEqual(kiemPhien(a), ["chợ khai phải đúng delivery-loop (thấy delivery-loop,acceptance-gate-kit)"]);
		const b = ban();
		b.extraKnownMarketplaces["delivery-loop"].source.ref = "v2.39.0";
		assert.deepEqual(kiemPhien(b), ["ref của chợ phải là v3.0.0 (thấy v2.39.0)"]);
		const c = ban();
		delete c.enabledPlugins["knowledge@delivery-loop"];
		assert.deepEqual(kiemPhien(c), ["knowledge@delivery-loop chưa bật"]);
		const d = ban();
		d.enabledPlugins["roadmap@delivery-loop"] = false;
		assert.deepEqual(kiemPhien(d), ["roadmap@delivery-loop chưa bật"]);
	});

	test("AC-3 «chợ của thẻ mang tên delivery-loop và đủ sáu plugin đã bật»: vật thật xanh, bản phá đỏ", () => {
		const mk = JSON.parse(docKit(".claude-plugin/marketplace.json"));
		const bat = Object.keys(st.enabledPlugins).filter((k) => k.endsWith("@delivery-loop")).map((k) => k.split("@")[0]);
		assert.equal(bat.length, 6);
		assert.deepEqual(kiemCho(mk, bat), []);
		assert.deepEqual(kiemCho({ ...mk, name: "acceptance-gate-kit" }, bat), ["tên chợ ở marketplace.json của thẻ là acceptance-gate-kit, không phải delivery-loop"]);
		assert.deepEqual(kiemCho({ ...mk, plugins: mk.plugins.filter((p) => p.name !== "knowledge") }, bat), ["chợ của thẻ không có plugin knowledge"]);
	});

	test("AC-3 «phần còn lại của .claude/settings.json giữ nguyên so với nhánh chính»: vật thật xanh, bản phá đỏ", () => {
		const cu = JSON.parse(docTai(NEN, ".claude/settings.json"));
		assert.deepEqual(kiemPhanConLai(st, cu), []);
		const a = structuredClone(st);
		a.permissions = { ...(a.permissions ?? {}), allow: [...(a.permissions?.allow ?? []), "Bash(rm:*)"] };
		assert.deepEqual(kiemPhanConLai(a, cu), ["khoá permissions đổi so với nhánh chính"]);
		const b = structuredClone(st);
		b.enabledPlugins["superpowers@claude-plugins-official"] = false;
		assert.deepEqual(kiemPhanConLai(b, cu), ["plugin ngoài kit superpowers@claude-plugins-official đổi"]);
	});

	test("AC-4 «tắt đích danh đúng sáu plugin chợ cũ»: vật thật xanh, ba bản phá đỏ", () => {
		assert.deepEqual(kiemTat(st), []);
		const a = structuredClone(st);
		a.enabledPlugins["road-map@acceptance-gate-kit"] = true;
		assert.deepEqual(kiemTat(a), ["road-map@acceptance-gate-kit phải là false (thấy true)"]);
		const b = structuredClone(st);
		delete b.enabledPlugins["tri-thuc@acceptance-gate-kit"];
		assert.deepEqual(kiemTat(b), ["thiếu dòng tắt: tri-thuc@acceptance-gate-kit"]);
		const c = structuredClone(st);
		c.enabledPlugins["la@acceptance-gate-kit"] = false;
		assert.deepEqual(kiemTat(c), ["khoá chợ cũ lạ: la@acceptance-gate-kit"]);
	});
});

describe("AC-5", () => {
	test("AC-5 «kiểm chéo đêm giải gói dispatch của kit 3.0.0 và nạp được ba hàm»: vật thật xanh, đối chứng đỏ", async () => {
		const { KIEM_CHEO } = await import(pathToFileURL(join(GOC, "scripts", "kiem-cheo", "cau-hinh.mjs")).href);
		const g = KIEM_CHEO.goiDieuPhoi;
		assert.equal(g.plugin, "dispatch");
		assert.equal(g.lenhCai, "claude plugin install dispatch@delivery-loop --scope project");
		const { cache, dich } = cacheGia("dispatch", "3.0.0");
		const r = giai(["--plugin", g.plugin, ...g.can.flatMap((t) => ["--require", t]), "--cache-root", cache]);
		assert.equal(r.status, 0, r.stderr);
		assert.equal(r.stdout.trim(), dich);
		const [dot, nhip, hinh] = await Promise.all(g.can.map((t) => import(pathToFileURL(join(dich, t)).href)));
		assert.ok(dot.timThuMucDot instanceof Function, "dot.mjs không có timThuMucDot");
		assert.ok(nhip.chamNhip instanceof Function, "hook-nhip.mjs không có chamNhip");
		assert.ok(hinh.kiemDon instanceof Function, "hinh-dang.mjs không có kiemDon");
		const rCu = giai(["--plugin", "dieu-phoi", ...g.can.flatMap((t) => ["--require", t]), "--cache-root", cache]);
		assert.equal(rCu.status, 1);
		assert.match(rCu.stderr, /no usable install of "dieu-phoi"/);
		assert.ok(coKit(`plugins/${KIEM_CHEO.lan.plugin}/${KIEM_CHEO.lan.tep}`), "làn ghim lại của feature-loop có trên kit 3.0.0");
	});
});

describe("AC-6", () => {
	test("AC-6 «tệp mẫu lo-trinh-kit.html chỉ đổi tên lệnh theo bảng»: vật thật xanh, bản phá đỏ", () => {
		const duong = "apps/agent/test/mau/lo-trinh-kit.html";
		const cu = docTai(NEN, duong);
		const moi = docKho(duong);
		const kq = kiemMau(cu, moi);
		assert.deepEqual(kq.loi, []);
		assert.equal(kq.n, 14);
		assert.deepEqual(kiemMau(cu, moi.replace("<tr", "<tr ")).loi, ["tệp mẫu đổi ngoài bảng tên"]);
		assert.deepEqual(kiemMau(cu, cu).loi, ["tệp mẫu đổi ngoài bảng tên", "tệp mẫu còn tên lệnh cũ"]);
	});

	test("AC-6 «CLAUDE.md chỉ đường báo lỗi kit sang delivery-loop»", () => {
		const phang = (t) => t.replace(/\s+/g, " ");
		const doan = phang(docKho("CLAUDE.md"));
		assert.ok(doan.includes("mở chip riêng sang `~/dev/delivery-loop`"), "CLAUDE.md chưa chỉ sang ~/dev/delivery-loop");
		assert.ok(!doan.includes("`~/dev/acceptance-gate-kit`"), "CLAUDE.md còn chỉ ~/dev/acceptance-gate-kit");
		assert.ok(phang(docTai(NEN, "CLAUDE.md")).includes("mở chip riêng sang `~/dev/acceptance-gate-kit`"), "đối chứng: nhánh chính chỉ kho cũ");
	});
});

describe("AC-7", () => {
	test("AC-7 «hàm so đối chứng»: cùng tập OK xanh; lệch, VIOLATION, thiếu luật, hồ sơ thôi OK, VIOLATION ngoài vòng đều đỏ đúng thông điệp", () => {
		const luat = "pre-merge-check: rules ran=4 declared-off=0 expected=4";
		const van = (...dong) => [...dong, luat].join("\n");
		const nen = van("OK [a]: PASS", "OK [b]: PASS");
		const dau = { slug: SLUG, van: van("OK [a]: PASS", "OK [b]: PASS", `VIOLATION [${SLUG}]: chưa ký`, "VIOLATION [PR]: T1-escape") };
		assert.deepEqual(soDoiChung({ nenCu: nen, nen3: nen, dau }).loi, []);
		assert.deepEqual(soDoiChung({ nenCu: nen, nen3: van("OK [a]: PASS"), dau }).loi, ["tập OK của hai kit trên merge-base lệch"]);
		assert.deepEqual(soDoiChung({ nenCu: van("OK [a]: PASS", "OK [b]: PASS", "VIOLATION [b]: cũ"), nen3: nen, dau }).loi, ["merge-base có VIOLATION"]);
		assert.deepEqual(soDoiChung({ nenCu: "OK [a]: PASS\nOK [b]: PASS", nen3: nen, dau }).loi, ["nền kit cũ: lưới không chạy đủ luật"]);
		assert.deepEqual(soDoiChung({ nenCu: nen, nen3: nen, dau: { slug: SLUG, van: van("OK [a]: PASS") } }).loi, ["hồ sơ thôi OK trên HEAD: b"]);
		assert.deepEqual(soDoiChung({ nenCu: nen, nen3: nen, dau: { slug: SLUG, van: van("OK [a]: PASS", "OK [b]: PASS", "VIOLATION [c]: hoá cũ") } }).loi, ["VIOLATION ngoài vòng trên HEAD: 1"]);
	});
});

describe("AC-8 và AC-9", () => {
	const hopDong = docKho(`_acceptance/${SLUG}/contract.md`);
	test("AC-8 «phân loại ghim lại khớp tệp chạy khô, trên đúng cây HEAD»: vật thật xanh, ba bản phá đỏ", () => {
		const pl = JSON.parse(docKho(`_acceptance/${SLUG}/evidence/phan-loai-ghim.json`));
		const muc = docMucGhim(hopDong);
		const doi = tepCuaVong(CAP);
		assert.deepEqual(kiemPhanLoai({ pl, muc, doi, mb: MB, dinh: CAP.dinh, slug: SLUG }), []);
		const e = pl.ung_vien.find((x) => pl.nhanh_chinh[x] === undefined && pl.tip[x].dat);
		const a = structuredClone(pl);
		a.tip[e] = { ma: 1, dat: false };
		a.lop[e] = "do-ca-hai";
		assert.deepEqual(kiemPhanLoai({ pl: a, muc, doi, mb: MB, dinh: CAP.dinh, slug: SLUG }), [`${e}: xếp đỏ cả hai bên mà nhánh chính xanh`]);
		assert.ok(kiemPhanLoai({ pl, muc: { ghim: [...muc.ghim, "khong-co-ho-so"] }, doi, mb: MB, dinh: CAP.dinh, slug: SLUG }).includes("ba tập ghim (tệp phân loại, hợp đồng, run-log đổi) không bằng nhau"));
		assert.ok(kiemPhanLoai({ pl: { ...pl, sha_tip: MB }, muc, doi, mb: MB, dinh: CAP.dinh, slug: SLUG }).includes("phân loại không chạy trên cây HEAD"));
		for (const g of muc.gioiHan) {
			assert.ok(kiemPhanLoai({ pl, muc: { ...muc, gioiHan: muc.gioiHan.filter((x) => x !== g) }, doi, mb: MB, dinh: CAP.dinh, slug: SLUG }).includes(`${g}: đỏ vì vòng mà hợp đồng không khai «gioi-han»`));
		}
		const xanh = pl.ung_vien.find((x) => pl.tip[x].dat);
		assert.ok(kiemPhanLoai({ pl, muc: { ...muc, gioiHan: [...muc.gioiHan, xanh] }, doi, mb: MB, dinh: CAP.dinh, slug: SLUG }).includes(`${xanh}: hợp đồng khai «gioi-han» mà eval không đỏ vì vòng`));
	});

	test("AC-8 «hồ sơ ghim lại khớp hợp đồng, giữ chữ ký, dòng ghim khớp verified_commit»: vật thật xanh, ba bản phá đỏ", () => {
		const muc = docMucGhim(hopDong);
		const doi = tepCuaVong(CAP);
		const kq = kiemGhim({ muc, doi, mb: MB, slug: SLUG });
		assert.deepEqual(kq.loi, []);
		assert.ok(kq.so >= 0);
		if (muc.ghim.length) {
			const s = muc.ghim[0];
			assert.ok(
				kiemGhim({ muc, doi, mb: MB, slug: SLUG, docTru: { [`_acceptance/${s}/evidence-report.md`]: (t) => t.replace(/^verified_commit: \S+/m, "verified_commit: 0000000000000000000000000000000000000000") } }).loi.some((l) => l.startsWith(`${s}: dòng ghim cuối`)),
			);
			assert.ok(
				kiemGhim({ muc, doi, mb: MB, slug: SLUG, docTru: { [`_acceptance/${s}/evidence-report.md`]: (t) => t.replace(/^human_signoff: .*/m, "human_signoff: ai do") } }).loi.includes(`${s}: human_signoff đổi so với nhánh chính`),
			);
		}
		assert.ok(kiemGhim({ muc: { ghim: [...muc.ghim, "khong-co-ho-so"] }, doi, mb: MB, slug: SLUG }).loi.includes("khong-co-ho-so: hợp đồng nói ghim mà PR không chạm run-log.jsonl"));
	});

	test("AC-9 «diff từ nhánh chính chỉ chạm tệp của việc chuyển chợ»: vật thật 0 tệp lạ, bản cấy đỏ", () => {
		const doi = tepCuaVong(CAP);
		const muc = docMucGhim(hopDong);
		assert.deepEqual(kiemDiff(doi, DS, muc, SLUG), []);
		assert.deepEqual(
			kiemDiff([...doi, "packages/core/src/agreements.ts", "_acceptance/hop-tuan-mo-dung-bo/contract.md"], DS, muc, SLUG),
			["tệp ngoài danh sách: packages/core/src/agreements.ts", "tệp ngoài danh sách: _acceptance/hop-tuan-mo-dung-bo/contract.md"],
		);
	});
});

describe("Thước của vòng sau khi gộp", () => {
	const kho = thuMucTam("sau-gop");
	git(GOC, "clone", "-q", "--shared", "--no-checkout", GOC, kho);
	const dinh = CAP.dinh;
	const cay = git(kho, "rev-parse", `${dinh}^{tree}`).trim();
	const truoc = git(kho, "commit-tree", git(kho, "rev-parse", `${NEN}^{tree}`).trim(), "-p", NEN, "-m", "pr khac").trim();
	const gop = git(kho, "commit-tree", cay, "-p", truoc, "-p", dinh, "-m", "gop vong").trim();
	const sau = git(kho, "commit-tree", cay, "-p", gop, "-m", "pr sau").trim();

	test("sau gộp, cặp của vòng là hai cha của commit gộp, tệp của vòng giữ nguyên", () => {
		for (const dau of [gop, sau]) {
			const cap = capVong({ goc: kho, dau });
			assert.equal(cap.daGop, true);
			assert.equal(cap.dinh, dinh);
			assert.equal(cap.nen, git(kho, "merge-base", truoc, dinh).trim());
			assert.deepEqual(tepCuaVong(cap, kho), tepCuaVong(CAP));
		}
	});

	test("đối chứng: merge-base với nhánh chính sau gộp không còn thấy tệp nào của vòng", () => {
		const mbCu = git(kho, "merge-base", sau, gop).trim();
		assert.equal(mbCu, gop);
		assert.deepEqual(git(kho, "diff", "--name-only", `${mbCu}...${sau}`).split("\n").filter(Boolean), []);
		assert.ok(tepCuaVong(CAP).length > 0);
	});

	test("nhánh còn mở thì không có commit gộp nào của vòng", () => {
		assert.equal(CAP.daGop, false);
		assert.equal(CAP.dinh, git(GOC, "rev-parse", "HEAD").trim());
	});
});
