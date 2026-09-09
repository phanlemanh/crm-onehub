# Đo quyền của lượt bằng hành vi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay bộ dò regex-theo-dòng của AC-5 cũ bằng một phép đo đi trọn đường sản phẩm, và đổi sàn dân số sang một bất biến nguồn ghi đọc bằng AST — mỗi phép đo mới có chiều đỏ chạy được.

**Architecture:** Ba lớp. (1) Mã sản phẩm: bỏ hàm đồng nhất `builderCommandType`, tách `builderSessionAuthFromRow` để chỗ nối hàng-DB → thuộc tính phiên trở nên đo được. (2) Bài đo hành vi trong `apps/agent/test/quyen-luot.spec.ts`, đi từ HÀNG chứ không từ khối tham số. (3) Bộ răng trong `_acceptance/do-quyen-luot-bang-hanh-vi/rang/` — mỗi răng dựng một cây sao mang **trạng thái đang xét**, đột biến vật thật trong đó, và đòi thước đỏ kèm thông điệp ghim.

**Tech Stack:** TypeScript 5.9.2 (compiler API, đã có ở gốc kho — không thêm gói) · Bun test · Node ESM cho răng · git worktree cho cây sao.

**Spec:** `docs/superpowers/specs/2026-09-09-do-quyen-luot-bang-hanh-vi-design.md`
**Hợp đồng:** `_acceptance/do-quyen-luot-bang-hanh-vi/contract.md` (9 AC) · `evals.yaml` (10 eval)

## Global Constraints

- **Không viết chú thích trong code.** Không cho mã mới, không cho mã sửa. (`AGENTS.md`)
- **Không trailer `Co-Authored-By` trong commit của kho này** — trừ trailer `Claude Opus 5` mà phiên này đã được cấu hình dùng.
- **Cấm tự đúc từ ghép tiếng Việt cho thuật ngữ kỹ thuật.** Giữ nguyên `diff`, `sha`, `AST`, `fixture`, `commandType`. (`CLAUDE.md`)
- **Parse ở biên, không truyền `Record<string, unknown>`.** (`AGENTS.md`)
- **Không `git add -A`.** Cây làm việc dùng chung nhiều phiên; luôn `git add` đường dẫn đích danh. Chạy `git status` trước mọi lần đổi nhánh.
- **`GOC` của mọi răng suy từ vị trí script** (`fileURLToPath(import.meta.url)`), không ghim cứng đường gốc kho.
- **Mọi cây sao mang TRẠNG THÁI ĐANG XÉT**, không phải `HEAD`. Mỗi vectơ một cây sao mới. Dọn cây sao kể cả khi bị ngắt.
- **Mỗi phép đo mới phải có cặp hai chiều trên cùng fixture** — vật lành → xanh, vật đột biến → đỏ với thông điệp ghim. Thiếu cặp là task CHƯA XONG.
- Sàn nguồn ghi ghim theo khoá **`tệp :: hàm bao :: nguồn`**, và **vẫn in `file:dòng`** trong thông điệp đỏ. Đây là chỗ kế hoạch lệch chữ `file:dòng` của AC-3; lý do và cái giá ở sổ quyết định `d-20260910T001500Z-41001`, và phải hiện trong gói Cổng 2.

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `apps/agent/agent/lib/custom-agent-dispatch.ts` | *(sửa)* bỏ `builderCommandType`; `builderSessionAttributes` thôi nhận `message`; thêm `builderSessionAuthFromRow` |
| `apps/agent/test/quyen-luot.spec.ts` | *(sửa)* khối `describe("suy-dien")` giữ tên, thay ruột bằng phép đo hành vi |
| `docs/agent.md` | *(sửa)* thêm đoạn khai nguồn quyền của mỗi lượt |
| `_acceptance/quyen-luot-mang-theo/contract.md` | *(sửa)* thêm đúng một dòng vào `## Notes` |
| `…/rang/chung.mjs` | cây sao từ trạng thái đang xét, assert danh tính, chạy lệnh trong cây sao, dọn dẹp |
| `…/rang/ast.mjs` | nạp chương trình TypeScript, duyệt cây, hỏi tổ tiên |
| `…/rang/cong-quyen-do.mjs` | E2 — chiều đỏ của phép đo hành vi (2 vectơ) |
| `…/rang/khong-cam-tin-nhan.mjs` | E3 — ba bất biến của `apps/agent` (2 vectơ) |
| `…/rang/nguon-ghi.mjs` | E4 — sàn nguồn ghi ở `apps/api/src` (4 vectơ) |
| `…/rang/mang-theo-do.mjs` | E5 — chiều đỏ của đường mang theo (1 vectơ) |
| `…/rang/bo-do-grep.mjs` | E6 — bộ dò cũ không mọc lại (1 vectơ) |
| `…/rang/vet-ho-so-cu.mjs` | E9 — vùng đóng băng và vùng được động của hồ sơ cũ (1 vectơ) |
| `…/rang/ho-so-cu-con-chay.sh` | E10 — bốn lệnh máy của hồ sơ cũ vẫn thoát 0 |
| `…/rang/khai-sinh.json` | bản khai 12 vectơ |
| `…/rang/khai-sinh.mjs` | E8 — đếm vectơ, chạy cả bản khai (1 vectơ tự kiểm) |

## Bảng vectơ — nguồn đếm của E8

| Eval | Vectơ | Mã mong đợi |
|---|---|---|
| E2 | `mo-cong` · `ternary-xuong-dong` | khác 0 |
| E3 | `cay-lai-tham-so` · `cho-goi-tinh-toan` | 2 |
| E4 | `ghim-cung` · `bien-trung-gian` · `quan-he-long` · `duoi-select` | 2 · 2 · 2 · **0** |
| E5 | `mang-theo-luon-mo` | khác 0 |
| E6 | `cay-lai-bo-do` | 2 |
| E8 | `khai-thieu-vecto` | 2 |
| E9 | `sua-mot-ky-tu` | 2 |

