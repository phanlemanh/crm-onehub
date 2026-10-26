# Sửa sau chạy thật — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (phiên thợ làm tuần tự). Steps dùng `- [ ]`.

**Goal:** Mười hai hạn chế người dùng thấy còn mở trong Kho tài liệu (G1–G12 của `design.md`) được sửa, rồi đo lại bộ
50 câu mẫu không lùi.

**Architecture:** Mỗi mục sửa đúng chỗ hỏng đã gọi tên trong `design.md`, không thêm màn, không `migration`. Hai luật
dùng chung mới: luật liên kết `packages/ui/src/lib/lien-ket-an-toan.ts` (trình đọc, trình soạn, bộ lọc dán) và bộ lọc
bản chờ `apps/app/lib/tai-lieu-cho.ts`. Mục lục đọc cùng cây `mdast` với trình đọc. Câu của trợ lý trên màn CRM đi qua
`taiLieuMessages`; API giữ trả mã như đã có.

**Tech Stack:** NestJS tRPC, Prisma + Postgres `_test`, Next.js App Router, `@crm/ui`, tiptap, `mdast-util-from-markdown`
(đã có trong kho qua `streamdown`, nay khai cho `packages/ui`), `bun:test` + jsdom, puppeteer-core cho bộ đo màn.

**Spec:** `design.md` · `contract.md` · `evals.yaml` (cùng thư mục).

## Global Constraints

- Không chú thích trong code. Không `migration`, không chạm `packages/auth`, module T3 của API.
- Chữ trên màn đi qua `apps/app/lib/messages/*` (vi + en); thêm khoá, không đổi khoá cũ. `messages-guard` giữ đủ hai
  ngôn ngữ.
- Client component không nhập `@crm/db`, `@crm/auth`.
- Bậc vẽ tay (`docs/design.md`): `Alert`, `VungTaiLoi`, `KaraRetry`, `CommandItem`, `DiffTrang` — không dựng tay.
- Tệp chung chỉ thêm dòng: `_acceptance/config.yaml`, `CONTEXT.md`, messages.
- Năm lệnh của kho xanh trước khi xin S4: `test`, `check-types`, `lint`, `lint:slop`, `build`.

## Review Focus

- Trang đã lưu trữ nhận nguồn qua trang mới (`dich.loai = "moi"`) không bị ảnh hưởng — chỉ đường cập nhật đổi (Task 1).
- Trang có nhiều đề xuất `NOI_DUNG` chờ hơn một trang danh sách: số bản chờ vẫn ≥ 1 khi `coBanCho` (Task 2).
- Tiêu đề chứa liên kết trang `[[…|nhãn]]` hay mã `` ` `` — mục lục dùng đúng chữ hiện ra (Task 4).
- Gõ `http://a.vn ` rồi cách trong trình soạn: tự nối liên kết cũng theo cùng luật (Task 5).
- Bảng đổi số cột nằm giữa đoạn đổi chữ — các đoạn khác vẫn gộp như cũ (Task 9).

---

### Task 1: Nhận nguồn và nộp bản cho trang đã lưu trữ (G1, G1b)

independent: true · phục vụ E1, E1b

**Files:** `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts` (`kiemDich`) · `apps/agent/agent/lib/tai-lieu-nop.ts`
(`nopBanDeXuat`) · `apps/agent/agent/lib/tai-lieu-config.ts` (`lyDo.daLuuTru`) · `apps/api/test/ssct-nguon.spec.ts` ·
`apps/agent/test/ssct-nop-luu-tru.spec.ts`

**Produces:** `kiemDich` đọc trang bằng `findFirst({ AND: [{ slug }, dieuKienThay(nguoi)] })`, không thấy → `khongCo()`
của `tai-lieu-chung` (cùng mã, cùng câu với `taiLieu.get`); `archivedAt` → `BadRequestException(TAI_LIEU_API.thongDiep.daLuuTru)`.
`nopBanDeXuat` khoá hàng trang trong giao dịch nộp; `archivedAt` → nguồn `LOI`, `lyDo = TAI_LIEU_AGENT.lyDo.daLuuTru`,
không đề xuất.

- [ ] Hai bài trước (đỏ): E1 ma trận ba dòng, E1b hai trang P (lưu trữ) / Q (đang dùng).
- [ ] Sửa; xanh; chạy lại `tai-lieu-nguon*.spec.ts` có sẵn.
- [ ] Commit.

### Task 2: Bản chờ trên màn đọc (G2, G3)

independent: true · phục vụ E2, E3, E14 bước 1

