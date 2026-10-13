# Bộ ca mẫu quý 4 (N1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sinh khoảng 30 ca góp ý từ OKR quý 4 của bộ OKR mẫu, cho eval góp ý chọn bộ ca, và đo Kara trên bộ đó bằng thước của ca mẫu 9b.

**Architecture:** Hàm thuần `sinhCaQuy4` cạnh `cong-ty.json` (apps/api/scripts/okr-mau) đọc bộ mẫu đã parse cộng tệp nhãn và trả danh sách `CaGopY`; một lệnh ghi chúng vào `apps/agent/evals/okr/ca-gop-y/quy-4/`. Eval góp ý đọc thư mục ca qua `thuMucBoCa(env)`. Một rang trong hồ sơ dựng kho đo, chạy eve eval trên bộ quý 4 và chấm bằng luật chốt mã chép từ E22.

**Tech Stack:** Bun, TypeScript, zod 4, eve evals, Postgres kho đo (`bun run db:do`).

**Spec:** `docs/superpowers/specs/2026-10-13-bo-ca-mau-quy-4-design.md` · hợp đồng `_acceptance/bo-ca-mau-quy-4/contract.md` · `evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Hằng tinh chỉnh được nằm trong `OKR_MAU` của `apps/api/scripts/okr-mau/cau-hinh.ts` và `TRO_LY_OKR` của `apps/agent/agent/lib/okr/config.ts`; không số trần trong mã.
- Parse ở biên bằng zod; không truyền `Record<string, unknown>`.
- Không nhập mã giữa `apps/api` và `apps/agent`.
- Không sửa `cong-ty.json`, `ca-gop-y/mau/`, hay tệp nào dưới `_acceptance/tro-ly-okr-de-xuat/`.
- Tệp dùng chung (`CONTEXT.md`, `_acceptance/config.yaml`) chỉ thêm dòng.
- Mã thoát lệnh sinh: 0 xong, 4 nhãn hay bộ mẫu hỏng (`OKR_MAU.ma.sai`).
- Mã thoát rang đo: 0 đo xong, 1 tự kiểm luật chấm lệch, 2 không đo được, 3 ca đối chứng không bị bắt.

## Review Focus

1. Mục tiêu căn chỉnh vào KR OneHub (không vào mục tiêu): `capTren` phải là mục tiêu chứa KR đó — ca `ca-ng-q4-nhan-su-1` → `n3` (Task 1).
2. Mục tiêu hiển thị giới hạn (`q4-phap-che-3`) không có căn chỉnh: vẫn thành ca viết lại, nhãn NG cho nó bị từ chối (Task 1).
3. Thư mục đích có tệp ca cũ không còn nguồn: lệnh xoá nó, nhưng không xoá tệp không phải `.json` (Task 1).
4. `TDX_THU_MUC_CA` đặt chuỗi rỗng (CI hay `.env` để trống): vẫn đọc bộ mẫu, không ném (Task 3).
5. Eve sập hay một ca không có bản ghi tổng kết: rang thoát 2 nêu mã ca, không in con số như thể đo xong (Task 4).

## Tệp

| Tệp | Việc |
|---|---|
| `apps/api/scripts/okr-mau/cau-hinh.ts` | Thêm `OKR_MAU.caQuy4` |
| `apps/api/scripts/okr-mau/ca-quy-4.ts` | Mới — `chonMucTieuQuy4`, `sinhCaQuy4` |
| `apps/api/scripts/okr-mau/nhan-ca-quy-4.json` | Mới — 32 dòng nhãn |
| `apps/api/scripts/okr-ca-quy-4.ts` | Mới — lệnh `--nhan`, `--ra` |
| `apps/api/package.json`, `package.json` | Lệnh `okr:ca-quy-4` |
| `apps/api/test/okr-ca-quy-4.spec.ts` | Mới — E1–E4 |
| `apps/agent/evals/okr/ca-gop-y/quy-4/*.json` | Mới — 32 tệp do lệnh sinh |
| `apps/agent/agent/lib/okr/config.ts` | `danhGia.env.thuMucCa` |
| `apps/agent/evals/okr/ca-gop-y.ts` | `THU_MUC_CA_QUY_4`, `thuMucBoCa` |
| `apps/agent/evals/okr/gop-y.eval.ts` | `boCa()` dùng `thuMucBoCa` |
| `apps/agent/test/okr-ca-quy-4.spec.ts` | Mới — E5, E6 |
| `_acceptance/bo-ca-mau-quy-4/rang/cham-ca.mjs` | Mới — luật chấm thuần |
| `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs` | Mới — `--tu-kiem`, `--thu-muc`, `--tran-usd` |
| `docs/setup.md`, `CONTEXT.md` | Mục bộ ca quý 4; mục từ điển «Ca góp ý» |

## Thứ tự và độc lập

| Task | Phục vụ | independent | Phụ thuộc |
|---|---|---|---|
| 1 Bộ sinh ca + lệnh | E1, E2, E3, E4 | false | — |
| 2 Nhãn + sinh bộ ca | E4, E5 | false | 1 |
| 3 Eval chọn bộ ca | E5, E6 | false | 2 (E5 đọc bộ ca) |
| 4 Rang đo | E7, E9 | false | 2, 3 |
| 5 Tài liệu | E8 | false | 1, 4 |

Task 1 và phần E6 của Task 3 độc lập về tệp, nhưng chạy tuần tự trong vòng chính: dựng worktree song song ở kho này cần `.env` và `db:generate` riêng, đắt hơn phần việc nhỏ của Task 3.

---

### Task 1: Bộ sinh ca và lệnh `okr:ca-quy-4`

**Files:**
- Modify: `apps/api/scripts/okr-mau/cau-hinh.ts`
- Create: `apps/api/scripts/okr-mau/ca-quy-4.ts`, `apps/api/scripts/okr-ca-quy-4.ts`
- Modify: `apps/api/package.json` (script `okr:ca-quy-4`), `package.json` gốc (script `okr:ca-quy-4`)
- Test: `apps/api/test/okr-ca-quy-4.spec.ts` (describe `bcq4-sinh`, `bcq4-ng`, `bcq4-nhan-hong`)

**Interfaces:**
- Produces: `chonMucTieuQuy4(bo: BoOkrMau): MucTieuMau[]`; `sinhCaQuy4(bo: BoOkrMau, nhan: unknown): CaGopY[]` (ném `LoiBoMau(OKR_MAU.ma.sai, câu)`); `OKR_MAU.caQuy4 = { tienTo: "ca-", tienToNg: "ca-ng-", chuKyQuy: "quy4", chuKyNam: "nam", capQuy: ["bo-phan","phong-ban"], capNam: "onehub", congBo: "cong-bo", co: { nhan: "--nhan", ra: "--ra" }, thuMucRa: ["agent","evals","okr","ca-gop-y","quy-4"], tepNhan: "nhan-ca-quy-4.json" }`.

- [ ] **Step 1: Viết bài kiểm đỏ** `apps/api/test/okr-ca-quy-4.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { chonMucTieuQuy4, sinhCaQuy4 } from "../scripts/okr-mau/ca-quy-4";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { docBoOkrMau, type BoOkrMau } from "../scripts/okr-mau/khuon";
import { TEP_CONG_TY } from "../scripts/okr-mau/lenh";

const DIR = join(import.meta.dir, "..", "scripts", "okr-mau");
const TEP_NHAN = join(DIR, OKR_MAU.caQuy4.tepNhan);
const LENH = join(import.meta.dir, "..", "scripts", "okr-ca-quy-4.ts");
const THU_MUC_CAY = join(import.meta.dir, "..", "..", ...OKR_MAU.caQuy4.thuMucRa);
const bo = (): BoOkrMau => docBoOkrMau(readFileSync(TEP_CONG_TY, "utf8"));
const nhan = () => JSON.parse(readFileSync(TEP_NHAN, "utf8"));
```

`bcq4-sinh`: tập mã kỳ vọng rút từ `bo().mucTieu` bằng điều kiện viết trong bài (chu kỳ, cấp, `trangThai === "cong-bo"`) — so `toEqual` với id `viet-lai` của `sinhCaQuy4(bo(), nhan())`; với mỗi ca, so từng trường với mục tiêu nguồn (`title=ten`, `whyNow=viSao`, `kind=kieu`, `donVi.cap=cap`, `donVi.ten` từ `boPhan`/`phongBan`/`congTy`, KR theo thứ tự `title=ten, kind=kieu, startValue=khoi, targetValue=dich, unit=donVi`); khẳng định không có `ca-q4-marketing-nhap`, `ca-q4-kho-van-bo`, `ca-q4-kd-nam-3`. Chiều đỏ: bản sao bộ đổi tên KR đầu của `q4-kho-van-2` → hàm so trả lệch `ca-q4-kho-van-2 krs[0].title` (hàm so `lechVoiNguon(bo, ca)` viết trong bài, trả danh sách chuỗi lệch).

`bcq4-ng`: với mỗi dòng nhãn `bo === "ng"` giải đích (`canChinh.mucTieu`, hoặc mục tiêu chứa KR `canChinh.kr`) và so `capTren`; `ca-ng-q4-nhan-su-1` có `capTren.mucTieu.title` bằng tên `n3`; không có `ca-ng-q4-kd-bac-2`; chiều đỏ: bản sao bộ đổi `canChinh` của `q4-nhan-su-1` thành `{ kr: "n1-k1" }` → `capTren` sinh ra là tên `n1`.

`bcq4-nhan-hong`: bảng sáu ca, mỗi ca dựng bản sao nhãn, ghi vào thư mục tạm, chạy `spawnSync("bun", [LENH, "--nhan", tep, "--ra", ra])` với `ra` có sẵn `ca-cu.json`; khẳng định `status === 4`, stderr chứa hai chuỗi của ca, và băm thư mục `ra` trước = sau. Đối chứng dương: nhãn gốc → `status === 0`, `ca-cu.json` không còn.

```ts
const CA_HONG = [
  { ten: "thieu", sua: (n) => ({ ca: n.ca.filter((d) => d.ma !== "q4-tai-chinh-1") }), co: ["q4-tai-chinh-1", "thiếu nhãn"] },
  { ten: "khong-co", sua: (n) => ({ ca: [...n.ca, { ...n.ca[0], ma: "q4-khong-co" }] }), co: ["q4-khong-co", "không có"] },
  { ten: "nhap", sua: (n) => ({ ca: [...n.ca, { ...n.ca[0], ma: "q4-marketing-nhap" }] }), co: ["q4-marketing-nhap", "không được chọn"] },
  { ten: "trung", sua: (n) => ({ ca: [...n.ca, n.ca.find((d) => d.ma === "q4-kd-bac-2" && d.bo === "viet-lai")] }), co: ["q4-kd-bac-2", "trùng"] },
  { ten: "ng-khong-can-chinh", sua: (n) => ({ ca: [...n.ca, { ...n.ca.find((d) => d.ma === "q4-phap-che-3"), bo: "ng" }] }), co: ["q4-phap-che-3", "căn chỉnh"] },
  { ten: "ky-vong", sua: (n) => ({ ca: n.ca.map((d) => d.ma === "q4-vh" && d.bo === "viet-lai" ? { ...d, kyVong: { ...d.kyVong, vanDe: ["la"] } } : d) }), co: ["ca-q4-vh", "kyVong"] },
];
const bam = (d: string) => createHash("sha256").update(readdirSync(d).sort().map((t) => `${t}:${readFileSync(join(d, t), "utf8")}`).join("\n")).digest("hex");
```

- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/api && bun test test/okr-ca-quy-4.spec.ts` → FAIL «Cannot find module ../scripts/okr-mau/ca-quy-4».

- [ ] **Step 3: Thêm `caQuy4` vào `OKR_MAU`** (cau-hinh.ts), đúng khối ở Interfaces.

- [ ] **Step 4: Viết `ca-quy-4.ts`:**

```ts
import { BO_CA_GOP_Y, type CaGopY, parseCaGopY } from "@crm/validation/okr-ca-gop-y";
import { z } from "zod";
import { LoiBoMau, OKR_MAU } from "./cau-hinh";
import type { BoOkrMau, MucTieuMau } from "./khuon";

const Q = OKR_MAU.caQuy4;

const dongNhan = z.strictObject({
	ma: z.string().trim().min(1),
	bo: z.enum(BO_CA_GOP_Y),
	kyVong: z.unknown(),
	ghiChu: z.string().trim().max(500),
});
const tepNhan = z.strictObject({ ca: z.array(dongNhan) });
type DongNhan = z.infer<typeof dongNhan>;

const sai = (cau: string) => new LoiBoMau(OKR_MAU.ma.sai, cau);

export function chonMucTieuQuy4(bo: BoOkrMau): MucTieuMau[] {
	return bo.mucTieu.filter(
		(m) =>
			m.trangThai === Q.congBo &&
			((m.chuKy === Q.chuKyQuy && (Q.capQuy as readonly string[]).includes(m.cap)) ||
				(m.chuKy === Q.chuKyNam && m.cap === Q.capNam)),
	);
}

function tenDonVi(bo: BoOkrMau, m: MucTieuMau): string {
	if (m.cap === Q.capNam) return bo.congTy;
	const ds = m.cap === "bo-phan" ? bo.boPhan : bo.phongBan;
	const dv = ds.find((d) => d.ma === m.donVi);
	if (!dv) throw sai(`${m.ma}: không có đơn vị ${m.donVi ?? ""}`);
	return dv.ten;
}

function capTrenCua(bo: BoOkrMau, m: MucTieuMau): MucTieuMau | null {
	const cc = m.canChinh;
	if (!cc) return null;
	const dich = cc.mucTieu
		? bo.mucTieu.find((x) => x.ma === cc.mucTieu)
		: bo.mucTieu.find((x) => x.krs.some((k) => k.ma === cc.kr));
	return dich && dich.cap === Q.capNam ? dich : null;
}

const mucTieuCa = (m: MucTieuMau) => ({ title: m.ten, whyNow: m.viSao, kind: m.kieu });
const krCa = (m: MucTieuMau) =>
	m.krs.map((k) => ({ title: k.ten, kind: k.kieu, startValue: k.khoi, targetValue: k.dich, unit: k.donVi }));

function caTu(bo: BoOkrMau, m: MucTieuMau, d: DongNhan): CaGopY {
	const id = `${d.bo === "ng" ? Q.tienToNg : Q.tienTo}${m.ma}`;
	const tren = d.bo === "ng" ? capTrenCua(bo, m) : null;
	const ca = {
		id,
		bo: d.bo,
		ngonNgu: "vi",
		donVi: { cap: m.cap, ten: tenDonVi(bo, m) },
		mucTieu: mucTieuCa(m),
		krs: krCa(m),
		...(tren ? { capTren: { mucTieu: mucTieuCa(tren), krs: krCa(tren) } } : {}),
		kyVong: d.kyVong,
		ghiChu: d.ghiChu,
	};
	try {
		return parseCaGopY(ca, id);
	} catch (loi) {
		throw sai(loi instanceof Error ? loi.message : String(loi));
	}
}

export function sinhCaQuy4(bo: BoOkrMau, nhan: unknown): CaGopY[] {
	const r = tepNhan.safeParse(nhan);
	if (!r.success)
		throw sai(`Tệp nhãn sai khuôn — ${r.error.issues.map((i) => `${i.path.map(String).join(".")}: ${i.message}`).join("; ")}`);
	const chon = chonMucTieuQuy4(bo);
	const maChon = new Set(chon.map((m) => m.ma));
	const loi: string[] = [];
	const daThay = new Set<string>();
	for (const d of r.data.ca) {
		const khoa = `${d.bo}:${d.ma}`;
		if (daThay.has(khoa)) loi.push(`${d.ma}: nhãn ${d.bo} trùng`);
		daThay.add(khoa);
		const m = bo.mucTieu.find((x) => x.ma === d.ma);
		if (!m) loi.push(`${d.ma}: không có mục tiêu này trong bộ mẫu`);
		else if (!maChon.has(d.ma)) loi.push(`${d.ma}: mục tiêu không được chọn — nháp, chờ duyệt, đã bỏ, hay ngoài quý 4 và OneHub của năm`);
		else if (d.bo === "ng" && (m.cap !== "phong-ban" || !capTrenCua(bo, m)))
			loi.push(`${d.ma}: ca NG cần mục tiêu phòng ban có căn chỉnh lên OneHub`);
	}
	for (const m of chon)
		if (!daThay.has(`viet-lai:${m.ma}`)) loi.push(`${m.ma}: thiếu nhãn viết lại`);
	if (loi.length) throw sai(loi.join("\n"));
	const ca: CaGopY[] = [];
	for (const d of r.data.ca) {
		const m = chon.find((x) => x.ma === d.ma);
		if (!m) continue;
		try {
			ca.push(caTu(bo, m, d));
		} catch (e) {
			loi.push(e instanceof Error ? e.message : String(e));
		}
	}
	if (loi.length) throw sai(loi.join("\n"));
	return [...ca].sort((a, b) => a.id.localeCompare(b.id));
}
```

- [ ] **Step 5: Viết lệnh `apps/api/scripts/okr-ca-quy-4.ts`** — đọc `--nhan` (mặc định `join(import.meta.dir, "okr-mau", Q.tepNhan)`), `--ra` (mặc định `join(import.meta.dir, "..", "..", ...Q.thuMucRa)`), `docBoOkrMau(readFileSync(TEP_CONG_TY))`; JSON nhãn hỏng → `LoiBoMau` mã 4; gọi `sinhCaQuy4`; chỉ khi không ném mới `mkdirSync(ra, {recursive:true})`, xoá mọi `*.json` trong `ra` không thuộc tập mới, ghi `${id}.json` = `JSON.stringify(ca, null, "\t") + "\n"`, in `okr:ca-quy-4: <n> ca → <ra>`. `LoiBoMau` → `console.error(cau)`, `process.exit(loi.ma)`; lỗi khác → in, thoát 1. Cờ lạ → mã 4 kèm danh sách cờ hợp lệ. Thêm `"okr:ca-quy-4": "bun scripts/okr-ca-quy-4.ts"` vào `apps/api/package.json` và `"okr:ca-quy-4": "bun run --filter=api okr:ca-quy-4"` vào `package.json` gốc.

- [ ] **Step 6: Chạy bài kiểm** — `cd apps/api && bun test test/okr-ca-quy-4.spec.ts -t "bcq4-sinh|bcq4-ng"` vẫn đỏ vì chưa có tệp nhãn (Task 2); `bcq4-nhan-hong` cũng cần nhãn — chạy sau Task 2. Kiểm kiểu: `bun run check-types --filter=api`.

- [ ] **Step 7: Commit** `feat(bo-ca-mau-quy-4): bộ sinh ca góp ý từ OKR quý 4 mẫu`.

### Task 2: Tệp nhãn và bộ ca quý 4

**Files:**
- Create: `apps/api/scripts/okr-mau/nhan-ca-quy-4.json`
- Create (do lệnh sinh): `apps/agent/evals/okr/ca-gop-y/quy-4/*.json`
- Test: `apps/api/test/okr-ca-quy-4.spec.ts` thêm describe `bcq4-dong-bo`

**Interfaces:**
- Consumes: `sinhCaQuy4`, lệnh `okr:ca-quy-4` (Task 1).
- Produces: 32 tệp `ca-<ma>.json`, `ca-ng-<ma>.json`.

- [ ] **Step 1: Viết `nhan-ca-quy-4.json`** — `{ "ca": [ … ] }`, 26 dòng `viet-lai` + 6 dòng `ng`, nhãn đúng bảng «Nhãn» của design doc. Khuôn `kyVong`: `{ "vanDe": [], "vietLai": [], "khongGopY": false, "khongDuoc": [], "soSai": false }`; `khongGopY: true` cho `n1`, `n2`, `q4-kho-van-2`, `q4-kd-nam-1`, `q4-san-pham-2`; `vanDe` cho `n3` [`trung-y`,`kr-la-viec`], `q4-kd` [`muc-tieu-la-so`,`thieu-doi-trong`] + `vietLai` [`title`], `q4-vh`, `q4-cham-soc-1`, `q4-marketing-1`, `q4-dieu-phoi-1`, `q4-kd-bac-2`, `q4-nhan-su-1` [`kr-la-viec`] + `vietLai` [`kr.title`], `q4-kd-nam-2` [`kr-la-viec`,`thieu-doi-trong`] + `vietLai` [`kr.title`]; `vietLai` [`title`] cho `q4-marketing-2`, `q4-tai-chinh-2`, `q4-phap-che-3`; dòng `ng` cho `q4-kd-bac-1`, `q4-kd-nam-1`, `q4-cham-soc-1`, `q4-kho-van-2`, `q4-nhan-su-1`, `q4-tai-chinh-1` với `khongDuoc` [`chep-kr-cap-tren`,`noi-ve-nguoi`]. Mỗi dòng một `ghiChu` một câu nói dấu hiệu.

- [ ] **Step 2: Sinh** — `bun run okr:ca-quy-4` → `okr:ca-quy-4: 32 ca → …/quy-4`.

- [ ] **Step 3: Thêm `bcq4-dong-bo`** — chạy lệnh thật `--ra <tạm>`, so tập tên và nội dung từng tệp với `THU_MUC_CAY`; thư mục tạm có sẵn `ca-cu.json` thì sau lệnh không còn; chiều đỏ: chép bộ ca của cây sang thư mục tạm khác, sửa một chữ trong `ca-n2.json`, hàm so `soThuMuc(a, b): string[]` trả `["ca-n2.json"]`.

- [ ] **Step 4: Chạy** — `bun run test -- "cd apps/api && bun test test/okr-ca-quy-4.spec.ts"` → 4 describe PASS.

- [ ] **Step 5: Commit** `feat(bo-ca-mau-quy-4): nhãn và 32 ca góp ý quý 4 mẫu`.

### Task 3: Eval chọn bộ ca

**Files:**
- Modify: `apps/agent/agent/lib/okr/config.ts` (`danhGia.env.thuMucCa: "TDX_THU_MUC_CA"`)
- Modify: `apps/agent/evals/okr/ca-gop-y.ts`, `apps/agent/evals/okr/gop-y.eval.ts`
- Test: `apps/agent/test/okr-ca-quy-4.spec.ts` (describe `bcq4-thanh-phan`, `bcq4-chon-bo`)

**Interfaces:**
- Produces: `THU_MUC_CA_QUY_4: string`; `thuMucBoCa(env: Record<string, string | undefined>, macDinh?: () => string): string`.

- [ ] **Step 1: Bài kiểm đỏ** — `bcq4-chon-bo`: `thuMucBoCa({ [TRO_LY_OKR.danhGia.env.thuMucCa]: THU_MUC_CA_QUY_4 })` = `THU_MUC_CA_QUY_4`; `thuMucBoCa({})` = `THU_MUC_CA_MAU`; chuỗi rỗng → `THU_MUC_CA_MAU`; thư mục không có → ném lỗi chứa đường dẫn; đọc nguồn `gop-y.eval.ts`: thân `boCa()` chứa `thuMucBoCa(process.env` và không chứa `THU_MUC_CA_MAU`. `bcq4-thanh-phan`: 28–34 ca; tập tên phòng ban, bộ phận, số ca OneHub rút từ `cong-ty.json` đọc bằng `JSON.parse` (không nhập mã apps/api); ≥ 4 NG có `capTren`; ≥ 3 `khongGopY`; KR qua `krInput` và `kiemSoTheoKieu`; giao id với bộ mẫu rỗng; bảng nhãn viết trước 32 dòng so `toEqual`; hai chiều đỏ (`gy-01` thêm vào bản sao → giao không rỗng ghim «gy-01»; `ca-q4-vh` bỏ `kr-la-viec` → lệch ghim «ca-q4-vh kyVong»).

- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/agent && bun test test/okr-ca-quy-4.spec.ts` → FAIL «thuMucBoCa is not exported».

- [ ] **Step 3: Cài**

```ts
export const THU_MUC_CA_QUY_4 = join(DAY, "ca-gop-y", "quy-4");

export function thuMucBoCa(
	env: Record<string, string | undefined>,
	macDinh: () => string = () => THU_MUC_CA_MAU,
): string {
	const chon = env[TRO_LY_OKR.danhGia.env.thuMucCa]?.trim();
	if (!chon) return macDinh();
	if (!existsSync(chon)) throw new Error(`Thư mục ca góp ý ${chon} không có`);
	return chon;
}
```

Trong `gop-y.eval.ts`: `return [...docBoCaGopY(thuMucBoCa(process.env, thuMucCaMau)), ...(them ? docBoCaGopY(them) : [])];`.

- [ ] **Step 4: Chạy** — `cd apps/agent && bun test test/okr-ca-quy-4.spec.ts test/okr-ca-gop-y.spec.ts` PASS; `bun run check-types --filter=agent`.

- [ ] **Step 5: Commit** `feat(bo-ca-mau-quy-4): eval góp ý chọn bộ ca qua TDX_THU_MUC_CA`.

### Task 4: Rang đo Kara trên bộ quý 4

**Files:**
- Create: `_acceptance/bo-ca-mau-quy-4/rang/cham-ca.mjs`, `_acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs`

**Interfaces:**
- Consumes: `THU_MUC_CA_QUY_4`, `docBoCaGopY` (Task 3); `dongTongKet`, `COT_DONG_TONG_KET` (`tong-ket-gop-y.ts`); `taoKho`, `xoaKho`, `napBoMau`, `phienCookie`, `coKhoaMoHinh`, `cauThieuKhoa`, `duongPath`, `truyVan`, `AGENT`, `GOC` (`_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs`, chỉ nhập); `so-moi-lot.mjs` của 9b qua tiến trình con.
- Produces: `chamCa(ca, banGhi, { lotSoMoi: Set<string>, ten: string[], maCamNg: string[], tuCam: string[] }): string[]` (rỗng = DUNG); `phuBoiLuat7(ca): string[]`.

- [ ] **Step 1: `cham-ca.mjs`** — chép nguyên luật `kiemCa`, `kiemNg`, `luatLuot7`, `vanDePhuBoiLuot7`, `boDau`, `chuanTu`, `coNguyenTu`, `coTuCam`, `coTen` và bảng `truongCuaVanDe` từ `_acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs` (dòng 256–280, 425–506), đổi thành hàm xuất nhận `maCamNg`, `tuCam`, `soChuHoTenToiThieu` qua tham số thay vì đọc hằng toàn cục; thêm `docBanGhi(dong)` parse bằng zod đúng khuôn `banGhiCa` của E22.

- [ ] **Step 2: `do-gop-y-quy-4.mjs --tu-kiem`** — ma trận viết trước bảy dòng phạm luật + hai đối chứng dương như E9; mỗi bản ghi dựng bằng `dongTongKet(...)` rồi `docBanGhi(JSON.parse(...))`; in `tu kiem cham: 9/9`, lệch thì in tên dòng và thoát 1.

- [ ] **Step 3: Chạy tự kiểm** — `bun _acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs --tu-kiem` → `tu kiem cham: 9/9`, exit 0. Phá thử: đổi chuỗi `"chep-cap-tren"` trong `cham-ca.mjs` thành chuỗi khác → tự kiểm in dòng (5) và thoát 1; hoàn lại.

- [ ] **Step 4: Luồng đo** — theo design §Đo: tự kiểm → khoá mô hình (thiếu → 2) → `taoKho("bcq4-do")` → `phienCookie(PHIEN_DO.nguoi)` + `napBoMau` → chép `THU_MUC_CA_QUY_4` (hoặc `--thu-muc`) + ca đối chứng vào `.acceptance-runs/bo-ca-mau-quy-4/do/ca/` → `eve eval okr/gop-y okr/ng --verbose` với `TDX_THU_MUC_CA`, `TDX_TONG_KET`, `TDX_TRAN_USD`, `DATABASE_URL`, `AGENT_BRIDGE_SECRET` ngẫu nhiên, `CRM_TELEMETRY_DISABLED=1` → đọc tổng kết, điểm judge (`.eve/evals/*/summary.json` mới hơn lúc bắt đầu, nhãn `judge.autoevals.closedQA [`), số mới lọt (`bun so-moi-lot.mjs --muc-tieu …`), tên thành viên → chấm từng ca → in `DUNG`/`SAI` → dòng `ma: x/n · judge: y (k cap, nguong 0.7) · ca mau 9b: 30/30 · 0.95` → dòng `chi: … USD / tran …` → ghi `_acceptance/bo-ca-mau-quy-4/evidence/do-gop-y-quy-4.md` (bảng ca · bộ · kết quả · lý do, cộng số tổng, run id, mô hình, judge, tiền) → `xoaKho`. Mã: eve trả null hay 2, hoặc ca thiếu bản ghi → 2 nêu mã ca; đối chứng không bị bắt → 3; còn lại 0.

- [ ] **Step 5: Chạy đo một lần** khi đã có lượt (không trong S4 — S4 tự chạy E7): bỏ qua ở bước này; chỉ chạy `--tu-kiem` và `node --check`.

- [ ] **Step 6: Commit** `feat(bo-ca-mau-quy-4): rang đo Kara trên bộ ca quý 4`.

### Task 5: Tài liệu

**Files:**
- Modify: `docs/setup.md` (mục «Bộ OKR mẫu», thêm tiểu mục «Bộ ca góp ý quý 4»)
- Modify: `CONTEXT.md` (thêm mục «Ca góp ý»)

- [ ] **Step 1:** Viết tiểu mục: `bun run okr:ca-quy-4` (cờ `--nhan`, `--ra`, mã 0/4), sửa nhãn ở đâu, bài kiểm đồng bộ đỏ khi quên sinh lại; đo: `bun _acceptance/bo-ca-mau-quy-4/rang/do-gop-y-quy-4.mjs` (cờ `--tu-kiem`, `--thu-muc`, `--tran-usd`, mã 0/1/2/3, cần khoá mô hình, tiền); ca thật: đặt tệp cùng khuôn vào `apps/agent/evals/okr/ca-gop-y/that/` (bị gitignore vì là OKR thật), đo bằng `--thu-muc apps/agent/evals/okr/ca-gop-y/that`; điều kiện bật 9b đọc từ con số đó.
- [ ] **Step 2:** Mục từ điển «Ca góp ý»: một OKR cố định kèm điều Kara nên và không nên đề xuất, dùng để đo góp ý; bộ `mau/` dựng tay, bộ `quy-4/` rút từ bộ OKR mẫu, bộ `that/` ngoài git.
- [ ] **Step 3: Commit** `docs(bo-ca-mau-quy-4): hướng dẫn sinh và đo bộ ca quý 4`.

### Kết S3

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop` sạch; đặt `status: implemented`; vào S4.