Tổng 12 dòng trong `khai-sinh.json`. `duoi-select` là vectơ **phải vẫn xanh** — mã 0 là kết quả đúng của nó.

---

### Task 1: Bộ khung răng — cây sao và bộ đọc AST

**independent:** false — mọi răng đứng trên nó.
**Phục vụ:** E2, E3, E4, E5, E6, E8, E9 (hạ tầng).

**Files:**
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/ast.mjs`
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs`

**Interfaces:**
- Produces: `GOC` · `dungCaySao()` → `{sao, sha, don()}` · `assertDanhTinh(sao)` · `chay(sao, argv, opts)` → `{ma, chu}` · `voiCaySao(fn)` · `nap(goc, thuMuc)` → `{program, checker, tepTs}` · `duoiKhoa(node, tenKhoa)` → boolean · `viTri(node)` → `"duong:dong"`

- [ ] **Bước 1: `chung.mjs` — cây sao mang trạng thái đang xét**

```js
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RANG = dirname(fileURLToPath(import.meta.url));
export const GOC = resolve(RANG, "..", "..", "..");

const git = (args, cwd = GOC) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function trangThaiDangXet() {
	const tam = git(["stash", "create"]);
	return tam || git(["rev-parse", "HEAD"]);
}

export function dungCaySao() {
	const sha = trangThaiDangXet();
	const sao = join(
		process.env.TMPDIR ?? "/tmp",
		`dq-sao-${process.pid}-${Math.random().toString(36).slice(2, 8)}`,
	);
	rmSync(sao, { recursive: true, force: true });
	git(["worktree", "add", "--detach", "--quiet", sao, sha]);

	const chuaTheoDoi = git(["ls-files", "--others", "--exclude-standard"])
		.split("\n")
		.filter(Boolean);
	for (const duong of chuaTheoDoi) {
		const dich = join(sao, duong);
		mkdirSync(dirname(dich), { recursive: true });
		cpSync(join(GOC, duong), dich);
	}

	for (const ten of ["node_modules", ".env"]) {
		const nguon = join(GOC, ten);
		if (existsSync(nguon) && !existsSync(join(sao, ten))) {
			symlinkSync(nguon, join(sao, ten));
		}
	}

	const don = () => {
		try {
			git(["worktree", "remove", "--force", sao]);
		} catch {
			rmSync(sao, { recursive: true, force: true });
		}
		try {
			git(["worktree", "prune"]);
		} catch {}
	};
	return { sao, sha, don };
}

export function voiCaySao(fn) {
	const cay = dungCaySao();
	const don = () => cay.don();
	const tin = ["SIGINT", "SIGTERM", "SIGHUP"];
	const bo = () => {
		don();
		process.exit(130);
	};
	for (const t of tin) process.on(t, bo);
	try {
		return fn(cay);
	} finally {
		for (const t of tin) process.off(t, bo);
		don();
	}
}

export function chay(cwd, argv, env = {}) {
	const r = spawnSync(argv[0], argv.slice(1), {
		cwd,
		encoding: "utf8",
		env: { ...process.env, ...env },
	});
	return { ma: r.status, chu: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

export function hong(chu) {
	process.stderr.write(`${chu}\n`);
	process.exit(2);
}
```

- [ ] **Bước 2: `chung.mjs` — assert danh tính**

Ba điều, đọc bằng chuỗi trên bản sao chưa đột biến; chưa đạt là mã 2 với đúng chữ `cây sao không chứa mã đang xét`.

```js
import { readFileSync } from "node:fs";

const DUONG_DISPATCH = "apps/agent/agent/lib/custom-agent-dispatch.ts";

export function assertDanhTinh(sao) {
	const nguon = readFileSync(join(sao, DUONG_DISPATCH), "utf8");
	const thieu = [];
	if (/\bbuilderCommandType\b/.test(nguon)) thieu.push("builderCommandType còn tồn tại");
	if (!/\bbuilderSessionAuthFromRow\b/.test(nguon)) thieu.push("builderSessionAuthFromRow chưa có");
	if (/message:\s*Prisma\.JsonValue;[\s\S]{0,200}?hasTitle/.test(nguon)) {
		thieu.push("builderSessionAttributes còn tham số message");
	}
	if (thieu.length) {
		hong(
			`cây sao không chứa mã đang xét: ${thieu.join(" · ")}\n  cây sao: ${sao}`,
		);
	}
}
```

- [ ] **Bước 3: `ast.mjs` — bộ đọc AST**

```js
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

export function quetTs(thuMuc) {
	return readdirSync(thuMuc, { withFileTypes: true }).flatMap((muc) => {
		const duong = join(thuMuc, muc.name);
		if (muc.isDirectory()) return muc.name === "node_modules" ? [] : quetTs(duong);
		return muc.name.endsWith(".ts") || muc.name.endsWith(".tsx") ? [duong] : [];
	});
}

export function nap(duong) {
	return ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
}

export function duyet(node, fn) {
	fn(node);
	node.forEachChild((con) => duyet(con, fn));
}

export function viTri(sf, node, goc) {
	const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
	return `${sf.fileName.slice(goc.length + 1)}:${line + 1}`;
}

const KHOA_DOC = new Set(["select", "where", "orderBy", "include"]);

export function duoiKhoaDoc(node) {
	for (let n = node.parent; n; n = n.parent) {
		if (
			ts.isPropertyAssignment(n) &&
			ts.isIdentifier(n.name) &&
			KHOA_DOC.has(n.name.text)
		) {
			return true;
		}
	}
	return false;
}

export function hamBao(sf, node) {
	for (let n = node.parent; n; n = n.parent) {
		if (ts.isMethodDeclaration(n) || ts.isFunctionDeclaration(n)) {
			return n.name ? n.name.getText(sf) : "<vô danh>";
		}
	}
	return "<đỉnh tệp>";
}
```