**Files:** `apps/app/lib/tai-lieu-cho.ts` (mới) · `apps/app/app/(app)/[slug]/tai-lieu/[trang]/page.tsx` · `man-doc.tsx` ·
`apps/app/lib/messages/tai-lieu.ts` (`doc.loiBanCho`) · `apps/app/test/ssct-doc-cho.dom.tsx`

**Produces:** `banChoCuaTrang(rows, slug): DongCho[]` lọc `slug`, `CHO_DUYET`, `!cu`, `loai === "NOI_DUNG"`;
`TrangDoc.loiBanCho: boolean`; khi lỗi: `Alert` một dòng + nút «Thử lại» gọi `router.refresh()`, không huy hiệu số,
không nút «Xem bản chờ».

- [ ] Bài E2 (bảng lọc + dom), E3 (cờ lỗi) trước, đỏ.
- [ ] Sửa; xanh; chạy lại `tai-lieu-trang-cho.dom.tsx`, `tai-lieu-luu-tru.dom.tsx`.
- [ ] Commit.

### Task 3: Quay lại bản chỉ khác tên (G4)

independent: true · phục vụ E4

**Files:** `apps/api/src/tai-lieu/tai-lieu-lich-su.service.ts` (`quayLai`) · `apps/api/test/ssct-quay-lai.spec.ts`

**Produces:** `quayLai` từ chối `chuaDoi` chỉ khi `ten` và `noiDung` (sau NFC) cùng trùng bản đang dùng; đề xuất mới
mang `ten` của phiên bản cũ.

- [ ] Bài E4 trước, đỏ; sửa; xanh; chạy lại `tai-lieu-lich-su.spec.ts`; commit.

### Task 4: Mục lục đọc cùng cây với trình đọc (G5)

independent: true · phục vụ E5, E14 bước 2

**Files:** `packages/ui/package.json` (`mdast-util-from-markdown`, `mdast-util-gfm`, `micromark-extension-gfm`) ·
`bun.lock` · `packages/ui/src/components/markdown-reader.tsx` (`readerHeadings`) · `packages/ui/test/ssct-muc-luc.dom.tsx`

**Produces:** `readerHeadings(md)` dựng từ `fromMarkdown(md, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] })`,
qua cùng bước tách `[[…]]` của `remarkWikiLinks`, chữ = nối `text` và `inlineCode`; `id = readerSlug(chữ)`.

- [ ] Bài E5 trước (nguồn sinh bằng `tuanTuHoa`), đỏ; thêm phụ thuộc, `bun install`; sửa; xanh; commit.

### Task 5: Một luật liên kết cho đọc, soạn, dán (G6)

independent: true · phục vụ E6, E14 bước 4

**Files:** `packages/ui/src/lib/lien-ket-an-toan.ts` (mới) · `markdown-reader.tsx` (`SAFE_LINK` → luật chung) ·
`trinh-soan-thanh-cong-cu.tsx` (`chuanHref`, `ganLienKet`, dòng báo trong ô liên kết) · `trinh-soan.tsx` (Link
`isAllowedUri`, dòng báo sau khi dán) · `packages/ui/src/lib/dan-tu-van-phong.ts` (`locDanDem` đếm liên kết bỏ) ·
`apps/app/app/(app)/[slug]/tai-lieu/man-soan.tsx` + messages (`soan.chiHttps`, `soan.daBoHttp`) · `packages/ui/test/ssct-lien-ket.dom.tsx`

**Produces:** `lienKetAnToan(href: string): boolean` (`#`, đường trong kho, `https://`, `mailto:`); `locDanDem(html) →
{ html, boHttp }`, `locDan = (h) => locDanDem(h).html`; `TrinhSoanProps.nhanLienKet?: { chiHttps: string; daBoHttp:
(so: number) => string }`.

- [ ] Bài E6 trước, đỏ; sửa; xanh; chạy lại các bài `trinh-soan*`, `dan-tu-van-phong*`, `markdown-reader*`; commit.

### Task 6: Lỗi tải danh sách chọn (G7)

independent: true · phục vụ E7

**Files:** `apps/app/app/(app)/[slug]/tai-lieu/lua-chon-trang.ts` · `truong-trang-moi.tsx` · `hop-tai-nguon.tsx` ·
messages (`chon.loi`, `chon.thuLai`) · `apps/app/test/ssct-chon-loi.dom.tsx`

**Produces:** hàm của `lua-chon-trang.ts` trả kèm `loi: boolean` và `thuLai()`; hai nơi hiện một dòng `Alert` +
«Thử lại» khi `loi`.

