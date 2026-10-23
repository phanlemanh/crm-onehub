# Một nút tạo mục tiêu — kế hoạch thi công (VK9)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đầu trang khu Mục tiêu chỉ còn một nút chính «Thêm mục tiêu» ở Của tôi và Bộ OKR; nút mở một hộp chọn bốn đường tạo.

**Architecture:** `HanhDongKhu` (đầu trang của bốn màn) bỏ menu «…» và `NutSoan`, chỉ dựng nút «Thêm mục tiêu» ở hai tab tạo; nút ghi một tham số `nuqs` mở `HopChonDuong` (Dialog + ItemGroup). Mỗi dòng của hộp đặt tham số của hộp đích sẵn có (`new`, `tuMauOkr`, `nhapOkr`) hoặc gọi `okr.soanMo`. Trạng thái khoá của đường Soạn rút khỏi `NutSoan` thành một hàm thuần `duongSoan()` để hộp và bài kiểm dùng chung.

**Tech Stack:** Next.js App Router (`apps/app`), React 19, `nuqs`, TanStack Query + tRPC, `@crm/ui` (shadcn), `bun test` + happy-dom (`packages/ui/test/setup-dom.ts`).

**Spec:** `docs/superpowers/specs/2026-10-21-mot-nut-tao-muc-tieu-design.md` · hợp đồng `_acceptance/mot-nut-tao-muc-tieu/contract.md` (đã duyệt 21/10) · `_acceptance/mot-nut-tao-muc-tieu/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Mọi chữ qua `apps/app/lib/messages/*`, có cả `vi` và `en`; tệp `okr*.ts` chỉ thêm dòng — sửa hay xoá dòng có sẵn gửi `cham-tep` (luật 7 của đợt).
- Chỉ nhập `@crm/ui/components/<tên>` theo subpath trong tệp `"use client"`; không `className` đổi màu, góc, khoảng cách của thành phần `@crm/ui` — thiếu kiểu thì thêm biến thể ở `packages/ui`.
- Không đổi thủ tục API nào: `okr.createObjective`, `okr.taoTuMau`, `okr.previewImport`, `okr.applyImport`, `okr.soanMo`, `okr.soanSanSang`.
- Tham số đường dẫn qua `nuqs`; khoá khai một lần ở `apps/app/lib/search-param-keys.ts`.
- Tên đơn vị là dữ liệu người nhập: phần tử chứa nó mang `translate="no"`.
- Dòng khoá của hộp: `aria-disabled="true"` (không `disabled`), câu mô tả thay bằng câu lý do (Hỏi-3 đã duyệt: hiện khoá, không ẩn).
- Bài DOM: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/mot-nut-tao-muc-tieu.dom.tsx -t <ca>`; tRPC giả parse bằng schema output/input thật của `okr.contracts`, như `apps/app/test/okr-dau-trang-khu.dom.tsx`.
- Phép đo mới nào cũng có cặp hai chiều trên cùng fixture, chiều đỏ ghim thông điệp (MEASURE-BIRTH-CLAUSE); chuỗi thông điệp chiều đỏ lấy đúng như `expected` của `evals.yaml`.
- **S3 chỉ bắt đầu sau khi #525 (VK7) gộp và nhánh đã gộp `origin/onehub`** — giám sát báo. Gộp xong có đổi `package.json`/`bun.lock` thì `bun install` trước khi chạy bài (luật 4).

## Review Focus

- Đơn vị đích là một người (`DonChonOkr.loai === "nguoi"`, OKR cá nhân): `donViSoanCua` trả `null` → dòng Soạn khoá kèm câu «Soạn cùng Kara chỉ mở cho bộ phận, phòng ban và OneHub», không biến mất, không ném lỗi. Ca thêm vào Task 3.
- Chọn một đường ở Của tôi: tham số hộp chọn phải rời đường dẫn trước khi sang Bộ OKR, không thì Bộ OKR mở cả hộp chọn lẫn ngăn. Khẳng định thêm ở Task 5 (b) của `mnt-tu-viet`.
- Bấm dòng Soạn hai lần khi `okr.soanMo` đang chạy: dòng khoá trong lúc chờ, chỉ một lần gọi. Ca thêm vào Task 3.
- Nút «Quay lại» của trình duyệt khi hộp đang mở: hộp đóng (tham số ghi với `history: "push"`). Ca thêm vào Task 4 (`mnt-hop` (d')).
- Người hết cuộc soạn vẫn xem lại được các cuộc đã dùng: hôm nay lối vào là nút «i» trên đầu trang, vòng này gỡ nút đó → hộp có lối «Các cuộc đã soạn (N/3)» dưới bốn dòng khi `soCuocDaDung > 0`, mở `DanhSachCuoc` như cũ. Ca thêm vào Task 4.

---

### Task 1: Dòng khoá cho `Item` (packages/ui)

**Files:**
- Modify: `packages/ui/src/components/item.tsx` (khối `itemVariants`, quanh dòng 40–75)
- Test: `packages/ui/test/item-khoa.dom.tsx` (tạo)

**Interfaces:**
- Produces: `Item` giữ API cũ; khi phần tử (thường `asChild` bọc `<button>`) mang `aria-disabled="true"` thì dòng mờ (`aria-disabled:opacity-50`), không đổi nền khi hover (`aria-disabled:hover:bg-transparent` hay tương đương theo biến thể), con trỏ `not-allowed`. Không thêm prop mới.

- [ ] **Step 1: Viết bài đỏ** `item-khoa: dong aria-disabled mo va khong to nen khi re chuot` — dựng `<Item asChild variant="outline"><button aria-disabled="true">x</button></Item>`, khẳng định `className` của nút chứa các lớp `aria-disabled:` đã chọn; đối chứng dương: cùng `Item` không `aria-disabled` vẫn có lớp hover nền của biến thể `outline`.
- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/item-khoa.dom.tsx` → FAIL ở khẳng định lớp `aria-disabled:`.
- [ ] **Step 3: Thêm các lớp `aria-disabled:` vào phần gốc của `itemVariants`.**
- [ ] **Step 4: Chạy lại, xanh.** Phá thử: xoá một lớp → đỏ với tên lớp thiếu; hoàn lại.
- [ ] **Step 5: Commit** — `feat(ui): Item có trạng thái dòng khoá theo aria-disabled`.

### Task 2: Chữ và khoá đường dẫn

**Files:**
- Modify: `apps/app/lib/search-param-keys.ts` (khối `okr`, thêm hai khoá)
- Modify: `apps/app/lib/messages/okr.ts` (thêm khối `chonDuong` ở `vi` và `en`, chỉ thêm dòng)
- Test: phần (e) của `mnt-hop` ở Task 4 đo đủ khoá hai bản

**Interfaces:**
- Produces: `SEARCH_PARAM.okr.chonDuong = "themMucTieu"` (boolean, mở hộp chọn) · `SEARCH_PARAM.okr.tuMau = "tuMauOkr"` (boolean, ngăn tạo mở ở bước chọn mẫu).
- Produces: `okrMessages(locale).chonDuong` có đúng các khoá:
  `moTa: string` (chứa `{ten}`) · `duong.tuViet|tuMau|bangTinh|soan: { ten: string; moTa: string }` · `tiep: string` · `khoa.chuaCoMau: string` · `khoa.ngoaiPha: string` · `khoa.caNhan: string` · `cuocDaSoan: (da: string, tran: string) => string`.
- Chữ vi chốt: `duong.tuViet.ten` «Tự viết» · `duong.tuMau.ten` «Từ mẫu» · `duong.bangTinh.ten` «Từ bảng tính» · `duong.soan.ten` «Soạn cùng Kara» · `tiep` dùng lại nghĩa «Tiếp cuộc đang soạn». Câu mô tả và câu lý do viết theo E5 (`evals.yaml`): nói việc người làm, có lối đi tiếp, gọi AI là «Kara». Tiêu đề hộp dùng lại `okrMessages().themMucTieu`.

- [ ] **Step 1: Thêm hai khoá vào `SEARCH_PARAM.okr`.**
- [ ] **Step 2: Thêm khối `chonDuong` vào cả hai bản của `okr.ts`.**
- [ ] **Step 3: `bun run check-types`** → 0 lỗi (kiểu của hai bản messages phải khớp nhau).
- [ ] **Step 4: Commit** — `feat(okr): chữ và khoá đường dẫn của hộp chọn đường`.

### Task 3: Trạng thái đường Soạn thành hàm thuần

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/soan/duong-soan.ts`
- Modify: `apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx` — chỉ thêm `tenDon: string` vào nhánh `xong` của `QuyenKhu` (chính giá trị `ten` mà `useQuyenKhu` đã tính hôm nay)
- Modify: `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx` — giữ `donViSoanCua`, `HINH_NUT_TAT`; xoá component `NutSoan`, `NhomSoan`, `NutKhoa` khi Task 5 đã gỡ chỗ gọi (cùng PR)
- Test: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx` ca `mnt-soan`

**Interfaces:**
- Produces:
  ```ts
  export type DuongSoan =
    | { loai: "dang-tai" }
    | { loai: "khoa"; lyDo: string }
    | { loai: "mo"; donVi: DonViSoan; cheDoAn: boolean }
    | { loai: "tiep"; cuocId: string };
  export function duongSoan(v: {
    don: DonChonOkr; cycleId: string; phaKy: PhaChuKy | null;
    quanTri: boolean; canEdit: boolean; cauNoi: boolean;
    sanSang: SoanSanSang | undefined; m: OkrSoanMessages; mc: OkrMessages["chonDuong"]; homNay: string;
  }): DuongSoan;
  export function useDuongSoan(v: { q: Extract<QuyenKhu, { kieu: "xong" }>; cauNoi: boolean }): {
    duong: DuongSoan; chon: () => void; dangMo: boolean; soCuocDaDung: number; tranCuoc: number;
  };
  ```
  `SoanSanSang` = kiểu output của `okr.soanSanSang` lấy từ `okr.contracts` (không tự viết kiểu).
- Ánh xạ khoá (một bảng, cùng thứ tự kiểm như `NutSoan` hôm nay): `donViSoanCua` null → `mc.khoa.caNhan` · `phaKy !== "lap-ke-hoach"` → `mc.khoa.ngoaiPha` · `!canEdit && !quanTri` → `okrMessages().khoaTao.khongSua` đã thay `{ten}` · `!cauNoi` → `m.nut.chuaCauHinh` · `sanSang` vắng → `dang-tai` · `!s.bat`: `het-cuoc-ky` → `m.nut.hetCuoc(TRAN)`, `het-tran-thang` → `m.nut.tamNghi(dauThangSau(homNay))`, mọi `lyDo` còn lại → `m.lyDo[lyDo]` · `s.nac === "an" && !quanTri` → `m.lyDo["don-vi-che-do-an"]` · `s.cuocDang` → `tiep` · còn lại → `mo`.
- `useDuongSoan.chon()`: `mo` → `okr.soanMo.mutate(donVi)` rồi mở khung bản ghi `{ kind: "soan", id }` như `NutSoan` (cả nhánh `kq.cuocDang`); `tiep` → mở khung bản ghi với `cuocId`, không gọi mutation; `dangMo` = `isPending`.

- [ ] **Step 1: Viết bài đỏ `mnt-soan`** — ma trận 8 ô viết trước của E13 (`evals.yaml`), cộng hai ô của Review Focus: (9) đơn vị là người → `khoa` với `mc.khoa.caNhan`; (10) bấm `chon()` hai lần khi đang chờ → đúng 1 lần gọi `okr.soanMo`. Khẳng định chữ rút từ messages, không viết tay.
- [ ] **Step 2: Chạy, đỏ** (`duong-soan.ts` chưa có).
- [ ] **Step 3: Viết `duongSoan` và `useDuongSoan`.**
- [ ] **Step 4: Chạy, xanh; phá thử hai chiều đỏ của E13** (ẩn dòng ngoài pha; gọi `soanMo` khi đang có cuộc) → đỏ đúng thông điệp ghim; hoàn lại.
- [ ] **Step 5: Commit** — `refactor(okr): trạng thái đường Soạn thành hàm thuần duongSoan`.

### Task 4: Hộp chọn đường

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/hop-chon-duong.tsx`
- Test: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx` ca `mnt-hop`

**Interfaces:**
- Consumes: Task 1 (`Item` khoá), Task 2 (khoá, chữ), Task 3 (`useDuongSoan`, `QuyenKhu.tenDon`).
- Produces: `export function HopChonDuong({ q, tab, cauNoi }: { q: Extract<QuyenKhu, { kieu: "xong" }>; tab: TabOkr; cauNoi: boolean }): JSX.Element | null` — tự đọc `SEARCH_PARAM.okr.chonDuong`; `q.duoc === false` mà tham số bật → `BoKhoaUrl` gỡ tham số; mỗi dòng `<Item asChild variant="outline"><button data-duong="tu-viet|tu-mau|bang-tinh|soan" …>`.
- Đích của từng dòng (đóng hộp trước — tham số `chonDuong` về `null` trong cùng lần ghi):
  - `tab === "theo-don-vi"`: tự viết → đặt `new=true`; từ mẫu → `new=true` + `tuMauOkr=true`; bảng tính → `nhapOkr=true`.
  - tab khác: `router.push` tới đường của `useDuongTheoDonVi(q.cycleId)(q.dich.don, khoa)` (Task 5 mở rộng hàm nhận nhiều khoá).
  - soạn: `useDuongSoan().chon()` tại chỗ.
- Dòng Từ mẫu khoá khi `okr.mau` của cấp đơn vị đích trả rỗng — dùng lại `locMau` của `tu-mau.tsx` để dựng bộ lọc, không viết luật cấp lần hai.
- Lối «Các cuộc đã soạn (N/3)»: `Button variant="ghost" size="sm" data-nut="ds-cuoc"` dưới `ItemGroup`, chỉ khi `soCuocDaDung > 0`, đặt `SEARCH_PARAM.okr.dsCuoc` như `NutSoan` hôm nay; `DanhSachCuoc` dựng trong `HanhDongKhu`.

- [ ] **Step 1: Viết bài đỏ `mnt-hop`** — (a)–(e) của E4 nguyên văn, cộng (d') «quay lại» của trình duyệt (router giả `back()`) đóng hộp, và (f) `soCuocDaDung = 2` → có `[data-nut=ds-cuoc]`, bấm → tham số `dsCuoc` bật; `soCuocDaDung = 0` → không có nút.
- [ ] **Step 2: Chạy, đỏ.**
- [ ] **Step 3: Viết `HopChonDuong`** (Dialog mặc định, `DialogHeader` > `DialogTitle` = `m.themMucTieu`, `DialogDescription` = `mc.moTa` với tên đơn vị bọc `<span translate="no">`; `ItemMedia` icon Carbon: `Edit`, `Template`, `DocumentImport`, dòng soạn dùng `KaraMark`).
- [ ] **Step 4: Chạy, xanh; phá thử ba chiều đỏ của E4** → đỏ đúng thông điệp; hoàn lại.
- [ ] **Step 5: Commit** — `feat(okr): hộp chọn bốn đường tạo mục tiêu`.

### Task 5: Đầu trang một nút

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx` (toàn tệp: `QuyenKhu`, `useQuyenKhu`, `useDuongTheoDonVi`, `NutThem`, xoá `MenuThem`, `HanhDongKhu`)
- Test: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx` ca `mnt-dau-trang`, `mnt-man-doc`, `mnt-khoa`

**Interfaces:**
- Consumes: `QuyenKhu.tenDon` (Task 3), `HopChonDuong` (Task 4).
- Produces: `export const TAB_TAO = ["cua-toi", "theo-don-vi"] as const satisfies readonly TabOkr[]`.
- Produces: `useDuongTheoDonVi(cycleId)` trả `(don: DonChonOkr, khoa: readonly string[]) => string` — đặt mọi khoá trong mảng là `"true"`.
- `HanhDongKhu`: tab ngoài `TAB_TAO` → chỉ `NutHoiKara`, ở mọi trạng thái `q` (không khung chờ). Tab trong `TAB_TAO`: `q.kieu === "cho"` → `NutHoiKara` + `Skeleton data-hang-cho`; `xong` → `NutHoiKara` + `NutThem` + `HopChonDuong` + `DanhSachCuoc` theo `dsCuoc`. `NutThem` luôn là `<Button aria-haspopup="dialog" data-nut="them-muc-tieu" size="sm">` đặt `chonDuong=true` với `history: "push"`; khoá giữ nguyên (`disabled`, `aria-describedby={ID_KHONG_THEM}`).

- [ ] **Step 1: Viết bài đỏ** `mnt-dau-trang` (E1: 16 ô + 2 ô đang tải), `mnt-man-doc` (E2: 12 ô + 4 ô đang tải + đối chứng dương), `mnt-khoa` (E15: 4 ô vai + 4 ô đường dẫn mở thẳng + đối chứng dương).
- [ ] **Step 2: Chạy, đỏ** (hàng nút còn `them-cach`, `data-nhom-soan`; Sức khoẻ còn nút chính).
- [ ] **Step 3: Sửa `hanh-dong-khu.tsx` theo Interfaces.**
- [ ] **Step 4: Chạy ba ca, xanh; phá thử các chiều đỏ của E1, E2, E15** → đỏ đúng thông điệp; hoàn lại.
- [ ] **Step 5: Commit** — `feat(okr): đầu trang khu chỉ một nút Thêm mục tiêu ở Của tôi và Bộ OKR`.

### Task 6: Ba đường mở đúng hộp, một chỗ chọn

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/ngan-okr-url.tsx` (`NganTaoMucTieu` đọc thêm `SEARCH_PARAM.okr.tuMau`, gỡ cả hai tham số khi không có quyền; xoá `NutThemMucTieu` không còn chỗ dùng)
- Modify: `apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx` (prop mới; bỏ `<NutBatDauTuMau>` khỏi form)
- Modify: `apps/app/app/(app)/[slug]/okr/tu-mau.tsx` (`useTuMau` nhận chế độ đầu; `KhungTuMau` chỉ hiện nút quay lại khi đã chọn mẫu: `chon-mau-khac`; xoá `NutBatDauTuMau`)
- Test: `apps/app/test/mot-nut-tao-muc-tieu.dom.tsx` ca `mnt-tu-viet`, `mnt-tu-mau`, `mnt-bang-tinh`

**Interfaces:**
- Produces: `YeuCauMucTieu` nhánh `tao` thêm `batDau: "tay" | "mau"`; `useTuMau({ …, batDau })` khởi `cheDo` = `{ loai: "chon" }` khi `batDau === "mau"`.
- `NganTaoMucTieu`: `new=true` + `tuMauOkr=true` → `batDau: "mau"`; chỉ `new=true` → `"tay"`; `suaDuoc === false` → `BoKhoaUrl` gỡ cả `new` lẫn `tuMauOkr`.

- [ ] **Step 1: Viết bài đỏ** `mnt-tu-viet` (E6 (a)(b) + khẳng định Review Focus: sau khi chọn ở Của tôi, đường dẫn đích không chứa `themMucTieu`), `mnt-tu-mau` (E9 (a)(b)(c), có `cycleId`), `mnt-bang-tinh` (E11 (a)(b)).
- [ ] **Step 2: Chạy, đỏ.**
- [ ] **Step 3: Sửa ba tệp theo Interfaces.**
- [ ] **Step 4: Chạy, xanh; phá thử các chiều đỏ của E6, E9, E11**; hoàn lại.
- [ ] **Step 5: Commit** — `feat(okr): ba đường tạo mở thẳng hộp của nó, bỏ nút chéo trong ngăn`.

### Task 7: Bài kiểm của kho và 11 hồ sơ đã ký

**Files:**
- Modify (theo kết quả chạy, không đoán trước): `apps/app/test/okr-dau-trang-khu.dom.tsx`, `apps/app/test/khung-okr-truoc-r1.dom.tsx`, `apps/app/test/okr-to-chuc-va.dom.tsx`, `apps/app/test/okr-cua-toi-ba-phan.dom.tsx`, `apps/app/test/khung-tao-okr.dom.tsx`, `apps/app/test/okr-canh-kr.dom.tsx`, `apps/app/test/okr-trang-don-vi.dom.tsx`, `apps/app/test/vo-khu-muc-tieu.dom.tsx`, `apps/app/test/okr-thanh-tab.dom.tsx`, `apps/app/test/okr-theo-don-vi.dom.tsx`, `apps/app/test/nut-hoi-kara-thay-khung.dom.tsx`
- Modify: `_acceptance/<11 hồ sơ>/evals.yaml` — chỉ thêm hai dòng `status: not-run` + `superseded_by: mot-nut-tao-muc-tieu#AC-<n>` cho đúng eval gãy (Hỏi-1 đã duyệt; khuôn EVAL-THAY-BOI-TEMPLATE của GUIDE kit 2.24)
- Modify: design doc — thêm bảng «Eval cũ thay bởi vòng này» (`<slug cũ>/<id cũ>` → `AC-n`), điều kiện `thay-khong-nhan` của kit
- Modify: `_acceptance/mot-nut-tao-muc-tieu/decisions.jsonl` — một dòng `fix` (stage `S3`) liệt số eval đã khai thay

**Interfaces:**
- Consumes: Task 4–6 đã xong.
- Ánh xạ thay: eval đo hàng nút đầu trang → `AC-1` (hai màn tạo) hoặc `AC-2` (màn chỉ đọc); eval bấm «Nhập từ bảng tính» trong menu → `AC-6`; eval nhóm Soạn ở đầu trang → `AC-7`; eval «Bắt đầu từ mẫu» trong ngăn → `AC-5`; eval «Thêm mục tiêu» mở thẳng ngăn → `AC-4`.

- [ ] **Step 1: Chạy `bun run test -- --filter=app`** trên cây sau Task 6; ghi danh sách ca đỏ cùng dòng lỗi nguyên văn vào scratchpad.
- [ ] **Step 2: Với mỗi ca đỏ:** ca đo hành vi đã đổi theo hợp đồng → sửa ca theo hành vi mới (đi qua hộp chọn) hoặc xoá khi đã có ca tương ứng trong `mot-nut-tao-muc-tieu.dom.tsx`; ca đỏ vì lỗi thật → sửa mã, không sửa ca.
- [ ] **Step 3: Tra mọi eval của 11 hồ sơ có `cmd`/`paths`/`expected` chạm ca vừa sửa hay xoá** (`grep -n` theo tên ca `-t <ca>` và `data-nut` cũ); khai `status: not-run` + `superseded_by` theo ánh xạ; thêm dòng tương ứng vào bảng của design doc.
- [ ] **Step 4: `bun run test -- --filter=app` xanh; `bun run check-types`, `bun run lint`, `bun run lint:slop` xanh.**
- [ ] **Step 5: Commit** — `test(okr): bài kiểm theo đầu trang một nút; khai eval cũ thay bởi VK9`. Ghim lại 11 hồ sơ là việc của dãy, có khoá `ghim-lai`, SAU khi VK9 ký Cổng Bằng chứng (kit chỉ nhận con trỏ khi hồ sơ thay đã ký) — không làm trong S3.

### Task 8: Bàn đo màn

**Files:**
- Create: `_acceptance/mot-nut-tao-muc-tieu/rang/do-man.mjs` — theo khuôn `_acceptance/vo-khu-muc-tieu/rang/do-man.mjs` (phiên đo `tien-de`, đăng nhập bằng `dev:session`, cuộn bằng con lăn, mỗi khổ một phiên)

**Interfaces:**
- In ra đúng các dòng của E3 (`NUT CHINH <man> <vai> <so>`, `SAI NUT CHINH …`), E8 (`DUNG TU VIET <nonce>` / `SAI TU VIET <nonce>`), E16 (`DUNG AC-9 <anh>: tran ngang 0, dong bi cat 0, vung bam tron 4/4`), dòng `KET LUAN` cuối; mã 0/1/2 như `expected`. `EVAL=chieu-do` chạy chiều đỏ trên bản sao; `MNT_CHEP_ANH=1` mới chép ảnh vào `evidence/`.

- [ ] **Step 1: Viết bàn đo.**
- [ ] **Step 2: Chạy `EVAL= bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/mot-nut-tao-muc-tieu/rang/do-man.mjs"`** → `KET LUAN` mã 0. Lệnh này dựng phiên đo — chạy nền.
- [ ] **Step 3: Chạy chiều đỏ `EVAL=chieu-do`** → mã 1 với `SAI NUT CHINH suc-khoe truong 1` và `SAI TU VIET`.
- [ ] **Step 4: Commit** — `test(mot-nut-tao-muc-tieu): bàn đo màn đếm nút chính và chụp hộp`.

---

**Thứ tự và độc lập.** Task 1 `independent: true`. Task 2 `independent: true`. Task 3 `independent: false` (cần Task 2). Task 4 `independent: false` (cần 1, 2, 3). Task 5 `independent: false` (cần 4). Task 6 `independent: false` (cần 2, 4). Task 7 `independent: false` (cần 5, 6). Task 8 `independent: false` (cần 5, 6). Chạy tuần tự trong một phiên: các task nối nhau bằng giao diện, song song chỉ được Task 1 ∥ Task 2 — không đáng một lượt Workflow.

**Phục vụ eval.** Task 1 → E16 · Task 2 → E4, E5 · Task 3 → E13 · Task 4 → E4, E5 · Task 5 → E1, E2, E15 · Task 6 → E6, E9, E11 · Task 7 → E7, E10, E12, E14 (bài API giữ xanh) và lưới hồ sơ đã ký · Task 8 → E3, E8, E16.