- [ ] **Bước 4: `tu-kiem-khung.mjs` — cặp hai chiều cho chính bộ khung**

Bộ khung cũng là một phép đo (nó khẳng định "cây sao mang mã đang xét"), nên nó cũng cần chiều đỏ.

```js
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, voiCaySao, assertDanhTinh, chay, hong } from "./chung.mjs";

const DUONG = "apps/agent/agent/lib/custom-agent-dispatch.ts";
const NEO = `export const NEO_TU_KIEM_KHUNG = ${Date.now()};\n`;

writeFileSync(join(GOC, DUONG), readFileSync(join(GOC, DUONG), "utf8") + NEO);
try {
	voiCaySao(({ sao }) => {
		const trongSao = readFileSync(join(sao, DUONG), "utf8");
		if (!trongSao.includes("NEO_TU_KIEM_KHUNG")) {
			hong("cây sao không chứa mã đang xét: neo vừa ghi không sang được bản sao");
		}
		assertDanhTinh(sao);
		const r = chay(join(sao, "apps", "agent"), ["bun", "test", "test/quyen-luot.spec.ts"]);
		if (r.ma !== 0) hong(`đối chứng dương hỏng trong cây sao: mã ${r.ma}\n${r.chu}`);
	});
} finally {
	const nguon = readFileSync(join(GOC, DUONG), "utf8");
	writeFileSync(join(GOC, DUONG), nguon.slice(0, nguon.length - NEO.length));
}
process.stdout.write("khung: cây sao mang mã đang xét, đối chứng dương xanh\n");
```

- [ ] **Bước 5: Chạy tự kiểm khung — chiều xanh**

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs`
Mong đợi: mã 0, in `khung: cây sao mang mã đang xét, đối chứng dương xanh`.
Task 1 chạy TRƯỚC Task 2 nên `assertDanhTinh` sẽ đỏ ở lượt đầu — đó là đúng: chạy lại bước này sau Task 2.

- [ ] **Bước 6: Chạy tự kiểm khung — chiều đỏ**

Sửa tạm `trangThaiDangXet()` thành `git(["rev-parse", "HEAD"])` (bỏ `stash create`), chạy lại.
Mong đợi: mã 2, thông điệp chứa `cây sao không chứa mã đang xét`.
Trả lại `trangThaiDangXet()` như cũ, chạy lại → mã 0.

- [ ] **Bước 7: Commit**

```bash
git add _acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs _acceptance/do-quyen-luot-bang-hanh-vi/rang/ast.mjs _acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs
git commit -m "rang(do-quyen): bo khung cay sao mang ma dang xet + bo doc AST"
```

---

### Task 2: Mã sản phẩm — bỏ hàm đồng nhất, tách `builderSessionAuthFromRow`, thay ruột `suy-dien`

**independent:** false — Task 3, 4, 6, 7, 9 đứng trên nó.
**Phục vụ:** AC-1 (E1), AC-2 (E3), AC-5 (E6), AC-9 (E10).

**Files:**
- Modify: `apps/agent/agent/lib/custom-agent-dispatch.ts` (khối `builderSessionAttributes` ~874-907, chỗ gọi ~160-183)
- Modify: `apps/agent/test/quyen-luot.spec.ts` (khối `describe("suy-dien")` ~65-113)

**Interfaces:**
- Produces: `builderSessionAuthFromRow(row: BuilderAuthRow, conversationId: string)` → `{ authenticator, principalType, principalId, attributes }`; `BuilderAuthRow = { id, commandType, message, conversation: { userId, title } }`
- Consumes: `builderTurnApproval`, `BUILDER_DENIED_REASON` từ `../agent/subagents/agent_builder/lib/authorization`; `requireBuilderAttribute` từ `../agent/lib/session-purpose`

- [ ] **Bước 1: Viết bài đo hành vi — thay trọn ruột `describe("suy-dien")`**

Xoá cả hai `it` cũ của khối (bài `inputResponse` cũ gọi `builderCommandType`, bài đếm-trên-đĩa là thứ AC-5 loại). Giữ nguyên tên khối.

```ts
const hang = (commandType: string, inputResponse: Record<string, string>) => ({
	id: "sub_1",
	commandType,
	message: {
		text: "Build me an agent that flags stalled deals",
		resources: [],
		attachments: [],
		inputResponse,
	},
	conversation: { userId: "usr_1", title: null },
});

const BIEN_THE = [
	{ requestId: "req_1", text: "co" },
	{ requestId: "req_1", optionId: "opt_1" },
];

