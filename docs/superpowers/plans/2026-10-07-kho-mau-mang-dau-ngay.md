# Kho mẫu mang dấu ngay khi tạo — Implementation Plan

> **For agentic workers:** chạy trong `/feature-loop` (T2): S3 tuần tự trong phiên chính, S4 do Workflow `acceptance-verify` chấm.

**Goal:** Kho mẫu `crm_<cây>__mau_do` mang dấu phiên đo loại `building` ngay sau `CREATE DATABASE`, để lượt `--tao` bị giết giữa chừng để lại kho mà `--quet` gom được và `--tao` kế dựng lại.

**Architecture:** Thêm loại dấu thứ ba vào bộ ghi/đọc dấu của `packages/db/src/measure-database.ts`; `buildTemplate` trong `packages/db/scripts/measure-db.ts` ghi dấu đó ngay câu lệnh kế sau `CREATE DATABASE`. Luật quét và luật dùng lại kho mẫu không đổi: chúng đã đúng với dấu mới.

**Tech Stack:** Bun 1.4 (`bun:test`), `pg`, Postgres 16 trong container `crm-postgres`.

**Spec:** `docs/superpowers/specs/2026-10-07-kho-mau-mang-dau-ngay-design.md` · contract `_acceptance/kho-mau-mang-dau-ngay/contract.md` · evals `_acceptance/kho-mau-mang-dau-ngay/evals.yaml`

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Hằng có thể chỉnh nằm trong một object cấu hình của khu (`MEASURE_DATABASE`), không rải ở đầu tệp.
- Tên ca mới không chứa mẫu `-t` của bốn lệnh cũ: `tao`, `kho-mau`, `xoa`, `quet-mo-coi`, `ten-kho`.
- Không xoá tay 7 kho bằng chứng và kho tái hiện `crm_thudieutra26552__mau_do`.
- Năm lệnh chứng ở gốc: `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.

## Review Focus

1. Giết đúng lúc migrate vừa xong mà trước khi seed chạy — điểm «seed» phải chờ seed ghi hàng `user` đầu tiên (Task 2).
2. Tiến trình con `prisma`/seed mồ côi giữ kết nối vào kho mẫu — ca giết cả nhóm và chờ kho hết kết nối trước khi đọc (Task 2).
3. Bảng `deal` chưa tồn tại lúc giết trong migrate — đếm qua `to_regclass`, không nuốt lỗi khác (Task 2).
4. Hai lượt `bun run test` song song trên cùng máy chủ — mọi tên kho mang `TEST_RUN_ID`, lượt quét giới hạn bằng tiền tố riêng (Task 2).
5. Chuỗi dấu hỏng nhưng cùng tiền tố — `parseMeasureComment` trả `null` (Task 1).

---

### Task 1: Dấu «đang dựng» trong bộ ghi/đọc dấu

**Phục vụ:** E1 · **independent:** false (Task 2 dùng `templateBuildingComment`)

**Files:**
- Modify: `packages/db/src/measure-database.ts`
- Test: `packages/db/test/measure-database.spec.ts` (describe mới `dau-dang-dung`)

**Interfaces — Produces:** `MEASURE_DATABASE.buildingMark = "template-building"` · `templateBuildingComment(createdAt: number): string` · nhánh `{ kind: "building"; createdAt: number }` của `MeasureComment`.

- [ ] Viết ca đỏ:

```ts
describe("dau-dang-dung", () => {
	it("reads back the building mark written by the module and refuses a broken one", () => {
		const at = Date.UTC(2026, 9, 7, 5, 0, 0);
		const written = templateBuildingComment(at);
		const parsed = parseMeasureComment(written);

		expect(parsed, "dau dang dung doc lai sai").toEqual({ kind: "building", createdAt: at });
		expect(parsed ? lastTouched(parsed) : 0, "dau dang dung doc lai sai").toBe(at);

		const broken: [string, string][] = [
			["gio hong", `${MEASURE_DATABASE.commentPrefix} ${MEASURE_DATABASE.buildingMark} created khong-phai-gio`],
			["duoi thua", `${written} x`],
		];
		for (const [label, text] of broken) {
			expect(parseMeasureComment(text), `dau dang dung hong van doc duoc: ${label}`).toBe(null);
		}
	});
});
```

- [ ] Chạy `cd packages/db && bun test test/measure-database.spec.ts -t dau-dang-dung` → đỏ (`templateBuildingComment` chưa có).
- [ ] Cài: thêm `buildingMark: "template-building"` vào `MEASURE_DATABASE`; nhánh `building` vào `MeasureComment`; hàm ghi; nhánh đọc trong `parseMeasureComment`:

```ts
export function templateBuildingComment(createdAt: number): string {
	return `${MEASURE_DATABASE.commentPrefix} ${MEASURE_DATABASE.buildingMark} created ${new Date(createdAt).toISOString()}`;
}
```

```ts
const building = new RegExp(`^${MEASURE_DATABASE.buildingMark} created (\\S+)$`).exec(rest);
if (building) {
	const createdAt = Date.parse(building[1] ?? "");
	return Number.isNaN(createdAt) ? null : { kind: "building", createdAt };
}
```

`lastTouched` không đổi: mọi loại khác `template` dùng `createdAt`.
- [ ] Chạy lại → xanh. Phá thử: bỏ nhánh đọc `building` → đỏ «dau dang dung doc lai sai»; trả lại.

### Task 2: `buildTemplate` ghi dấu ngay sau CREATE, cùng nhóm ca giết giữa chừng

**Phục vụ:** E2, E3, E4, E5–E8 · **independent:** false (cần Task 1)

**Files:**
- Modify: `packages/db/scripts/measure-db.ts` (`markTemplateBuilding`, `buildTemplate`)
- Test: `packages/db/test/measure-database.spec.ts` (describe mới `giet-giua-chung`)

**Interfaces — Consumes:** `templateBuildingComment` (Task 1). **Produces:** `markTemplateBuilding(client: pg.Client, name: string, createdAt: number): Promise<void>`.

- [ ] Viết ba ca đỏ (`giet-mang-dau`, `giet-quet-gom`, `giet-dung-lai`) với thủ tục giết dùng chung. Thủ tục: `spawn("bun", ["scripts/measure-db.ts", "--tao", "--ten", name], { detached: true })`, hỏi Postgres mỗi 50 ms tới điểm giết (trần 120 s; CLI thoát trước điểm giết → ném lỗi có tên), `process.kill(-pid, "SIGKILL")`, chờ thoát, chờ kho mẫu hết kết nối (trần 30 s). Điểm `migrate`: `_prisma_migrations` có ≥ 1 hàng. Điểm `seed`: số migration hoàn tất bằng số thư mục migration và bảng `"user"` có ≥ 1 hàng. Hằng thời gian của bài kiểm nằm trong một object `GIET` đầu tệp spec.
- [ ] Chạy `bun test test/measure-database.spec.ts -t giet-` trên bản chưa sửa `measure-db.ts` → `giet-mang-dau` đỏ «khong mang dau dang dung: migrate», `giet-quet-gom` đỏ «luot quet khong gom kho mau cua luot bi giet».
- [ ] Cài:

```ts
export async function markTemplateBuilding(
	client: pg.Client,
	name: string,
	createdAt: number,
): Promise<void> {
	await comment(client, name, templateBuildingComment(createdAt));
}
```

và trong `buildTemplate`, ngay sau `await client.query(\`CREATE DATABASE "${name}"\`);`:

```ts
await markTemplateBuilding(client, name, Date.now());
```

- [ ] Chạy `-t giet-` → xanh; chạy `-t dau-dang-dung`, `-t tao`, `-t kho-mau`, `-t xoa`, `-t quet-mo-coi` → xanh, số ca 1/1/2/2/1.
- [ ] Phá thử (trên bản đã commit, trả lại bằng tay từng nhát, không `git checkout` khi còn thay đổi chưa commit): (1) bỏ `markTemplateBuilding` → E2 đỏ; (2) thêm `markTemplate(client, name, fingerprint, now, now)` giữa `migrate deploy` và seed → E2 đỏ «…: seed», E4 đỏ «kho mau do dang duoc dung lai: seed»; (3) `lastTouched` của `building` cộng `maxAgeMs` → E3 đỏ «luot quet khong gom…».

### Task 3: Tài liệu

**Phục vụ:** E9 · **independent:** true

**Files:** Modify `docs/setup.md` mục «Screen measurements get a database of their own».

- [ ] Thêm vào gạch đầu dòng `--tao`: kho mẫu mang dấu «đang dựng» ngay khi được tạo, trước `migrate deploy` và seed, và đổi sang dấu kho mẫu khi seed xong.
- [ ] Thêm vào gạch đầu dòng `--quet`: lượt `--tao` bị giết giữa chừng để lại kho mẫu có dấu; `--quet` xoá nó sau 12 giờ không kết nối, và `--tao` kế của cây dựng lại nó thay vì clone. Kho mẫu không dấu của lượt bị giết trước bản sửa này không phải của lượt quét: xoá bằng tay.

### Kết S3

Năm lệnh chứng ở gốc xanh → contract `status: implemented` → S4.