- [ ] Bài E7 trước, đỏ; sửa; xanh; commit.

### Task 7: Hộp tìm nhanh báo nhóm CRM lỗi (G8)

independent: true · phục vụ E8

**Files:** `apps/app/components/crm/quick-switcher.tsx` · `apps/app/lib/messages/khung-ung-dung.ts` (`switcher.crmLoi`) ·
`apps/app/test/ssct-tim-nhanh-loi.dom.tsx`

**Produces:** `coDoiTac && duChu && results.isError` → một `CommandGroup` với `CommandItem disabled data-crm-loi`.

- [ ] Bài E8 trước, đỏ; sửa; xanh; commit.

### Task 8: Câu trợ lý theo ngôn ngữ giao diện (G9)

independent: true · phục vụ E9, E9b

**Files:** `apps/app/app/(app)/[slug]/tai-lieu/hoi-tra-loi.tsx` · `apps/app/lib/messages/tai-lieu.ts`
(`hoi.tuChoi`, `hoi.loi.{het-tran,loi-model,qua-han}`, `hoi.quaHanXacMinh`) · `apps/api/test/ssct-hoi-ma.spec.ts` ·
`apps/app/test/ssct-hoi-en.dom.tsx`

**Produces:** màn Hỏi đọc chữ từ `taiLieuMessages(locale).hoi`; bản `vi` trùng từng chữ với `TAI_LIEU_HOI` (Zalo vẫn
dùng `TAI_LIEU_HOI`). API không đổi — E9b ghim việc nó trả mã.

- [ ] Bài E9b (Postgres thật, ghi qua `ghiKetQuaHoi`) và E9 trước; sửa; xanh; commit.

### Task 9: Bảng đổi số cột trên màn duyệt (G10)

independent: true · phục vụ E10, E14 bước 3

**Files:** `packages/validation/src/tai-lieu-diff.ts` (`khacCot`) · `packages/ui/src/components/diff-trang.tsx`
(`gomNhom`) · `packages/ui/test/ssct-bang-doi-cot.dom.tsx`

**Produces:** khối bảng đổi số cột ra hai khối `bo` (bảng cũ đủ tiêu đề) và `them` (bảng mới đủ tiêu đề), `DiffTrang`
vẽ hai `table` riêng.

- [ ] Bài E10 trước, đỏ; sửa; xanh; chạy lại các bài `tai-lieu-diff*`, `diff-trang*`; commit.

### Task 10: Nhãn so sánh của bản máy đã cũ (G11)

independent: true · phục vụ E11

**Files:** `apps/app/app/(app)/[slug]/tai-lieu/de-xuat/[id]/man-duyet.tsx` · messages (`duyet.soVoiBanGocMay`) ·
`apps/app/test/ssct-duyet-may-cu.dom.tsx`

- [ ] Bài E11 trước, đỏ; sửa; xanh; commit.

### Task 11: Loại tệp một nguồn (G12)

independent: true · phục vụ E12, E14 bước 5

**Files:** `packages/validation/src/tai-lieu-nguon.ts` (`KIEU_NGUON` thêm đuôi, nhãn) · `apps/app/lib/tai-lieu-man.ts`
(`chapNhan` sinh từ `KIEU_NGUON`) · `hop-tai-nguon.tsx` (câu sai loại) · `apps/app/test/ssct-loai-tep.dom.tsx`

- [ ] Bài E12 trước, đỏ; sửa; xanh; commit.

### Task 12: Bộ đo màn và so bộ mẫu (E13, E14)

independent: false (sau Task 1–11) · phục vụ E13, E14

**Files:** `_acceptance/sua-sau-chay-that/rang/man.mjs` · `rang/so-bo-mau.ts` · `evidence/do-bo-mau.md` ·
`evidence/cham-tung-cau.jsonl`

- [ ] `man.mjs` năm bước + `--chieu-do` (bản sao bỏ điều kiện `loai` ở bộ lọc bản chờ); chạy qua `mot-luot.sh`.
- [ ] `so-bo-mau.ts` + chiều đỏ trong thư mục tạm.
- [ ] Năm lệnh của kho xanh.
- [ ] Cuối cùng: `BCM_EVIDENCE=_acceptance/sua-sau-chay-that/evidence bun _acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts --do`;
  lỗi `gieoNguoi` (khoá trùng) → chạy lại một lần; còn đỏ → ghi «lỗi sẵn gieoNguoi», báo giám sát, không vá tại chỗ.
- [ ] Commit; contract `status: implemented`.