describe("suy-dien", () => {
	it("suy-dien: hang khai CHAT thi cong dong, du tin nhan dung khuon xin dung tac nhan", () => {
		expect(BIEN_THE).toHaveLength(2);
		for (const inputResponse of BIEN_THE) {
			const ctx = {
				session: {
					auth: {
						current: {
							attributes: builderSessionAuthFromRow(
								hang("CHAT", inputResponse),
								"conv_1",
							).attributes,
						},
						initiator: null,
					},
				},
			};
			const cham = builderTurnApproval(ctx);
			expect(cham).toEqual({ type: "denied", reason: BUILDER_DENIED_REASON });
			expect(() => requireBuilderAttribute(ctx, "conversationId")).toThrow();
		}
	});

	it("suy-dien: doi DUNG MOT truong commandType cua hang thi cong mo", () => {
		for (const inputResponse of BIEN_THE) {
			const ctx = {
				session: {
					auth: {
						current: {
							attributes: builderSessionAuthFromRow(
								hang("CREATE_AGENT", inputResponse),
								"conv_1",
							).attributes,
						},
						initiator: null,
					},
				},
			};
			expect(builderTurnApproval(ctx)).toBe("not-applicable");
			expect(requireBuilderAttribute(ctx, "conversationId")).toBe("conv_1");
		}
	});
});
```

Sửa khối import đầu tệp: bỏ `builderCommandType` và `readdirSync`, thêm `builderSessionAuthFromRow`, `builderTurnApproval`, `BUILDER_DENIED_REASON`, `requireBuilderAttribute`. Giữ `readFileSync` và `join` (khối `cua-ra` còn dùng).

- [ ] **Bước 2: Chạy để thấy nó đỏ**

Chạy: `cd apps/agent && bun test test/quyen-luot.spec.ts -t suy-dien`
Mong đợi: FAIL — `builderSessionAuthFromRow` chưa tồn tại.

- [ ] **Bước 3: Sửa `custom-agent-dispatch.ts`**

Xoá trọn hàm `builderCommandType`. Bỏ `message` khỏi tham số `builderSessionAttributes` và lấy `commandType` thẳng từ `input`. Thêm hàm mới.

```ts
export function builderSessionAttributes(input: {
	commandType: string;
	conversationId: string;
	userId: string;
	submissionId: string;
	hasTitle: boolean;
}): BuilderSessionAttributes {
	return {
		purpose: "builder",
		commandType: input.commandType,
		needsTitle: input.hasTitle ? "false" : "true",
		conversationId: input.conversationId,
		userId: input.userId,
		submissionId: input.submissionId,
	};
}

export type BuilderAuthRow = {
	id: string;
	commandType: string;
	message: Prisma.JsonValue;
	conversation: { userId: string; title: string | null };
};

export function builderSessionAuthFromRow(
	row: BuilderAuthRow,
	conversationId: string,
) {
	return {
		authenticator: "crm-builder",
		principalType: "user",
		principalId: row.conversation.userId,
		attributes: builderSessionAttributes({
			commandType: row.commandType,
			conversationId,
			userId: row.conversation.userId,
			submissionId: row.id,
			hasTitle: Boolean(row.conversation.title),
		}),
	} as const;
}
```

- [ ] **Bước 4: Chỗ gọi dùng hàm mới**

Ở `custom-agent-dispatch.ts` khoảng dòng 165-175, thay khối `auth: { … }` viết tay bằng `auth: builderSessionAuthFromRow(submission, conversationId),`. Nếu `send()` không nhận được kiểu `as const`, bỏ `as const` và khai kiểu trả về tường minh theo kiểu tham số `auth` của `send`.

- [ ] **Bước 5: Chạy bài đo — chiều xanh**

Chạy: `cd apps/agent && bun test test/quyen-luot.spec.ts`
Mong đợi: PASS toàn bộ tệp, gồm cả khối `ke-thua` và `cua-ra` cũ.

- [ ] **Bước 6: Bốn lệnh của hồ sơ cũ vẫn xanh (AC-9 sớm)**

```bash
cd apps/agent && bun test test/quyen-luot.spec.ts -t ke-thua
cd apps/agent && bun test test/quyen-luot.spec.ts -t suy-dien
cd apps/agent && bun test test/quyen-luot.spec.ts -t cua-ra
cd apps/agent && bun test test/quyen-luot.spec.ts -t cong-dong
```
Mong đợi: cả bốn thoát 0. Một lệnh đỏ → sửa ở đây, đừng để nó xuống Task 9.

- [ ] **Bước 7: Cổng kho**

```bash
bun run check-types
bun run lint
bun run lint:slop
```
Mong đợi: cả ba thoát 0. `lint:slop` sẽ bắt nếu có chú thích nào lọt vào.

- [ ] **Bước 8: Chạy lại tự kiểm khung của Task 1**

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs`
Mong đợi: mã 0 — giờ `assertDanhTinh` mới có đủ ba điều để khẳng định.

- [ ] **Bước 9: Commit**

```bash
git add apps/agent/agent/lib/custom-agent-dispatch.ts apps/agent/test/quyen-luot.spec.ts
git commit -m "feat(agent): bo ham dong nhat builderCommandType, tach builderSessionAuthFromRow"
```

---

### Task 3: Răng E3 — `apps/agent` không cầm tin nhắn ở chỗ quyết quyền

**independent:** false — cần Task 1 và Task 2.
**Phục vụ:** AC-2 (E3).

**Files:**
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs`

**Interfaces:**
- Consumes: `GOC`, `voiCaySao`, `chay`, `hong` từ `chung.mjs`; `quetTs`, `nap`, `duyet`, `viTri` từ `ast.mjs`
- Produces: chạy được với cờ `--goc <đường>` để chấm một cây bất kỳ (bản sao dùng cờ này)

- [ ] **Bước 1: Viết răng — ba bất biến**

Ba điều của AC-2, đọc bằng AST trên dân số sinh từ đĩa (`quetTs` trên `apps/agent/agent`):
1. tham số `input` của `builderSessionAttributes` không có khoá `message`;
2. không khai báo hay `export` nào tên `builderCommandType`;
3. tại mọi `CallExpression` gọi `builderSessionAttributes`, initializer của thuộc tính `commandType` là `PropertyAccessExpression` trần.

Sàn dân số: số lời gọi `builderSessionAttributes` tìm được phải ≥ 1; bằng 0 → mã 2 với chữ `dân số rỗng`.
Vi phạm → mã 2, in `file:dòng` của từng chỗ.

- [ ] **Bước 2: Chạy trên cây thật — chiều xanh**

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs`
Mong đợi: mã 0.

- [ ] **Bước 3: Thêm hai vectơ đỏ vào chính răng**

