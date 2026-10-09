# Trang soạn OKR không lạc — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa ba lỗi lạc chỗ của trang soạn OKR (Ngoài-3/4/5 của K2): khoá URL riêng, lỗi hoàn tác nhóm có chỗ hiện, lần nộp bị từ chối không thành mốc.

**Architecture:** Khoá URL đăng ký ở `SEARCH_PARAM.okr`. Lỗi nhóm vẽ trong `KaraProposalGroup` (`packages/ui`). Kết quả nộp có một nguồn ở `packages/validation/src/okr-cuoc-soan.ts` (`KET_QUA_NOP`, `docKetQuaNop`); `moc-nop.ts` đọc nó ở biên.

**Tech Stack:** Next 16, nuqs, bun test + jsdom, zod, eve.

**Spec:** `docs/superpowers/specs/2026-10-08-soan-okr-khong-lac-design.md` · hợp đồng `_acceptance/soan-okr-khong-lac/contract.md`.

**Thực thi:** tuần tự trong phiên chính (feature-loop T2). Không task nào `independent: true`: Task 3 và 4 dùng mã của Task 1–2.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- `/packages/ui` là nguồn giao diện; màn gọi không thêm `className` cho khối lỗi.
- Parse ở biên bằng Zod; không `Record<string, unknown>`.
- Bài DOM chỉ so giá trị nguyên thuỷ trong `expect`; tệp DOM mới chạy lần đầu dưới trần thời gian, đo RSS (luật 35 của đợt).
- `_acceptance/config.yaml` chỉ thêm dòng; `apps/agent-okr/agent/lib/nop-ban-nhap.ts` chỉ đổi dòng `ketQua` và thêm dòng import.
- Chiều đỏ trên vật thật chạy tuần tự (khuôn `dot-bien-lib.mjs`).

## Review Focus

- Fixture lời gọi nộp trong bài kiểm của K2 (`soan-okr-moc.spec.ts`, `soan-okr-trang.dom.tsx`) chưa có `output`: luật mới làm chúng mất mốc nên phải thêm `output` `da-ghi` dựng bằng `ketQuaNop` thật, không chỉnh kỳ vọng cho xanh.
- Lần nộp `da-ghi` mà đầu vào không qua lược đồ bản nháp: vẫn là mốc «Kara nộp bản nháp» (`docDuoc: false`), như K2.
- `gioNopCuoi` khi lần cuối bị từ chối: lấy giờ lần đã ghi trước đó, không trả null.
- Bộ lọc «chỉ dòng chờ» đọc khoá mới; link cũ `?loc=cho` không còn bật bộ lọc (đã khai Out of scope).
- Bài DOM dùng `useRecordStack` thật cần `NuqsTestingAdapter` chung với `KhungSoan` để hai bên thấy cùng URL.

---

### Task 1: Khoá URL riêng cho trang soạn (Ngoài-3)

**Files:** Modify `apps/app/lib/search-param-keys.ts`, `soan/cau-hinh.ts`, `soan/khung-soan.tsx`, `soan/bang-nhap.tsx`, `apps/app/lib/search-param-keys.test.ts` · Create `apps/app/test/soan-okr-khong-lac.dom.tsx` (describe `k2b-tab`).

**Phục vụ:** E1, E2 · **independent:** false

- [ ] Thêm vào `SEARCH_PARAM.okr`: `tabSoan: "tabSoan"`, `locSoan: "locSoan"`. Xoá `thamSo` khỏi `SOAN_UI`. `useTabSoan` đọc `SEARCH_PARAM.okr.tabSoan`; `BangNhap` đọc `SEARCH_PARAM.okr.locSoan`.
- [ ] Ca mới trong `search-param-keys.test.ts`: «trang soạn đọc khoá đã đăng ký».
- [ ] Bài DOM `k2b-tab`: `NuqsTestingAdapter` bọc `KhungSoan` (khổ hẹp) + một thành phần thử gọi `useRecordStack().open/close` và `useRecordSheetView`; ma trận 3 bước × 3 ô.
- [ ] Verify: `bun run test` của hai tệp; chạy đỏ bằng tay với `tabSoan: "tab"` (bản sao) trước khi giao cho `dot-bien.mjs`.

### Task 2: Lỗi hoàn tác cả nhóm (Ngoài-4)

**Files:** Modify `packages/ui/src/components/kara/proposal.tsx`, `soan/the-nhap.tsx` · Create `packages/ui/test/kara-proposal-group-loi.dom.tsx` · Modify `apps/app/test/soan-okr-khong-lac.dom.tsx` (describe `k2b-nhom-loi`).

