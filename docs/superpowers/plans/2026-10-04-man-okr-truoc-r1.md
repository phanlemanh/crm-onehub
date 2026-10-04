# Màn OKR trước R1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hồi ý không bị thanh công bố che, Cập nhật tuần nói «đã xong tuần này», thẻ Toàn cảnh không nói ngược bảng.

**Architecture:** Ba sửa trong ba màn client đang có, không đổi API. Hồi ý bỏ `defaultOpen` ở chỗ gọi `SaveBar`. Cập nhật tuần thêm nhánh `DaXongTuanNay` và trạng thái một phần, đọc `updatedThisWeek`/`lastAt`/`lastConfidence` đã có. Toàn cảnh đổi chữ thẻ (tên đơn vị trong phần tử `translate="no"`) và câu mô tả bảng.

**Tech Stack:** Next.js App Router (client components), `@crm/ui`, bun test + jsdom (`packages/ui/test/setup-dom.ts`), puppeteer-core cho phép đo màn qua `mot-luot.sh`.

**Spec:** `docs/superpowers/specs/2026-10-04-man-okr-truoc-r1-design.md` · hợp đồng `_acceptance/man-okr-truoc-r1/contract.md` · phép đo `_acceptance/man-okr-truoc-r1/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Chữ hiện cho người nằm trong `apps/app/lib/messages/*.ts`, có bản vi (có dấu) và en khác nhau; hàm ghép mới có dòng `GHIM` trong `apps/app/test/messages-guard.spec.ts`.
- Khoá chữ mới THÊM ở cuối nhóm liên quan; chỉ đổi chữ cũ ở khoá thuộc ba màn (LUAT điều phối).
- Chỉ dùng thành phần `@crm/ui`, không đè màu/góc/khoảng cách bằng `className`.
- Tên KR, tên mục tiêu, tên đơn vị là dữ liệu người nhập: `translate="no"`.
- Không chạm `packages/ui/src/components/save-bar.tsx`, `theo-don-vi/**`, API.
- Bun 1.3.12; test DOM chạy với `TZ=Asia/Ho_Chi_Minh`.

## Review Focus

1. KR đầu danh sách là KR khoá nguồn (ô giá trị tắt) → `autoFocus` không bám được; focus không được ném lỗi, ô tự tin vẫn bấm được. Test: không ném, `activeElement` không phải nút đã biến mất (chỉ khẳng định ở fixture KR tay — ca khoá nguồn để ý ở review).
2. `lastAt` ở các KR khác định dạng (cùng `toISOString`) → so chuỗi đúng; ghim bằng hai thứ tự trong E3.
3. Gửi xong trong phiên (`DaGui`) rồi bấm «Về Của tôi» → không ảnh hưởng; tải lại mới ra `ST-capnhat-daxong`.
4. Thanh Hồi ý ở 390 thu gọn: tiêu đề dài xuống dòng, nút không bị cắt — đo ở E2 (chiều cao ≤ 120).
5. Toàn cảnh có hơn ba đơn vị chưa đặt → câu vẫn rút gọn bằng «…» như cũ, mỗi tên vẫn `translate="no"`.

---

### Task 1: Hồi ý — thanh công bố thu gọn mặc định (E1)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/hoi-y/khoi-ket-luan.tsx` (`ThanhCongBo`, bỏ `defaultOpen`)
- Modify test: `apps/app/test/okr-hoi-y.dom.tsx` (test «thanh công bố liệt đúng…» và «khi không còn thiếu gì…»)

**Interfaces:** Consumes `SaveBar` (`open`, `layout="checklist"`, `items`), `msg.saveBar.hienDanhSach/anDanhSach` từ `@crm/ui` messages.

- [ ] Step 1: Sửa test «thanh công bố liệt đúng…» thành «thanh công bố thu gọn mặc định…»: trước khi bấm `dsHien: false`, nút `[aria-controls]` có `aria-expanded="false"` và chữ `Hiện danh sách`; bấm nút → `dsHien: true`, `aria-expanded="true"`, chữ `Ẩn danh sách`, các liên kết như cũ. Đổi tên test chon-du thành «thanh công bố: khi không còn thiếu gì thì không có danh sách rỗng».
- [ ] Step 2: Chạy `config:executors.test.r1c_hoi_y_dom` → ĐỎ (`dsHien` true trước khi bấm).
- [ ] Step 3: Xoá dòng `defaultOpen` trong `<SaveBar … data-khoi="thanh-cong-bo">`.
- [ ] Step 4: Chạy lại → XANH. Phá-thử: thêm lại `defaultOpen` → đỏ với tên test «thanh công bố thu gọn mặc định»; hoàn lại.
- [ ] Step 5: Commit.

### Task 2: Cập nhật tuần — «đã xong tuần này» và «một phần» (E3, E4, E9)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx`
- Modify: `apps/app/lib/messages/okr.ts` (nhóm `capNhat`, vi và en: thêm `daXong`, `daGuiMotPhan`, `nhanDaGui`)
- Modify test: `apps/app/test/okr-cap-nhat-tuan.dom.tsx` (ba describe mới), `apps/app/test/messages-guard.spec.ts` (GHIM)

**Interfaces:**
- Produces `okrMessages(l).capNhat.daXong = { title: string; luc: (ngay: string, gio: string) => string; sua: string; danhSach: string }`, `daGuiMotPhan: (x: number, y: number) => string`, `nhanDaGui: string`.
- `BangCapNhat` thêm state `dangSua: boolean`; nhánh `DaXongTuanNay({ duLieu, sua })` khi `!daGui && !dangSua && tong > 0 && soDaGuiTuanNay === tong`.
- `data-trang-thai`: `ST-capnhat-daxong` (màn đã xong), `ST-capnhat-motphan` (form khi `0 < x < tong`, không lỗi/không đang gửi).
- `DongCapNhat` nhận `daGuiTuanNay: boolean` → `Badge variant="outline" data-da-gui-tuan-nay` chữ `nhanDaGui` khi `kr.updatedThisWeek`; nhận `tuDongFocus: boolean` → `autoFocus` cho ô giá trị (số) hoặc mục mốc đang chọn.
- Thời điểm: `lastAt` lớn nhất (so chuỗi ISO), định dạng `dd/mm` và `HH:mm` theo `Asia/Ho_Chi_Minh`.

- [ ] Step 1: Viết test trước (`describe("man cap nhat tuan: da xong")`, `("… mot phan")`, `("… chua gui")`):
  - da xong, hai ô thứ tự (KR mới hơn đầu / cuối): `ST-capnhat-daxong`; `[role=status]` chứa `m.capNhat.daXong.title`; dòng thời điểm = `m.capNhat.daXong.luc(<dd/mm>, <HH:mm>)` của KR mới hơn; mỗi KR một `[data-kr]` có `giaTri(kr, currentValue)` và nhãn tự tin; không có `[data-nut="gui"]`. Bấm `[data-nut="sua-cap-nhat"]` → `ST-capnhat-dangdien`, không mục tự tin nào `aria-checked/data-state="on"`, nút gửi chữ `m.capNhat.gui(0)` và `disabled`, `document.activeElement` là ô giá trị KR đầu; chọn «Vừa» cho KR đầu, bấm gửi → mock `guiCapNhat` nhận đúng một dòng.
  - một phần: ma trận x ∈ {0,1,2} trên y = 3 và y = 0; x=1,2 → `ST-capnhat-motphan`, chữ `m.capNhat.daGuiMotPhan(x,3)`, tập `[data-da-gui-tuan-nay]` = tập KR `updatedThisWeek` (KR thứ ba mang `lastAt` tuần trước, `updatedThisWeek: false`), không mục tự tin chọn sẵn; x=0 → `ST-capnhat-dangdien`, không dòng, không dấu; y=0 → `ST-capnhat-rong`. In số khẳng định = 12.
- [ ] Step 2: Chạy `config:executors.test.r1c_cap_nhat_dom` → ĐỎ.
- [ ] Step 3: Thêm khoá chữ (vi/en) và dòng GHIM; cài nhánh `DaXongTuanNay`, trạng thái một phần, dấu KR, `autoFocus`; giữ mọi trạng thái cũ.
- [ ] Step 4: Chạy lại + `messages-guard.spec.ts` → XANH. Phá-thử trên bản đã commit, mỗi lần một chỗ rồi `git checkout -- <tệp>`: (a) bỏ nhánh đã xong → «da xong» đỏ; (b) lấy `lastAt` phần tử cuối → ô (i) đỏ; (c) bỏ `autoFocus` → khẳng định focus đỏ; (d) gắn dấu theo `lastAt !== null` → «mot phan» đỏ; (e) bỏ chặn `tong > 0` → không đỏ được vì `CapNhatTuan` đã trả `Rong` khi danh sách rỗng — ghi rõ ô y=0 là đối chứng dương của lớp ngoài.
- [ ] Step 5: Commit.

### Task 3: Toàn cảnh — chữ thẻ và mô tả bảng (E7, E9)

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx` (mô tả `StatCard` «Đơn vị đã công bố OKR» dựng bằng `ghep`/ReactNode với tên trong `<span translate="no">`)
- Modify: `apps/app/lib/messages/okr-toan-canh.ts` (`chuaDat`, `theoDonViMoTa` vi/en)
- Create test: `apps/app/test/okr-toan-canh-chu.dom.tsx`; Modify `apps/app/test/messages-guard.spec.ts` nếu `chuaDat` cần dòng GHIM mới

**Interfaces:** `okrToanCanhMessages(l).toanCanh.chuaDat: string` đổi thành khuôn có `{ten}` dùng với `ghep` (`@/lib/messages/...`), hoặc giữ hàm `(ten: string) => string` và tách tên bằng hai phần `truoc`/`sau`. Chọn: khuôn chuỗi `"{ten} chưa có mục tiêu riêng"` + `ghep(…, { ten: <span translate="no">…</span> })` như `ThanhCongBo` đang làm.

- [ ] Step 1: Test mới render `ToanCanh` (harness giống `okr-sua-an-chu-ky.dom.tsx`: `NuqsTestingAdapter`, mock `@/lib/trpc/client` cho `cycles`, `access`, `toanCanh`), dữ liệu qua `toanCanhOutput.parse`. Ma trận vi × en × {có «Khối Hỗ trợ» chưa đặt, mọi đơn vị đã đặt}: mô tả thẻ = chữ dựng từ messages, tên nằm trong `[translate="no"]`; `CardDescription` của bảng = `theoDonViMoTa`. 4 ô, in số khẳng định.
- [ ] Step 2: Chạy `config:executors.test.r1c_toan_canh_dom` → ĐỎ.
- [ ] Step 3: Đổi chữ + dựng ReactNode.
- [ ] Step 4: XANH; phá-thử: trả `chuaDat` về chữ cũ → đỏ; hoàn lại.
- [ ] Step 5: Commit.

### Task 4: Phép đo màn thật `man-r1c.mjs` (E2, E5u, E8u)

**Files:**
- Create: `_acceptance/man-okr-truoc-r1/rang/man-r1c.mjs` (khuôn theo `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs` và `r1-man-that.mjs` của khảo sát: `canhCay`, `laKhoDo`, `napBoMau`, `phienCookie`, `thuMau`, `idMau`, `trpc`; đường suy từ vị trí tệp)

**Interfaces:** chạy qua `config:executors.script.r1c_man`; cờ `--chieu-do=hoi-y|cap-nhat|toan-canh` dựng bản sao cây ở `.acceptance-runs/` với một chỗ hỏng (như `man-lib.mjs#chieuDo`).

- [ ] Step 1: Viết script ba bước theo `steps` của E2, E5u, E8u; xoá ảnh `r1c-*` cũ lúc bắt đầu, kiểm đủ 10 ảnh cuối lượt; in `<bước> <khổ>: dat` hoặc dòng đỏ ghim.
- [ ] Step 2: Chạy `config:executors.script.r1c_man` → XANH, đọc ảnh.
- [ ] Step 3: Ba chiều đỏ → mã 1 với thông điệp ghim.
- [ ] Step 4: Commit.

### Task 5: Thu AC-9 về bộ gác chữ thật

**Files:** `_acceptance/man-okr-truoc-r1/contract.md` (AC-9), `evals.yaml` (E9), `_acceptance/config.yaml` (`r1c_chu` bỏ `okr-so-chu.spec.ts`), dòng sổ `fix`.

- [ ] Step 1: AC-9 bỏ vế `okr-so-chu` (bộ đó chỉ canh chữ «số OKR», không quét trạng thái màn); E9 expected chỉ `messages-guard`.
- [ ] Step 2: Ghi dòng sổ `fix` stage S3.
- [ ] Step 3: Commit.