Răng nhận `--vecto <tên>`; mỗi vectơ dựng cây sao riêng, đột biến trong đó, chạy lại chính mình với `--goc <cây sao>`, và đòi mã 2.

- `cay-lai-tham-so`: chèn `message: Prisma.JsonValue;` vào khối tham số `input` của `builderSessionAttributes` trong bản sao.
- `cho-goi-tinh-toan`: đổi `commandType: row.commandType` tại chỗ gọi thành một ternary xuống dòng đọc `row.message`.

Thông điệp ghim của cả hai: `apps/agent con cam tin nhan o cho quyet quyen`.

- [ ] **Bước 4: Chạy hai vectơ — chiều đỏ**

```bash
node _acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs --vecto cay-lai-tham-so
node _acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs --vecto cho-goi-tinh-toan
```
Mong đợi: cả hai mã 2, thông điệp chứa `apps/agent con cam tin nhan o cho quyet quyen` và một `file:dòng`.
Vectơ nào ra mã 0 → răng chưa bắt được nó, sửa răng chứ đừng sửa vectơ.

- [ ] **Bước 5: Commit**

```bash
git add _acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs
git commit -m "rang(do-quyen): E3 apps/agent khong cam tin nhan o cho quyet quyen"
```

---

### Task 4: Răng E2 — chiều đỏ của phép đo hành vi

**independent:** false — cần Task 1 và Task 2.
**Phục vụ:** AC-1 (E2).

**Files:**
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/cong-quyen-do.mjs`

**Interfaces:**
- Consumes: `voiCaySao`, `assertDanhTinh`, `chay`, `hong` từ `chung.mjs`

- [ ] **Bước 1: Viết răng — đối chứng dương rồi hai vectơ**

Với mỗi vectơ: một cây sao MỚI → `assertDanhTinh(sao)` → chạy `bun test test/quyen-luot.spec.ts` trong `sao/apps/agent`, đòi mã 0 (không đạt → mã 2, chữ `đối chứng dương hỏng`) → đột biến → chạy lại, đòi mã KHÁC 0.

- `mo-cong`: trong `sao/apps/agent/agent/lib/session-purpose.ts`, đổi thân `builderTurnAuthorized` thành `return true;`.
- `ternary-xuong-dong`: trong `sao/apps/agent/agent/lib/custom-agent-dispatch.ts`, đổi `commandType: row.commandType` thành ternary xuống dòng đọc `row.message`, viết đúng hình dạng mà bộ dò regex cũ mù:

```
		commandType:
			JSON.stringify(row.message).includes("agent")
				? "CREATE_AGENT"
				: row.commandType,
```

Thông điệp ghim của cả hai: `cong dong khi hang khai CHAT`.
In đường tuyệt đối của cây sao đã chạy; đường nằm ngoài cây sao → mã 2.

- [ ] **Bước 2: Chạy hai vectơ — chiều đỏ**

```bash
node _acceptance/do-quyen-luot-bang-hanh-vi/rang/cong-quyen-do.mjs --vecto mo-cong
node _acceptance/do-quyen-luot-bang-hanh-vi/rang/cong-quyen-do.mjs --vecto ternary-xuong-dong
```
Mong đợi: cả hai mã khác 0, thông điệp chứa `cong dong khi hang khai CHAT`.

- [ ] **Bước 3: Kiểm cây sao đã dọn**

Chạy: `git worktree list`
Mong đợi: không còn cây sao `dq-sao-*` nào.

- [ ] **Bước 4: Commit**

```bash
git add _acceptance/do-quyen-luot-bang-hanh-vi/rang/cong-quyen-do.mjs
git commit -m "rang(do-quyen): E2 chieu do cua phep do hanh vi"
```

---

### Task 5: Răng E4 — sàn nguồn ghi ở `apps/api/src`

**independent:** true — chỉ cần Task 1; không đụng tệp nào của Task 2, 3, 4.
**Phục vụ:** AC-3 (E4).

**Files:**
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs`

**Interfaces:**
- Consumes: `GOC`, `voiCaySao`, `hong` từ `chung.mjs`; `quetTs`, `nap`, `duyet`, `viTri`, `duoiKhoaDoc`, `hamBao` từ `ast.mjs`
- Produces: hằng `GHIM` — mảng khoá bền `"<tệp> :: <hàm bao> :: <nguồn>"`

- [ ] **Bước 1: Viết bộ thu dân số**

Quét `apps/api/src` bằng `quetTs`. Trong mỗi tệp, tìm `CallExpression` mà callee là `PropertyAccessExpression` có tên `create` / `update` / `upsert`. Lấy đối số đầu, tìm thuộc tính `data`, lấy object literal của nó. Từ object đó đi xuống đệ quy, kể cả qua các thuộc tính `create` / `update` lồng của quan hệ. Gom mọi `PropertyAssignment` tên `commandType`. Loại phần tử nào `duoiKhoaDoc(node)` trả `true`.

Phân loại nguồn:
- `input.commandType` — initializer là `PropertyAccessExpression` có `name.text === "commandType"` → nguồn `"khai"`;
- `commandTypeFromAuthorization(...)` — initializer là `CallExpression` với callee tên đúng chuỗi đó → nguồn `"suy"`;
- còn lại → nguồn `"la"`.

- [ ] **Bước 2: Ghim danh sách — ma trận toàn phần**

```js
const GHIM = [
	"apps/api/src/conversations/conversations.service.ts :: createBuilder :: khai",
	"apps/api/src/conversations/conversations.service.ts :: submitBuilder :: khai",
	"apps/api/src/conversations/conversations.service.ts :: respondToQuestion :: suy",
];
```