**Phục vụ:** E3, E4 · **independent:** false

- [ ] `batchDecided?: { text: ReactNode; onUndo?: () => void; error?: ReactNode }`; dưới `ProposedChangeReceipt` vẽ `{batchDecided.error ? <FieldError data-loi="nhom">{batchDecided.error}</FieldError> : null}`.
- [ ] `NhomMucTieu` truyền `error: n.loi[mt.id]` trong `batchDecided`.
- [ ] Bài `kara-proposal-group-loi`: có/không error; `nextElementSibling` của receipt là field-error.
- [ ] Bài `k2b-nhom-loi`: ba ca lỗi + ca thử lại thành công.

### Task 3: Lần nộp không thành không thành mốc (Ngoài-5)

**Files:** Modify `packages/validation/src/okr-cuoc-soan.ts`, `apps/agent-okr/agent/lib/nop-ban-nhap.ts`, `soan/moc-nop.ts`, `soan/dung-cuoc-soan.ts`, `soan/hoi-thoai-soan.tsx`, `apps/app/lib/messages/okr-soan.ts`, `apps/app/test/soan-okr-moc.spec.ts`, `apps/app/test/soan-okr-trang.dom.tsx` · Create `apps/app/test/soan-okr-khong-lac.spec.ts`.

**Phục vụ:** E5, E6, E7 · **independent:** false

- [ ] `export const KET_QUA_NOP = ["da-ghi", "tu-choi"] as const;` và `docKetQuaNop(value: unknown): { ketQua: (typeof KET_QUA_NOP)[number]; lyDo: string } | null` (safeParse, không ném).
- [ ] Agent: `ketQua: z.enum(KET_QUA_NOP)` + import.
- [ ] `moc-nop.ts`: `export type NopKhongThanh = { itemId: string; loai: "tu-choi" | "loi" | "khong-doc"; lyDo: string | null }`; `export function luotNop(items): { mocs: MocNop[]; khongThanh: NopKhongThanh[] }` — mốc chỉ khi `docKetQuaNop(item.output)?.ketQua === "da-ghi"` và `!item.failed`; gốc so sánh chỉ cập nhật ở lần đã ghi. `mocTuTranscript(items)` = `luotNop(items).mocs`. `gioNopCuoi` tìm lượt cuối có lần nộp đã ghi.
- [ ] `dung-cuoc-soan.ts` trả thêm `nopKhongThanh` (Map theo itemId); `hoi-thoai-soan.tsx` vẽ `KaraSystemLine` cho lần không thành: `m.moc.nopKhongThanh(lyDo)` hoặc `m.moc.nopKhongDoc`.
- [ ] Tin nhắn mới cả hai thứ tiếng; `messages-guard.spec.ts` nếu đòi ghim.
- [ ] Fixture K2: thêm `output` dựng bằng `ketQuaNop.parse` thật cho mọi lời gọi nộp đang mong là mốc.
- [ ] Spec `k2b-moc-ba`, `k2b-moc-hong`; DOM `k2b-moc-dom`.

### Task 4: Răng E7–E9

**Files:** Create `_acceptance/soan-okr-khong-lac/rang/{mot-nguon,dot-bien,ranh-gioi}.mjs`.

**Phục vụ:** E7, E8, E9 · **independent:** false

- [ ] `mot-nguon.mjs`: quan hệ `ketQuaNop.shape.ketQua.options` ↔ `KET_QUA_NOP`, đếm khai báo tập, round-trip; chiều đỏ `--ban-sao them-tap`.
- [ ] `dot-bien.mjs`: dùng `chayDotBien` của `_acceptance/man-cai-dat-noi-tieng-viet/rang/dot-bien-lib.mjs`, năm vết (a)–(e), so sha256 tệp sau mỗi vết.
- [ ] `ranh-gioi.mjs`: mẫu ranh giới K2b + P1-26; luật dòng cho `nop-ban-nhap.ts`; chiều đỏ `--them`, `--diff-mau`.

### Task 5: Đo màn (E10)

**Files:** Create `_acceptance/soan-okr-khong-lac/rang/man.mjs`.

**Phục vụ:** E10 · **independent:** false

- [ ] Nhập `man-chung.mjs` và `kich-ban.mjs` của `_acceptance/soan-okr-trang-rieng/rang/` (không sửa); ba trạng thái × 390/1440, sáu ảnh vào `evidence/`; chiều đỏ `--kiem-do-do nop`.
- [ ] Chạy qua `mot-luot.sh` (phiên đo riêng); đặt contract `status: implemented`, vào S4.