So tập tìm được với `GHIM`. Thừa hay thiếu một phần tử đều là mã 2, in CẢ HAI danh sách. Mỗi phần tử in kèm `file:dòng` để người mở thẳng.
Nguồn `la` xuất hiện → mã 2, in `file:dòng` kèm câu: `them mot nguon hop le thu ba la viec phai sua danh sach nguon trong rang/nguon-ghi.mjs, khong phai viec de thuoc do oan`.

- [ ] **Bước 3: Chạy trên cây thật — chiều xanh**

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs`
Mong đợi: mã 0, in đúng ba dòng đã ghim.
Ra khác 3 → bộ thu dân số sai, sửa bộ thu chứ đừng sửa `GHIM`.

- [ ] **Bước 4: Bốn vectơ**

Mỗi vectơ một cây sao mới, đột biến `sao/apps/api/src/conversations/conversations.service.ts`, rồi chạy lại chính răng với `--goc <cây sao>`.

- `ghim-cung`: đổi `commandType: input.commandType` ở `submitBuilder` thành `commandType: "CREATE_AGENT"` → mã 2.
- `bien-trung-gian`: thêm `const ct = doanQuyen(input.message);` ngay trên và đổi thành `commandType: ct` → mã 2.
- `quan-he-long`: trong lời gọi `agentConversation.create` của `createBuilder`, thêm một quan hệ lồng thứ hai mang `commandType: "CREATE_AGENT"` → mã 2, và `file:dòng` in ra phải trỏ đúng dòng vừa cấy.
- `duoi-select`: thêm `commandType: true` vào một khối `select` → **vẫn mã 0**.

Thông điệp ghim của ba vectơ đỏ: `nguon ghi commandType khong nam trong danh sach da ghim`.

- [ ] **Bước 5: Chạy bốn vectơ**

```bash
node _acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs --vecto ghim-cung
node _acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs --vecto bien-trung-gian
node _acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs --vecto quan-he-long
node _acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs --vecto duoi-select
```
Mong đợi: ba cái đầu mã 2 với thông điệp ghim; `duoi-select` **mã 0**.
`duoi-select` ra đỏ → răng đang không phân biệt đọc với ghi, sửa `duoiKhoaDoc`.

- [ ] **Bước 6: Commit**

```bash
git add _acceptance/do-quyen-luot-bang-hanh-vi/rang/nguon-ghi.mjs
git commit -m "rang(do-quyen): E4 san nguon ghi commandType doc bang AST"
```

---

### Task 6: Răng E5 — chiều đỏ của đường mang theo

**independent:** false — cần Task 1 và Task 2.
**Phục vụ:** AC-4 (E5).

**Files:**
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/mang-theo-do.mjs`

**Interfaces:**
- Consumes: `voiCaySao`, `assertDanhTinh`, `chay`, `hong` từ `chung.mjs`

- [ ] **Bước 1: Viết răng**

Cùng khuôn Task 4. Đối chứng dương: `bun test test/quyen-luot.spec.ts` trong `sao/apps/agent` mã 0.
`mang-theo-luon-mo`: trong `sao/packages/validation/src/builder-question.ts`, đổi thân `commandTypeFromAuthorization` thành `return "CREATE_AGENT";`.
Thông điệp ghim: `cau tra loi ke thua quyen cua luot da hoi`.

- [ ] **Bước 2: Chạy vectơ**

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/mang-theo-do.mjs --vecto mang-theo-luon-mo`
Mong đợi: mã khác 0, thông điệp chứa chuỗi ghim.
Ra xanh → khối `ke-thua` của spec đang không đo đường mang theo; sửa spec, không sửa vectơ.

- [ ] **Bước 3: Commit**

```bash
git add _acceptance/do-quyen-luot-bang-hanh-vi/rang/mang-theo-do.mjs
git commit -m "rang(do-quyen): E5 chieu do cua duong mang theo"
```

---

### Task 7: Răng E6 — bộ dò cũ không mọc lại

**independent:** false — cần Task 1 và Task 2.
**Phục vụ:** AC-5 (E6).

**Files:**
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/bo-do-grep.mjs`

**Interfaces:**
- Consumes: `GOC`, `voiCaySao`, `hong` từ `chung.mjs`; `nap`, `duyet`, `viTri` từ `ast.mjs`

- [ ] **Bước 1: Viết răng — ba điều**

Đọc `apps/agent/test/quyen-luot.spec.ts` bằng AST.
1. Không `CallExpression` nào tên `it` có đối số chuỗi chứa `dem tren dia`.
2. Không `CallExpression` nào là `<x>.split(...)` với đối số là `StringLiteral` bằng `"\n"` mà trong cùng một hàm bao lại có một `RegularExpressionLiteral`.
3. Có đúng một `describe` với đối số chuỗi `"suy-dien"`, và bên trong nó có ≥1 `it`.
Vi phạm → mã 2, in `file:dòng`. Mất khối `describe("suy-dien")` → mã 2 với chữ `lenh ql_khong_suy_dien cua ho so cu loc theo dung ten nay`.

- [ ] **Bước 2: Chạy — chiều xanh**

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/bo-do-grep.mjs`
Mong đợi: mã 0.

- [ ] **Bước 3: Vectơ `cay-lai-bo-do`**

Cấy vào bản sao đúng khối cũ (`nguon.split("\n")` cộng một literal regex trong cùng hàm), chạy lại với `--goc <cây sao>`, đòi mã 2 kèm `file:dòng`.
Thông điệp ghim: `bo do theo dong moc lai`.

- [ ] **Bước 4: Chạy vectơ**

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/bo-do-grep.mjs --vecto cay-lai-bo-do`
Mong đợi: mã 2, thông điệp chứa chuỗi ghim.

- [ ] **Bước 5: Commit**

```bash
git add _acceptance/do-quyen-luot-bang-hanh-vi/rang/bo-do-grep.mjs
git commit -m "rang(do-quyen): E6 bo do theo dong khong moc lai"
```

---

### Task 8: Tài liệu, vết hồ sơ cũ, và răng E9

**independent:** true — chỉ cần Task 1; không đụng tệp nào của Task 2 đến Task 7.
**Phục vụ:** AC-6 (E7), AC-8 (E9).

**Files:**
- Modify: `docs/agent.md` (mục `Team-agent builder and runner`, ngay dưới gạch đầu dòng **Creation requires the current `CREATE_AGENT` turn.**)
- Modify: `_acceptance/quyen-luot-mang-theo/contract.md` (chỉ `## Notes`)
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/vet-ho-so-cu.mjs`

**Interfaces:**
- Consumes: `GOC`, `voiCaySao`, `hong` từ `chung.mjs`
- Produces: hai hằng `SHA_AC5` và `SHA_E5` — sha256 của hai khối đóng băng, lấy ở lượt đầu rồi viết vào mã

- [ ] **Bước 1: `docs/agent.md` — khai nguồn quyền của mỗi lượt**

Thêm một gạch đầu dòng mới ngay sau gạch **Creation requires the current `CREATE_AGENT` turn.**, viết bằng giọng của tệp đó (tiếng Anh, câu ngắn, in đậm mệnh đề đầu). Ba điều phải nói được:
1. `commandType` của lượt tạo và lượt submit là lời khai của client mà máy chủ **không đối chứng** — không có sự thật phía máy chủ nào để đối chứng, vì ý định chỉ tồn tại ở phía người bấm;
2. máy chủ suy quyền của lượt trả lời từ câu hỏi treo đã lưu (`commandTypeFromAuthorization` ở `respondToQuestion`);
3. agent không bao giờ suy lại — nó đọc giá trị của hàng và chấm cổng.
Kèm một câu nói vì sao thế là đủ: kẻ cổng này chặn là mô hình, và biên duyệt của người là lúc deploy.

- [ ] **Bước 2: Lấy sha256 hai khối đóng băng**

```bash
node -e "
const c=require('crypto'),fs=require('fs');
const t=fs.readFileSync('_acceptance/quyen-luot-mang-theo/contract.md','utf8');
const ac5=t.slice(t.indexOf('**AC-5 —'), t.indexOf('**AC-7 —'));
const e=fs.readFileSync('_acceptance/quyen-luot-mang-theo/evals.yaml','utf8');
const e5=e.slice(e.indexOf('  - id: E5'), e.indexOf('  - id: E6'));
console.log('AC5', c.createHash('sha256').update(ac5).digest('hex'));
console.log('E5 ', c.createHash('sha256').update(e5).digest('hex'));
"
```
Chép hai giá trị vào `SHA_AC5` và `SHA_E5` của răng ở bước 4.

- [ ] **Bước 3: Dòng Notes của hồ sơ cũ**

Thêm đúng một gạch đầu dòng vào `## Notes` của `_acceptance/quyen-luot-mang-theo/contract.md`. Phải nêu tên slug `do-quyen-luot-bang-hanh-vi` VÀ nói rõ rằng `expected` đã ghim của E5 không còn mô tả thứ lệnh của nó chạy. Không sửa một ký tự nào ngoài `## Notes`.

- [ ] **Bước 4: Viết răng E9**

Hai điều: (1) so sha256 của khối AC-5 và khối eval E5 với hai hằng đã ghim — khác thì mã 2, in cả hai sha; (2) `## Notes` có dòng nêu slug và có ý `expected` lỗi thời — thiếu một trong hai ý → mã 2.
Răng phải IN ra hai vùng (đóng băng · được động) để người đọc thấy chúng không đè nhau.

- [ ] **Bước 5: Chạy — chiều xanh**

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/vet-ho-so-cu.mjs`
Mong đợi: mã 0.

- [ ] **Bước 6: Vectơ `sua-mot-ky-tu`**

Sửa một ký tự trong khối AC-5 của bản sao, chạy lại với `--goc <cây sao>`, đòi mã 2 với hai sha khác nhau.
Thông điệp ghim: `chu cua ho so cu da doi`.

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/vet-ho-so-cu.mjs --vecto sua-mot-ky-tu`
Mong đợi: mã 2, thông điệp chứa chuỗi ghim.

- [ ] **Bước 7: Commit**

```bash
git add docs/agent.md _acceptance/quyen-luot-mang-theo/contract.md _acceptance/do-quyen-luot-bang-hanh-vi/rang/vet-ho-so-cu.mjs
git commit -m "docs(agent): khai nguon quyen cua moi luot; vet chinh vao ho so cu"
```

---

### Task 9: E10 — bốn lệnh máy của hồ sơ cũ vẫn thoát 0

**independent:** false — cần Task 2.
**Phục vụ:** AC-9 (E10).

**Files:**
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/ho-so-cu-con-chay.sh`

- [ ] **Bước 1: Viết script**

Chạy tuần tự bốn lệnh, mỗi lệnh in tên trước khi chạy; lệnh nào khác 0 thì in tên lệnh và thoát bằng đúng mã đó.

```bash
#!/usr/bin/env bash
set -u
GOC="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$GOC/apps/agent" || exit 2
declare -a TEN=(ql_quyen_ke_thua ql_khong_suy_dien ql_con_biet_cua_ra ql_cong_dong_that)
declare -a LOC=(ke-thua suy-dien cua-ra cong-dong)
for i in "${!TEN[@]}"; do
	printf 'ho so cu: %s (-t %s)\n' "${TEN[$i]}" "${LOC[$i]}"
	bun test test/quyen-luot.spec.ts -t "${LOC[$i]}" || {
		ma=$?
		printf 'lenh may cua ho so cu that bai: %s\n' "${TEN[$i]}" >&2
		exit "$ma"
	}
done
printf 'bon lenh may cua ho so cu deu thoat 0\n'
```

- [ ] **Bước 2: Chạy — chiều xanh**

Chạy: `bash _acceptance/do-quyen-luot-bang-hanh-vi/rang/ho-so-cu-con-chay.sh`
Mong đợi: mã 0, in bốn dòng tên lệnh rồi dòng kết.

- [ ] **Bước 3: Chiều đỏ**

Đổi tạm một `LOC` thành một tên khối không tồn tại, chạy lại → mã khác 0 kèm dòng `lenh may cua ho so cu that bai`. Trả lại như cũ.
E10 là eval `test` nên không cần dòng trong `khai-sinh.json`; chiều đỏ này chạy tay một lần và ghi kết quả vào transcript.

- [ ] **Bước 4: Commit**

```bash
git add _acceptance/do-quyen-luot-bang-hanh-vi/rang/ho-so-cu-con-chay.sh
git commit -m "rang(do-quyen): E10 bon lenh may cua ho so cu van thoat 0"
```

---

### Task 10: Bản khai sinh — đếm theo vectơ

**independent:** false — cần mọi răng đã xong.
**Phục vụ:** AC-7 (E8).

**Files:**
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.json`
- Create: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs`

**Interfaces:**
- Consumes: `GOC`, `chay`, `hong` từ `chung.mjs`
- Khuôn mỗi dòng khai: `{ "id": "<id eval>", "vecto": "<tên>", "chay": ["node", "<đường>", "--vecto", "<tên>"], "ghim": "<chuỗi>", "ma": <số> }`

- [ ] **Bước 1: Viết `khai-sinh.json` — 12 dòng**

Theo đúng bảng vectơ ở đầu kế hoạch. `ma` của `duoi-select` là `0`; mọi dòng khác khác 0.

- [ ] **Bước 2: Viết `khai-sinh.mjs`**

1. Đọc `evals.yaml` của vòng này; với mỗi eval `executor: script`, đếm số dòng trong `expected` khớp `/^\s*vecto "([^"]+)"/m`. Số dòng khai mang `id` ấy phải BẰNG đúng số đó — lệch → mã 2, in id eval và hai con số.
2. Tập tên `vecto` trong bản khai phải bằng tập tên trong `expected` — lệch → mã 2, in cả hai tập.
3. Chạy từng dòng: mã thoát phải bằng `ma` đã khai VÀ thông điệp phải chứa nguyên văn `ghim`. Sai → mã 2, in tên dòng.
4. Dòng khai `ma` khác 0 mà chạy ra 0 → in đúng chữ `dong khai ra xanh` kèm tên dòng, mã 2.
5. Bản khai 0 dòng → mã 2.

- [ ] **Bước 3: Chạy — chiều xanh**

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs`
Mong đợi: mã 0, in 12 dòng đã chạy với mã thoát của từng dòng.

- [ ] **Bước 4: Vectơ `khai-thieu-vecto`**

`khai-sinh.mjs --vecto khai-thieu-vecto`: chép `khai-sinh.json` sang tệp tạm đã **bỏ một dòng** của E4, chạy lại chính nó với `KHAI_SINH=<tệp tạm>` và chỉ làm bước 1-2 (không chạy lại 12 dòng, tốn thời gian), đòi mã 2.
Thông điệp ghim: `so dong khai lech so vecto`.

Chạy: `node _acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs --vecto khai-thieu-vecto`
Mong đợi: mã 2, thông điệp chứa chuỗi ghim.

- [ ] **Bước 5: Cổng kho, trọn bộ**

```bash
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```
Mong đợi: cả năm thoát 0.

- [ ] **Bước 6: Commit**

```bash
git add _acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.json _acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs
git commit -m "rang(do-quyen): E8 ban khai sinh dem theo vecto"
```

---

## Bảng trình cho người

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Một lượt trò chuyện thường, dù gõ đúng câu xin dựng tác nhân, vẫn bị bộ dựng từ chối — và điều đó được chứng minh bằng chính đường chạy thật | `custom-agent-dispatch.ts`, `quyen-luot.spec.ts` | AC-1 (cổng đóng, đo từ hàng) · AC-2 (không cầm tin nhắn) |
| Bộ dựng không còn cầm nội dung tin nhắn ở chỗ nó quyết quyền | `custom-agent-dispatch.ts` | AC-2 (đúng theo cấu trúc) |
| Một đường ghi quyền mới mọc lên là thước đỏ ngay, kèm số dòng | `rang/nguon-ghi.mjs` | AC-3 (sàn nguồn ghi) |
| Đội đọc tài liệu là biết quyền của lượt đầu do trình duyệt tự khai | `docs/agent.md` | AC-6 (tài liệu khai thẳng) |
| Mỗi phép đo mới từng chạy ra đỏ một lần thật | `rang/khai-sinh.json` | AC-7 (khai sinh theo vectơ) |
| Hồ sơ vòng trước giữ nguyên chữ, và bốn phép đo của nó vẫn xanh | `quyen-luot-mang-theo/contract.md`, `rang/ho-so-cu-con-chay.sh` | AC-8 (vết chỉnh) · AC-9 (hồ sơ cũ còn chạy) |

## Thứ tự và fan-out

```
Task 1  ──┬── Task 2 ──┬── Task 3
          │            ├── Task 4
          │            ├── Task 6
          │            ├── Task 7
          │            └── Task 9
          ├── Task 5   (independent: true)
          └── Task 8   (independent: true)
                        └────────────────── Task 10 (cần tất cả)
```

Task 5 và Task 8 là hai task `independent: true` đối với nhau và đối với chuỗi Task 2 → 3/4/6/7/9. Chúng chạy fan-out qua workflow `execute-parallel` sau khi Task 1 và Task 2 đã commit.
