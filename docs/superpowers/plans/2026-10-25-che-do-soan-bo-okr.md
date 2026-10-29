# Chế độ Soạn bộ OKR — kế hoạch S2 (VK10, `che-do-soan-bo-okr`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một khung bản ghi cỡ `kara` cho một bộ OKR: tài liệu bên trái ghi thẳng mục tiêu và KR nháp qua thủ tục có
sẵn, cột bên phải có khối Chất lượng (máy chấm) và khối góp ý Kara, công bố từ chính khung; ngăn theo dõi chỉ còn một chip.

**Architecture:** Loại khung mới `soan-bo` trong `record-stack` mang khoá bộ `<cycleId>~<khoaDon>`. Màn đọc bộ qua
`okr.danhSach` (lọc đúng đơn vị của bộ ở máy khách) và quyền từng mục tiêu nháp qua `okr.objective`; mỗi dòng giữ chữ
ở máy khách tới khi đủ chữ rồi tự lưu bằng `create*/update*`. Điểm chất lượng là hàm thuần mới `chamBo` của
`packages/validation` dựng trên `kiemOkr`. Góp ý dùng lại `useGopYMucTieu` cho từng mục tiêu. Các «tham số thử» của
evals đi qua một ngữ cảnh phụ thuộc `PhuThuocSoan` có giá trị mặc định ở production.

**Tech Stack:** Next.js App Router (client components), tRPC + TanStack Query, nuqs, `@crm/ui` (shadcn + Kara), Zod
(`packages/validation`), bun test + jsdom (`packages/ui/test/setup-dom.ts`), Playwright qua `scripts/lan-do/tien-de.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-22-che-do-soan-bo-okr-design.md`; hợp đồng `_acceptance/che-do-soan-bo-okr/contract.md`
(11 AC, đã duyệt 22/10), `evals.yaml` (E1–E20), sổ `decisions.jsonl` (d-1…d-20, không lật lại), `design-pass.md`, bản mẫu
`apps/app/app/proto/_modules/che-do-soan-bo-okr/`.

Đã đọc trước khi lập: `CLAUDE.md`, `AGENTS.md` (bảng chỉ mục), `docs/design.md`, `docs/ai-ux.md` (mục 3, 7, 11),
`docs/api.md` (không thủ tục mới), `docs/vong-doi.md` (xoá dùng `xoaMucTieu`, `removeKeyResult`), skill
`superpowers:writing-plans`. S3 đọc thêm `docs/chat-ui.md`, `docs/agent-panel.md` trước khi chạm cột bên Kara,
`docs/reui.md` nếu cài gì vào `packages/ui`, và `.agents/skills/nuqs`, `.agents/skills/shadcn`.

## Global Constraints

- Không viết chú thích trong mã — mã mới và mã sửa (`AGENTS.md`).
- Chỉ thành phần `@crm/ui`; không `className` đổi màu, góc, khoảng cách của component `@crm/ui`; biến thể mới làm trong
  `packages/ui` (bảng «Dấu hiệu vẽ tay» của `docs/design.md`). E18 (`design-gate --mode static`) phải 0 P0.
- Không thủ tục API mới, không migration, không sửa `apps/api` hay `packages/db` (Context của hợp đồng). Thủ tục dùng:
  `okr.danhSach`, `okr.objective`, `okr.access`, `okr.cycles`, `org.tree`, `okr.createObjective`, `okr.updateObjective`,
  `okr.createKeyResult`, `okr.updateKeyResult`, `okr.removeKeyResult`, `okr.xoaMucTieu`, `okr.publishObjective`,
  `okr.guiDuyet`, `okr.troLySanSang`, `okr.troLyDanhSach`, `okr.troLyDeXuat`, `okr.troLyQuyet`, `okr.soanSanSang`, `okr.soanMo`.
- Tệp `"use client"` chỉ import `@crm/ui`, client tRPC, React, nuqs, `@crm/validation/<subpath>` không kéo Prisma;
  không import `@crm/db` hay `@crm/auth`. `bun run build` là phép kiểm cuối.
- Chữ mới nằm trong tệp riêng `apps/app/lib/messages/okr-soan-bo.ts` (`okrSoanBoMessages(locale)`, vi và en), mọi hàm
  chữ có tham số được GHIM ở `apps/app/test/messages-guard.spec.ts`. Chữ dùng lại: `crm.ts` «Ô này nhận số, ví dụ
  1.234,5»; `okr.ts` `hoiCongBo.body` «Khởi điểm của mọi KR sẽ bị khoá…». Dữ liệu người nhập mang `translate="no"`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture, thông điệp ghim đúng chữ của `evals.yaml`
  («vk10-<ca>: … lech», «SAI AC-n: …»). Chiều đỏ DOM đi qua `PhuThuocSoan` (Task 4) hay tham số có sẵn của khung; không
  `mock.module` để lật hành vi (rò giữa các ca trong một tiến trình bun).
- `_acceptance/config.yaml` chỉ thêm dòng (luật 7). Không sửa thước của hồ sơ khác ngoài Task 15, và ở đó theo đúng AC-11.
- Chạm `apps/app/components/crm/record-sheet/**` (làn M5, luật 19): trước Task 5 xin `cham-tep` qua phiên giám sát cho
  `record-stack.ts`, `record-sheet-host.tsx`, `objective-sheet.tsx`, `soan-bo-sheet.tsx`.
- Hằng số chỉnh được (độ dài tối thiểu, ngưỡng 2–5 KR, khổ hai thẻ) ở một object `as const` mỗi khu:
  `CHAM_BO` trong `okr-cham-bo.ts`, `SOAN_BO` trong `soan-bo/cau-hinh.ts`.
- Phân tích ở biên: khoá bộ trong URL đọc bằng Zod ở `soan-bo/khoa-bo.ts`; không truyền `Record<string, unknown>`.
- Không dùng cổng 3000/3001; phép đo màn qua `tien-de.mjs` (phiên đo riêng). Không `pkill -f`/`killall`.

## Review Focus

1. Esc khi focus đang ở trong ô của dòng chưa lưu: `SheetContent` nuốt Esc từ ô đang sửa (`escTuXuLy`) nên hộp «Bỏ dòng
   chưa lưu?» có thể không bật — người mong Esc hỏi lại. Ca thêm ở Task 8: focus trong ô KR thiếu đích, Esc → hộp mở.
2. Mục tiêu bị người khác công bố hay đưa vào chờ duyệt trong lúc đang soạn: lần lưu sau trả lỗi; dòng phải giữ chữ, đọc
   lại bộ và khoá đúng theo trạng thái mới, không lặp lưu. Ca thêm ở Task 8: `updateObjective` trả lỗi «chờ duyệt», lần
   đọc lại trả `cho-duyet` → mọi ô `disabled`, đúng 1 lần gọi.
3. Gõ nhanh hai lần rời ô liên tiếp trên một dòng mới (Tab qua lại): mỗi dòng chỉ một lần gọi đang chạy, lần sau xếp
   hàng; không bao giờ hai `createObjective`/`createKeyResult` cho cùng một dòng. Ca thêm ở Task 7: `createKeyResult` treo,
   rời ô ba lần → đúng 1 lần gọi, sau khi trả về thì 1 `updateKeyResult` mang chữ mới nhất.
4. Backspace ở đầu dòng KR trống của mục tiêu đã công bố hay chờ duyệt: không gọi `removeKeyResult` (xoá KR chỉ ở mục
   tiêu nháp). Ca thêm ở Task 8.
5. Bộ của khối (`bp`): `okr.danhSach` trả cả mục tiêu phòng ban con; tài liệu chỉ liệt mục tiêu đúng cấp của bộ, và «Công
   bố N» không đếm mục tiêu phòng ban con. Ca thêm ở Task 5 (dữ liệu bp có một mục tiêu `phong-ban` con).

---

## Bản đồ tệp

Tạo dưới `apps/app/app/(app)/[slug]/okr/soan-bo/` (mọi tệp `.tsx` là `"use client"`):

| Tệp | Trách nhiệm |
| --- | --- |
| `cau-hinh.ts` | `SOAN_BO` (độ dài tên tối thiểu 3, khổ hai thẻ 1024) |
| `khoa-bo.ts` | `taoKhoaBo`, `docKhoaBo` (Zod) |
| `mo-soan-bo.ts` | `useMoSoanBo` — ai mở được, mở khung ở đúng bộ (và mục tiêu) |
| `du-lieu-bo.ts` | hàm thuần: chọn mục tiêu của bộ, suy kiểu, trạng thái dòng, người phụ trách mặc định, đếm công bố |
| `phu-thuoc.ts` | `PhuThuocSoan`, `PHU_THUOC_MAC_DINH`, `PhuThuocSoanContext`, `usePhuThuocSoan()` |
| `use-bo-soan.ts` | đọc bộ: access, cycles, org.tree, danhSach, objective của mục tiêu nháp → `BoSoan` |
| `use-luu-dong.ts` | hàng đợi lưu mỗi dòng, lỗi theo kiểu ô, khai «chưa lưu» |
| `khung-soan-bo.tsx` | vỏ khung: đầu khung, chờ tải, lỗi tải, chỉ xem, hai ô / hai thẻ |
| `tai-lieu-bo.tsx` | tài liệu: các khối mục tiêu, «Thêm mục tiêu», bộ trống, chân Công bố |
| `dong-muc-tieu.tsx`, `dong-kr.tsx` | một dòng mục tiêu, một dòng KR (ô, phím, khoá, menu Kiểu, ô người) |
| `khoi-chat-luong.tsx` | khối Chất lượng |
| `khoi-gop-y.tsx` | khối góp ý Kara, sổ đăng ký `nho` từng mục tiêu |
| `cong-bo.tsx` | nút chính, hộp hỏi có ô tích, vòng công bố, biên nhận |

Tạo khác: `packages/validation/src/okr-cham-bo.ts`, `packages/validation/test/okr-cham-bo.spec.ts`,
`packages/ui/src/components/kara/vat-pham.tsx`, `apps/app/components/crm/record-sheet/soan-bo-sheet.tsx`,
`apps/app/lib/messages/okr-soan-bo.ts`, `apps/app/test/che-do-soan-bo-okr.dom.tsx`,
`apps/app/test/che-do-soan-bo-okr-du-lieu.spec.ts`, `_acceptance/che-do-soan-bo-okr/rang/{man-soan.mjs,
man-soan-du-lieu.mjs, man-soan-do.mjs, man-soan-chieu-do.mjs, san-thiet-ke.mjs, khong-doi-hinh.mjs, anh-xa-nghi.json}`.

Sửa: `packages/ui/src/components/textarea.tsx`, `packages/validation/package.json`, `apps/app/lib/search-param-keys.ts`,
`apps/app/lib/messages/okr.ts`, `apps/app/test/messages-guard.spec.ts`, `record-stack.ts`, `record-sheet-host.tsx`,
`objective-sheet.tsx`, `okr/chip-gop-y.tsx`, `okr/hop-chon-duong.tsx`, `okr/trang-thai-okr.tsx`,
`okr/theo-don-vi/theo-don-vi.tsx`, `_acceptance/config.yaml`, `CONTEXT.md`.

## Chỗ phải khớp lại với VK3 và HT1 (hợp đồng viết trước khi hai vòng ấy gộp)

- **Đường vào «Soạn cả bộ».** VK9/VK3 dựng hộp ở `hop-chon-duong.tsx`; dòng thứ tư là `data-duong="soan"` («Soạn cùng
  Kara», `KaraMark`, khoá theo `useDuongSoan`). Vòng này giữ thuộc tính `data-duong="soan"` (ít đổi thước nhất), đổi
  chữ thành «Soạn cả bộ», bỏ `KaraMark`, và khoá theo luật của chế độ Soạn (sửa được bộ + pha ghi được + bộ là đơn vị),
  không theo `soanSanSang`. Cuộc soạn cũ chuyển vào lối «Nhờ Kara soạn nháp» trong tài liệu khi bộ trống (vẫn dùng
  `useDuongSoan`). Nút «Tiếp cuộc đang soạn» (`c.tiep`) và «N cuộc đã soạn» (`data-nut="ds-cuoc"`) giữ nguyên.
- **Câu rỗng.** VK3 dựng câu rỗng bằng `Rong` của `trang-thai-okr.tsx` (`data-trang-thai="ST-donvi-rong"`) truyền qua
  `BangDonVi rong=`; chưa có `data-cau-rong-bo` trong mã. Vòng này thêm prop `soan?: ReactNode` cho `Rong` và
  `theo-don-vi.tsx` truyền nút «Soạn bộ OKR» (`data-nut="soan-bo-okr"`) khi người xem sửa được bộ.
- **Bộ trần là OneHub (HT1).** Trang một bộ không có `don` trên URL là bộ OneHub (`GOC`). Khoá bộ luôn ghi `khoaDon`
  tường minh (`goc`), không dựa vào URL trần.
- **Bộ của khối gồm phòng ban con.** `okr.danhSach` với `bp` trả cả mục tiêu `phong-ban` của các phòng con, và với
  `nguoi` trả mọi mục tiêu người ấy dính vào. VK19 (`bo-okr-chi-don-vi`, chưa gộp) sẽ đổi luật trang. Chế độ Soạn lọc ở
  máy khách đúng cấp của bộ (`chonMucTieuBo`, Task 4) nên đứng vững cả trước và sau VK19. Bộ cá nhân (`nguoi`) không có
  lối vào chế độ Soạn (như `donViSoanCua` trả `null`); URL thẳng mở chỉ xem với lý do.
- **Dòng vị trí, thẻ con (VK3).** Khung Soạn là khung bản ghi chồng lên trang, không phải thẻ con mới; `TheConBo` và
  `ViTriBo` không đổi.
- **Chip ở dòng danh sách đã có.** `okr/chip-gop-y.tsx` (`ChipGopY`, `data-chip-gop-y={mt.id}`) trên dòng danh sách mở
  ngăn theo dõi với `neoGopY` rồi cuộn tới `[data-vung-kara]`. Sau vòng này vùng ấy không còn: chip ở dòng danh sách vẫn
  mở ngăn, `neoGopY` cuộn tới chip đầu khung mới. Bàn đo và bài kiểm của vòng này đếm chip trong phạm vi
  `[data-okr-sheet]`, không đếm chip của dòng danh sách nằm dưới lớp phủ.

## Thứ tự

```
T1 ─┬─ T2 (validation) ─────────────┐
    ├─ T3 (packages/ui) ────────────┤
    ├─ T4 (lõi thuần) ──────────────┤
    │                               ├─ T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12 ─┬─ T15 ─ T16
    ├─ T13 (bàn đo màn, viết) ──────┘                                              │
    └─ T14 (sàn thiết kế, viết) ───────────────────────────────────────────────────┘
```

- T2, T3, T4 chạy song song sau T1: không tệp nào chung.
- T13 và T14 được viết song song với T5–T12 (chỉ tệp dưới `rang/`), nhưng bước xác minh của chúng chạy sau T12.
- T5–T12 tuần tự: cùng sửa `apps/app/test/che-do-soan-bo-okr.dom.tsx` (một tệp duy nhất theo `paths` của evals) và các
  tệp `soan-bo/tai-lieu-bo.tsx`, `dong-*.tsx`.
- T15 sau T12 (đo hồ sơ đã ký trên cây đã xong). T16 cuối.

| # | Việc | independent | Phục vụ |
| --- | --- | --- | --- |
| 1 | Nền chung: khoá config, chữ, tham số URL, loại khung, khoá bộ, khung bài kiểm, CONTEXT | false | tất cả |
| 2 | Hàm chấm bộ `chamBo` | true | E6, E7 |
| 3 | `packages/ui`: dòng tài liệu, ô vật phẩm không nhãn Kara | true | E17, E18 |
| 4 | Lõi thuần và `PhuThuocSoan` | true | E1, E3, E5, E10, E14, E15 |
| 5 | Khung, đọc bộ, chờ tải, lỗi tải, chỉ xem | false | E1, E14, E15, E16 |
| 6 | Đường vào: hộp Thêm mục tiêu, câu rỗng | false | E1, E2, E11, E14 |
| 7 | Viết mới bằng bàn phím và tự lưu | false | E3, E4, E11 |
| 8 | Sửa, xoá, khoá theo trạng thái, lưu lỗi, hỏi khi đóng | false | E5, E14, E15, E20 |
| 9 | Khối Chất lượng | false | E7 |
| 10 | Khối góp ý Kara | false | E8, E9 |
| 11 | Công bố | false | E10, E11 |
| 12 | Ngăn theo dõi một chip | false | E12, E13 |
| 13 | Bàn đo màn `man-soan*.mjs` | false | E2, E4, E9, E11, E13, E16, E17, E20 |
| 14 | Sàn thiết kế | false | E18 |
| 15 | Giữ hồ sơ đã ký (AC-11) | false | E19 |
| 16 | Năm lệnh chứng, lượt evals đủ | false | tất cả |

---

### Task 1: Nền chung

**Files:**
- Modify: `_acceptance/config.yaml` (thêm dòng dưới `executors.test` và `executors.script`)
- Create: `apps/app/lib/messages/okr-soan-bo.ts`
- Modify: `apps/app/test/messages-guard.spec.ts` (ghim)
- Modify: `apps/app/lib/search-param-keys.ts` (`okr.soanMt: "soanMt"`)
- Modify: `apps/app/components/crm/record-sheet/record-stack.ts` (`RECORD_KINDS` thêm `"soan-bo"`)
- Create: `apps/app/app/(app)/[slug]/okr/soan-bo/cau-hinh.ts`, `soan-bo/khoa-bo.ts`
- Create: `apps/app/test/che-do-soan-bo-okr.dom.tsx` (khung bài kiểm + ca `vk10-khoa`)
- Modify: `CONTEXT.md` (mục «Chế độ Soạn», «Điểm chất lượng»)

**Interfaces:**
- Produces: `okrSoanBoMessages(locale)`; `SEARCH_PARAM.okr.soanMt`; `RecordKind` gồm `"soan-bo"`;
  `SOAN_BO = { tenToiThieu: 3, khoHaiThe: 1024 } as const`;
  `taoKhoaBo(cycleId: string, don: DonChonOkr): string` → `` `${cycleId}~${khoaDon(don)}` ``;
  `docKhoaBo(id: string): { cycleId: string; don: DonChonOkr } | null`.
- Khung bài kiểm trong `che-do-soan-bo-okr.dom.tsx` (dùng lại `./khung-soan-okr` cho tRPC giả: `dat`, `goiCua`, `goi`,
  `datLai`): `boMau(opts)` dựng `danhSachOutput`/`okr.objective`/`org.tree`/`okrAccessOutput`/`cyclesOutput` đã
  `parse` bằng schema thật của `apps/api` (fixture sai schema là fixture sai); `veSoan(khoaBo, { phuThuoc? })` dựng
  `RecordSheetHost` trong `NuqsTestingAdapter` với `?record=soan-bo:<khoa>`; `goiGhi()` trả các lời gọi thủ tục ghi.

Khoá config (thêm đúng các dòng này; `<DOM>` = `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload
../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx`):

```yaml
    vk10_dom_mo: <DOM> -t vk10-mo
    vk10_dom_viet: <DOM> -t vk10-viet
    vk10_dom_sua: <DOM> -t vk10-sua
    vk10_cham_bo: cd packages/validation && bun test test/okr-cham-bo.spec.ts -t vk10-cham
    vk10_dom_chat_luong: <DOM> -t vk10-chat-luong
    vk10_dom_gop_y: <DOM> -t vk10-gop-y
    vk10_dom_cong_bo: <DOM> -t vk10-cong-bo
    vk10_dom_ngan: <DOM> -t vk10-ngan
    vk10_dom_quyen: <DOM> -t vk10-quyen
    vk10_dom_tai: <DOM> -t vk10-tai
# executors.script
    vk10_man: 'EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/che-do-soan-bo-okr/rang/man-soan.mjs"'
    vk10_san_thiet_ke: bun _acceptance/che-do-soan-bo-okr/rang/san-thiet-ke.mjs
    vk10_khong_doi_hinh: bun _acceptance/che-do-soan-bo-okr/rang/khong-doi-hinh.mjs
```

`-t vk10-mo` khớp cả ca `vk10-mo-do`; không tên ca nào khác bắt đầu bằng tiền tố của tên khác (kiểm ở bước 2).

- [ ] **Step 1: Viết ca `vk10-khoa`** — `docKhoaBo(taoKhoaBo("ky1", {loai:"pb",id:"P1"}))` bằng `{cycleId:"ky1", don:{loai:"pb",id:"P1"}}`;
  `goc` đi về `{loai:"goc"}`; `docKhoaBo("ky1")`, `docKhoaBo("ky1~xx:1")`, `docKhoaBo("~pb:P1")` là `null`.
- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-khoa` → FAIL (module chưa có).
- [ ] **Step 3: Viết `khoa-bo.ts`, `cau-hinh.ts`, thêm kind, tham số URL, tệp chữ** (đủ mọi chữ của Task 5–12, vi và en:
  tiêu đề «Soạn bộ OKR», «Soạn cả bộ», «Soạn bộ OKR» (nút câu rỗng), «Chưa mở được bộ OKR», «Chưa lưu — thiếu đích»,
  «Chưa lưu — thiếu khởi điểm», «Chưa lưu — đích bằng khởi điểm», «Số của mục tiêu đã công bố sửa ở ngăn KR», câu khoá
  chờ duyệt, câu chỉ xem (không sửa được bộ / chu kỳ đã đóng / bộ cá nhân), «Bỏ dòng chưa lưu?» + thân + nút,
  «Chất lượng», «N trên M điểm đạt», tên bảy luật, «Đến dòng», «Gõ mục tiêu đầu tiên để máy chấm», «Nhờ Kara đọc bộ»,
  «Kara đang đọc bộ OKR này…», «Nhờ Kara soạn nháp», «đổi theo Kara», «Công bố N mục tiêu», «Gửi duyệt N mục tiêu»,
  «Công bố» (khoá), «Đã công bố N mục tiêu», «Về màn theo dõi», «Thử lại», câu «ở lại Nháp vì chưa có KR», hai thẻ
  «Bộ OKR» · «Chất lượng và Kara»), rồi ghim mọi hàm chữ có tham số ở `messages-guard.spec.ts`.
- [ ] **Step 4: Thêm khoá config, mục CONTEXT** — `grep -c "vk10_" _acceptance/config.yaml` = 13; chạy
  `node -e` đọc YAML (theo cách `scripts/` của kho đọc config) và thấy 13 khoá.
- [ ] **Step 5: Xanh** — lệnh step 2 PASS; `cd apps/app && bun test ./test/messages-guard.spec.ts` PASS.
- [ ] **Step 6: Commit** `feat(che-do-soan-bo-okr): nền chung — khoá bộ, chữ, loại khung, khoá eval`.

### Task 2: Hàm chấm bộ

**Files:**
- Create: `packages/validation/src/okr-cham-bo.ts`, `packages/validation/test/okr-cham-bo.spec.ts`
- Modify: `packages/validation/package.json` (`"./okr-cham-bo": "./src/okr-cham-bo.ts"`)

**Interfaces:**
- Consumes: `kiemOkr`, `OKR_KIEM`, `MaLuatOkr`, `KrKiem` từ `./okr-kiem`; `KieuKr` từ `./okr-kr`.
- Produces:

```ts
export const MA_LUAT_BO = [...MA_LUAT_OKR, "it-hon-2-kr", "nhieu-hon-5-kr", "kr-thieu-nguoi"] as const;
export type MaLuatBo = (typeof MA_LUAT_BO)[number];
export type KrCham = { title: string; kind: KieuKr; startValue: number | null; targetValue: number | null; ownerUserId: string | null };
export type MucTieuCham = { title: string; whyNow: string; keyResults: KrCham[] };
export type LoiBo = { ma: MaLuatBo; mucTieu: number; kr: number | null };
export type KetQuaCham = { dat: number; xet: number; loi: LoiBo[] };
export const CHAM_BO = { krToiThieu: 2, krToiDa: 5 } as const;
export function chamBo(bo: MucTieuCham[], tuyChon?: { tatLuat?: readonly MaLuatBo[] }): KetQuaCham;
```

Công thức (AC-4, chép nguyên): mỗi mục tiêu xét «2–5 KR» (vi phạm `it-hon-2-kr` khi < 2, `nhieu-hon-5-kr` khi > 5);
«có KR đối trọng» chỉ xét khi có từ 2 KR, vi phạm đúng khi `kiemOkr` trả `thieu-doi-trong`. Mỗi KR xét các luật mức KR
áp cho kiểu của nó theo `OKR_KIEM` (`kr-la-viec` trừ `kieuKhongHoiViec`; `thieu-khoi-diem` trừ `kieuKhongHoiKhoiDiem`;
`dich-bang-khoi-diem` chỉ `kieuHoiDichBangKhoi`) cộng «có người phụ trách». `xet` = tổng điểm xét, `dat = xet - số lỗi`.
Bốn luật đầu lấy từ `kiemOkr` gọi trên mục tiêu đã đổi số: `startValue ?? 0`, `targetValue ?? startValue ?? 0` (số
trống tính như chưa có khởi điểm). Luật bị tắt qua `tatLuat` vẫn được đếm vào `xet` nhưng không sinh lỗi.

- [ ] **Step 1: Viết ca `vk10-cham`** — chín bộ giả, mỗi bộ ghim đúng `(dat, xet)` của `evals.yaml` E6: sạch «12/12»;
  `kr-la-viec` «11/12»; `thieu-khoi-diem` «11/12»; `dich-bang-khoi-diem` trên KR giữ trên «11/12»; `thieu-doi-trong`
  (3 tăng tới) «10/11»; `it-hon-2-kr` (1 tăng tới) «3/4»; `nhieu-hon-5-kr` (6 tăng tới) «18/20»; `kr-thieu-nguoi` «11/12»;
  hai mục tiêu sạch «24/24». Mỗi lỗi khẳng định `ma`, `mucTieu`, `kr`. Bốn luật đầu so với `kiemOkr(...)` gọi thật trên
  cùng mục tiêu. Thông điệp `expect(..., "vk10-cham: <bo> <ma> lech")`.
- [ ] **Step 2: Viết ca `vk10-cham-do`** — sạch + KR tăng tới «Gọi 50 cuộc» (khởi điểm khác 0) → «14/15», lỗi `kr-la-viec`;
  và `chamBo(it-hon-2-kr, { tatLuat: ["it-hon-2-kr"] })` qua cùng hàm kiểm → ném «vk10-cham: it-hon-2-kr it-hon-2-kr lech».
- [ ] **Step 3: Chạy, thấy đỏ** — `cd packages/validation && bun test test/okr-cham-bo.spec.ts -t vk10-cham` → FAIL.
- [ ] **Step 4: Viết `chamBo`**.
- [ ] **Step 5: Xanh** — lệnh step 3 PASS (cả `vk10-cham-do`); `bun run check-types` PASS.
- [ ] **Step 6: Commit** `feat(che-do-soan-bo-okr): hàm chấm bộ OKR theo kiemOkr và hai luật cấu trúc`.

### Task 3: `packages/ui` — dòng tài liệu và ô vật phẩm không nhãn Kara

**Files:**
- Modify: `packages/ui/src/components/textarea.tsx`
- Create: `packages/ui/src/components/kara/vat-pham.tsx`
- Test: `packages/ui/test/vat-pham-dock.dom.tsx`

**Interfaces:**
- Produces: `Textarea` thêm `variant="tai-lieu"` (như `composer`: không viền, nền trong, tự cao theo chữ) và hai
  `size`: `"tieu-de"` (cỡ tiêu đề mục tiêu, đậm) và `"dong"` (cỡ dòng KR), chỉ từ token của kho.
  `VatPhamDock({ title, meta?, actions?, footer?, children }: { title: ReactNode; meta?: ReactNode; actions?: ReactNode; footer?: ReactNode; children: ReactNode })`
  — bố cục `KaraArtifact variant="docked"` (`KaraDockHeader` / `KaraDockBody` / `KaraDockFooter divided`) nhưng không
  `KaraMark`, `data-slot="vat-pham"`. `KaraArtifact` không đổi (hồ sơ khác đo nó).

- [ ] **Step 1: Bài kiểm** — dựng `VatPhamDock` có `title`, `footer`: có `[data-slot=vat-pham]`, không
  `[data-slot=kara-mark]`; dựng `Textarea variant="tai-lieu" size="tieu-de"` và `size="dong"`: hai lớp chữ khác nhau.
- [ ] **Step 2: Đỏ** — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/vat-pham-dock.dom.tsx` → FAIL.
- [ ] **Step 3: Viết biến thể và thành phần** (xuất từ `kara/vat-pham.tsx`; không thêm vào barrel nếu barrel `kara.tsx`
  kéo thứ server).
- [ ] **Step 4: Xanh** — lệnh step 2 PASS; `node <design-gate> --target packages/ui/src/components/kara/vat-pham.tsx --mode static` 0 P0.
- [ ] **Step 5: Commit** `feat(ui): dòng tài liệu hai cỡ và ô vật phẩm không nhãn Kara`.

### Task 4: Lõi thuần và `PhuThuocSoan`

**Files:**
- Create: `soan-bo/du-lieu-bo.ts`, `soan-bo/phu-thuoc.ts`
- Test: `apps/app/test/che-do-soan-bo-okr-du-lieu.spec.ts`

**Interfaces:**
- Consumes: `docSoOkr`, `SO_KR_MOC`, `KieuKr` (`@crm/validation/okr-kr`); `DonChonOkr`; `RouterOutputs["okr"]["danhSach"]`,
  `RouterOutputs["org"]["tree"]`; `chamBo` (Task 2).
- Produces (`du-lieu-bo.ts`):

```ts
export type DongDs = RouterOutputs["okr"]["danhSach"]["rows"][number];
export function chonMucTieuBo(ds: RouterOutputs["okr"]["danhSach"], don: DonChonOkr): DongDs[];
export type DongKrNhap = { ten: string; khoi: string; dich: string; donVi: string; kieu: KieuKr | null; nguoi: string | null };
export type TrangThaiDongKr =
  | { loai: "du"; kieu: KieuKr; khoi: number; dich: number }
  | { loai: "chua-luu"; ly: "thieu-ten" | "thieu-dich" | "thieu-khoi-diem" | "dich-bang-khoi" | "so-sai" };
export function suyKieuKr(khoi: number | null, dich: number | null): KieuKr | null;
export function kiemDongKr(d: DongKrNhap): TrangThaiDongKr;
export function nguoiPhuTrachMacDinh(don: DonChonOkr, cay: RouterOutputs["org"]["tree"], nguoiSoan: string): string;
export function demCongBo(ds: readonly { status: string; soKrDaLuu: number }[]): number;
```

  Luật: `chonMucTieuBo` lấy `ds.rows` (không bao giờ `ds.daBo`) có `level`/`unitId` đúng bộ — `goc` → `onehub`,
  `bp` → `bo-phan` + `unitId`, `pb` → `phong-ban` + `unitId`, `nguoi` → `[]`; giữ thứ tự `rows`.
  `suyKieuKr`: cả hai trống → `"moc"`; `dich > khoi` → `"tang-toi"`; `dich < khoi` → `"giam-xuong"`; còn lại `null`.
  `kiemDongKr`: tên ngắn hơn `SOAN_BO.tenToiThieu` → `thieu-ten`; ô số không đọc được bằng `docSoOkr` → `so-sai`;
  khởi điểm có, đích trống → `thieu-dich`; đích có, khởi điểm trống → `thieu-khoi-diem`; bằng nhau và `kieu` chưa chọn
  tay → `dich-bang-khoi`; mốc → `{ kieu: "moc", ...SO_KR_MOC }`; `kieu` chọn tay ở menu thắng `suyKieuKr`.
  `nguoiPhuTrachMacDinh`: `bp`/`pb` có trưởng → `head.id`, không có → `nguoiSoan`; `goc` → `nguoiSoan` (Hỏi-8).
  `demCongBo`: số dòng `status === "nhap"` có `soKrDaLuu ≥ 1`.
- Produces (`phu-thuoc.ts`):

```ts
export type PhuThuocSoan = {
  chonMucTieu: typeof chonMucTieuBo;
  suyKieu: typeof suyKieuKr;
  kiemDong: typeof kiemDongKr;
  luuKhi: "roi-o" | "moi-phim";
  khoaSoCongBo: boolean;
  chamBo: typeof chamBo;
  docLaiSauNhan: boolean;
  chatLuongKhiKaraTat: "hien" | "an";
  demCongBo: typeof demCongBo;
  goiTheoOTich: boolean;
  giuKetQuaKhiLoi: boolean;
  chiXemTheoQuyen: boolean;
  hoiKhiDongChuaLuu: boolean;
  giuChuKhiLoiLuu: boolean;
  tieuDeKhiTai: boolean;
};
export const PHU_THUOC_MAC_DINH: PhuThuocSoan;
export const PhuThuocSoanContext: React.Context<PhuThuocSoan>;
export function usePhuThuocSoan(): PhuThuocSoan;
```

  Mọi mặc định là hành vi của hợp đồng (`luuKhi: "roi-o"`, `khoaSoCongBo: true`, `docLaiSauNhan: true`,
  `chatLuongKhiKaraTat: "hien"`, `goiTheoOTich: true`, `giuKetQuaKhiLoi: true`, `chiXemTheoQuyen: true`,
  `hoiKhiDongChuaLuu: true`, `giuChuKhiLoiLuu: true`, `tieuDeKhiTai: true`). Production không bao giờ dựng Provider; chỉ
  bài kiểm DOM truyền bản lật một trường cho ca chiều đỏ.

- [ ] **Step 1: Bài kiểm** — bảng ca cho mỗi hàm theo đúng luật trên; thêm ca Review Focus 5: `danhSach` của `bp:B1` có
  một dòng `phong-ban` con và một dòng `bo-phan` B1 → `chonMucTieuBo` trả đúng dòng `bo-phan`; `daBo` có dòng → không trả.
  `kiemDongKr({ten:"Doanh thu", khoi:"2", dich:"3,5"})` → `du` với `dich === 3.5`, `kieu === "tang-toi"`.
- [ ] **Step 2: Đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/che-do-soan-bo-okr-du-lieu.spec.ts` → FAIL.
- [ ] **Step 3: Viết hai tệp**.
- [ ] **Step 4: Xanh** — lệnh step 2 PASS; `bun run check-types` PASS.
- [ ] **Step 5: Commit** `feat(che-do-soan-bo-okr): lõi thuần của tài liệu và ngữ cảnh phụ thuộc`.

### Task 5: Khung, đọc bộ, chờ tải, lỗi tải, chỉ xem

**Files:**
- Create: `soan-bo/use-bo-soan.ts`, `soan-bo/khung-soan-bo.tsx`, `soan-bo/tai-lieu-bo.tsx` (chỉ đọc ở task này),
  `apps/app/components/crm/record-sheet/soan-bo-sheet.tsx`
- Modify: `record-sheet-host.tsx` (nhánh `soan-bo`, `size="kara"`, truyền `cauNoiOkr`)
- Test: `apps/app/test/che-do-soan-bo-okr.dom.tsx` (ca `vk10-mo` phần «tải lại URL», `vk10-mo-do`, `vk10-tai` ô 1–2,
  `vk10-tai-do` vế tiêu đề, `vk10-quyen` ô 2–3, `vk10-quyen-do` vế chỉ xem)

**Interfaces:**
- Consumes: Task 1 (`docKhoaBo`, chữ), Task 3 (`VatPhamDock`, `Textarea`), Task 4.
- Produces:

```ts
export type QuyenSoan = { loai: "soan" } | { loai: "chi-xem"; lyDo: "khong-sua" | "ky-dong" | "bo-ca-nhan" };
export type MucTieuSoan = DongDs & { quyen: { congBo: boolean; guiDuyet: boolean; xoa: boolean } | null };
export type BoSoan =
  | { trang: "dang-tai"; ten: string | null }
  | { trang: "loi"; thuLai: () => void; ten: string | null }
  | { trang: "xong"; ten: string; khoa: { cycleId: string; don: DonChonOkr }; quyen: QuyenSoan;
      mucTieu: MucTieuSoan[]; nguoiMacDinh: string; thuLai: () => void };
export function useBoSoan(khoaBo: string): BoSoan;
export function SoanBoSheet({ khoaBo, cauNoi }: { khoaBo: string; cauNoi: boolean }): JSX.Element;
```

  `useBoSoan`: `ten` = «<tên đơn vị> · <tên chu kỳ>» từ `org.tree`/`okr.cycles` (có sớm, trước `danhSach`);
  `danhSach` gọi với `loc` rỗng (`locOkr` của URL trống); `quyen` = `chi-xem/bo-ca-nhan` khi `don.loai === "nguoi"`,
  `chi-xem/khong-sua` khi `!danhSach.canEdit`, `chi-xem/ky-dong` khi `!ghiDuocOPha(pha)`; `quyen` của từng mục tiêu nháp
  đọc bằng `useQueries(okr.objective)` (null khi chưa về). Bố cục: `≥ SOAN_BO.khoHaiThe` hai ô `[data-o=tai-lieu]`
  (`VatPhamDock`, `KaraDock side="fill"`) và `[data-o=cot-ben]` (`KaraDock side="rail"`); dưới đó `Tabs variant="line"`
  hai thẻ «Bộ OKR» · «Chất lượng và Kara» như `soan/khung-soan.tsx`. Chỉ xem: mọi ô `disabled`, không cột bên, không nút
  công bố, `PageShellNote`-kiểu câu lý do (`FieldDescription`). Chờ tải: `[data-cho-tai]` khung xương cùng hình dòng
  mục tiêu/KR, đầu khung còn tiêu đề và tên bộ. Lỗi: `VungTaiLoi` «Chưa mở được bộ OKR», nút gọi `thuLai` (refetch
  `danhSach`). Đọc `PhuThuocSoan.chonMucTieu`, `chiXemTheoQuyen`, `tieuDeKhiTai`.

- [ ] **Step 1: Viết ca** — `vk10-mo` (ma trận dữ liệu 3 mục tiêu nháp/công bố/chờ duyệt + 1 đã bỏ + ca bp có mục tiêu
  con): dựng URL `record=soan-bo:<khoa>`, khẳng định `[data-slot=sheet-content]` có «Soạn bộ OKR» và tên bộ, tham số
  `record` mang khoá, `[data-dong-mt]` đúng thứ tự `rows`, mỗi mục tiêu đủ `[data-dong-kr]`, có `[data-khoi=chat-luong]`
  và `[data-khoi=gop-y-kara]`. `vk10-mo-do`: khoá bộ của đơn vị khác → hàm kiểm ném «vk10-mo: tap muc tieu lech»;
  `phuThuoc.chonMucTieu` gộp `daBo` → «vk10-mo: da-bo hien». `vk10-tai` ô 1 (`danhSach` treo) và ô 2 (lỗi, Thử lại gọi
  thêm đúng 1 lần); `vk10-tai-do` vế `tieuDeKhiTai:false` → «vk10-tai: o1 lech». `vk10-quyen` ô 2–3: mọi ô `disabled`,
  không `[data-o=cot-ben]`, có câu lý do, bấm và gõ → `goiGhi().length === 0`; `vk10-quyen-do` `chiXemTheoQuyen:false`
  → «vk10-quyen: o2 lech».
- [ ] **Step 2: Đỏ** — `<DOM> -t "vk10-mo|vk10-tai|vk10-quyen"` → FAIL.
- [ ] **Step 3: Viết** `use-bo-soan.ts`, `khung-soan-bo.tsx`, `tai-lieu-bo.tsx` (đọc), `soan-bo-sheet.tsx`, nhánh host.
- [ ] **Step 4: Xanh** — lệnh step 2 PASS (các ô của task sau chưa viết thì chưa có); `bun run check-types` PASS.
- [ ] **Step 5: Commit** `feat(che-do-soan-bo-okr): khung Soạn bộ OKR — đọc bộ, chờ tải, lỗi tải, chỉ xem`.

### Task 6: Đường vào

**Files:**
- Create: `soan-bo/mo-soan-bo.ts`
- Modify: `okr/hop-chon-duong.tsx`, `okr/trang-thai-okr.tsx` (`Rong` thêm `soan?: ReactNode`),
  `okr/theo-don-vi/theo-don-vi.tsx`, `apps/app/lib/messages/okr.ts` (`chonDuong.duong.soan` vi/en)
- Test: `che-do-soan-bo-okr.dom.tsx` (ca `vk10-mo` ma trận 2 lối × {mở, tải lại}; `vk10-quyen` ô 1)

**Interfaces:**
- Consumes: `taoKhoaBo`, `useOpenRecord`, `useQuyenKhu`.
- Produces: `export function useMoSoanBo(q: Extract<QuyenKhu, {kieu:"xong"}>): { duoc: boolean; lyDo: string | null; mo: (mucTieuId?: string) => void }`
  trong tệp mới `soan-bo/mo-soan-bo.ts` — `duoc` = `q.canEdit` (hay `q.quanTri`) và
  `ghiDuocOPha(q.phaKy)` và `donViSoanCua(q.dich.don, q.cycleId) !== null`; `mo` = `openRecord({kind:"soan-bo", id: taoKhoaBo(q.cycleId, q.dich.don)})`
  và, khi có `mucTieuId`, đặt `SEARCH_PARAM.okr.soanMt`.
  Hộp: dòng `data-duong="soan"` đọc «Soạn cả bộ», không `KaraMark`, khoá theo `useMoSoanBo`, chọn → đóng hộp rồi `mo()`.
  `Rong` nhận nút `Button data-nut="soan-bo-okr"` «Soạn bộ OKR» khi `useMoSoanBo().duoc`.

- [ ] **Step 1: Viết ca** — `vk10-mo` bốn ô (hộp «Soạn cả bộ» · nút câu rỗng) × (mở · tải lại với URL đang có, dựng lại
  cây từ URL): khung đúng bộ. `vk10-quyen` ô 1: thành viên thường → dòng `data-duong="soan"` `aria-disabled`, không
  `[data-nut=soan-bo-okr]`.
- [ ] **Step 2: Đỏ** — `<DOM> -t "vk10-mo|vk10-quyen"` → FAIL ở ô mới.
- [ ] **Step 3: Viết** `mo-soan-bo.ts`, sửa hộp, `Rong`, `theo-don-vi.tsx`, chữ `okr.ts`.
- [ ] **Step 4: Xanh** — lệnh step 2 PASS; `cd apps/app && bun test ./test/messages-guard.spec.ts` PASS.
- [ ] **Step 5: Commit** `feat(che-do-soan-bo-okr): lối vào Soạn cả bộ từ hộp Thêm mục tiêu và câu rỗng`.

### Task 7: Viết mới bằng bàn phím và tự lưu

**Files:**
- Create: `soan-bo/use-luu-dong.ts`, `soan-bo/dong-muc-tieu.tsx`, `soan-bo/dong-kr.tsx`
- Modify: `soan-bo/tai-lieu-bo.tsx`
- Test: `che-do-soan-bo-okr.dom.tsx` (ca `vk10-viet`, `vk10-viet-do`)

**Interfaces:**
- Consumes: Task 4 (`kiemDongKr`, `suyKieuKr`, `nguoiPhuTrachMacDinh`), Task 5 (`BoSoan`).
- Produces:

```ts
export type KhoaDong = string;
export type TrangThaiLuu = { loai: "yen" } | { loai: "dang-luu" } | { loai: "chua-luu"; ly: string } | { loai: "loi"; cau: string };
export function useLuuDong(): {
  luu: (khoa: KhoaDong, viec: () => Promise<{ id: string }>) => void;
  trangThai: (khoa: KhoaDong) => TrangThaiLuu;
  coChuaLuu: boolean;
};
```

  Mỗi khoá dòng một lần gọi đang chạy; lần sau xếp hàng và chỉ giữ chữ mới nhất. `luu` gọi khi rời ô hay Enter
  (`luuKhi === "moi-phim"` của `PhuThuocSoan` lưu mỗi phím, chỉ dùng cho chiều đỏ). Dòng mục tiêu mới:
  `createObjective({ cycleId, unit: don, title, kind: "cam-ket", ownerUserId: nguoiMacDinh, participantIds: [], whyNow: "", hienThi: "cong-khai" })`.
  Dòng KR mới khi `kiemDongKr` là `du`: `createKeyResult({ objectiveId, title, kind, ownerUserId, startValue, targetValue, currentValue: startValue, unit, dueOn: null, weight: 1 })`.
  `chua-luu` hiện «Chưa lưu — <lý do>» trên dòng và không gọi. Phím: Enter ở tên mục tiêu → dòng KR mới focus; Tab:
  tên → khởi điểm → đích → đơn vị; Enter ở đơn vị → KR kế. Bộ trống: focus tự đặt ở dòng mục tiêu đầu khi khung mở.
  Ô người trên dòng KR (`OwnerCell`-kiểu chọn người của kho) và menu «Kiểu» (`DropdownMenu`, `KIEU_KR`) đổi mặc định.

- [ ] **Step 1: Viết ca `vk10-viet`** — bộ trống, chỉ `userEvent.keyboard`: tên mục tiêu, Enter, ba KR theo ma trận
  {(2 → 3,5 tỷ ₫), (10 → 4 ngày), (mốc, không số)}. Khẳng định: `createObjective` 1 lần, `unit`/`cycleId` của bộ,
  `kind:"cam-ket"`, `ownerUserId` = trưởng đơn vị; `createKeyResult` 3 lần, cùng `ownerUserId`, `kind` {`tang-toi`,
  `giam-xuong`, `moc`}, giá trị `3.5`. KR thứ tư bỏ trống đích, rời ô → «Chưa lưu — thiếu đích», vẫn 3 lần. Ma trận người
  3 ô {trưởng tự soạn → chính họ; quản trị soạn bộ phòng ban → trưởng phòng; bộ không trưởng → người soạn}. Ca Review
  Focus 3: `createKeyResult` treo, rời ô ba lần → 1 lần gọi, sau khi trả về đúng 1 `updateKeyResult` mang chữ mới nhất.
  Thông điệp «vk10-viet: <buoc> <gi> lech».
- [ ] **Step 2: Viết ca `vk10-viet-do`** — `suyKieu: () => "tang-toi"` → «vk10-viet: kr-2 kind lech»; `kiemDong` bỏ chặn
  thiếu đích → «vk10-viet: kr-4 goi khi thieu dich».
- [ ] **Step 3: Đỏ** — `<DOM> -t vk10-viet` → FAIL.
- [ ] **Step 4: Viết** hook và hai dòng.
- [ ] **Step 5: Xanh** — lệnh step 3 PASS; ca của Task 5–6 vẫn PASS (`<DOM>` cả tệp).
- [ ] **Step 6: Commit** `feat(che-do-soan-bo-okr): viết mục tiêu và KR bằng bàn phím, tự lưu nháp thật`.

### Task 8: Sửa, xoá, khoá theo trạng thái, lưu lỗi, hỏi khi đóng

**Files:**
- Modify: `soan-bo/dong-muc-tieu.tsx`, `soan-bo/dong-kr.tsx`, `soan-bo/use-luu-dong.ts`, `soan-bo/tai-lieu-bo.tsx`,
  `soan-bo/khung-soan-bo.tsx`
- Test: `che-do-soan-bo-okr.dom.tsx` (ca `vk10-sua`, `vk10-sua-do`, `vk10-tai` ô 3, `vk10-tai-do` vế lỗi lưu,
  `vk10-quyen` phần dòng chưa lưu, `vk10-quyen-do` vế đóng thẳng)

**Interfaces:**
- Consumes: `useKhaiThayDoi(loiHoi)` (`@crm/ui/components/giu-thay-doi`), `ConfirmDialog`, `cauLoiDong`-kiểu ánh xạ
  lỗi; chữ `crm.ts` «Ô này nhận số, ví dụ 1.234,5».
- Produces: dòng đã có id: rời ô với chữ khác chữ đã lưu → `updateObjective({id,title})` / `updateKeyResult({id, …chỉ trường đổi})`
  đúng một lần. Backspace ở đầu dòng KR trống của mục tiêu `nhap` → `removeKeyResult({id})`, focus dòng trên; mục tiêu
  `cong-bo`/`cho-duyet` không xoá. Menu «Xoá» mục tiêu khi `quyen.xoa` → `ConfirmDialog` → `xoaMucTieu({id})`. Mục tiêu
  `cong-bo`: ô tên bật, mọi ô số `disabled` khi `khoaSoCongBo`, câu «Số của mục tiêu đã công bố sửa ở ngăn KR».
  `cho-duyet`: mọi ô `disabled`. Lưu lỗi: dòng giữ chữ (`giuChuKhiLoiLuu`), câu lỗi theo kiểu ô, rời ô lần nữa lưu
  lại. Còn dòng `chua-luu`/`loi` → `useKhaiThayDoi({ tieuDe: «Bỏ dòng chưa lưu?», … })` khai `true` khi
  `hoiKhiDongChuaLuu`; lớp phủ không đóng, Esc và nút đóng hỏi.

- [ ] **Step 1: Viết ca** — `vk10-sua` bảy ô của E5 (1 sửa tên mục tiêu → `updateObjective` 1 lần; 2 sửa tên KR →
  `updateKeyResult` 1 lần; 3 Backspace → `removeKeyResult`, focus dòng trên; 4 Xoá → `ConfirmDialog` → `xoaMucTieu`;
  5 công bố: tên bật, số `disabled`, có câu; 6 chờ duyệt: mọi ô `disabled`; 7 đã bỏ không có `[data-dong-mt]`), cộng ca
  Review Focus 2 (`updateObjective` lỗi + đọc lại `cho-duyet`) và 4 (Backspace ở KR của mục tiêu công bố → 0 lần
  `removeKeyResult`). `vk10-sua-do`: `khoaSoCongBo:false` → «vk10-sua: o5 lech»; `luuKhi:"moi-phim"`, sửa tên hai lần
  trước khi rời ô → «vk10-sua: o1 lech». `vk10-tai` ô 3: `createKeyResult` trả lỗi sai kiểu số → dòng giữ chữ, câu từ
  `crmMessages` khớp chuỗi, rời ô lần nữa gọi lại đúng 1 lần; `vk10-tai-do` `giuChuKhiLoiLuu:false` → «vk10-tai: o3 lech».
  `vk10-quyen`: dòng chưa lưu → bấm lớp phủ: khung còn; Esc → hộp «Bỏ dòng chưa lưu?»; Huỷ → khung còn, dòng còn chữ;
  ca Review Focus 1: focus trong ô đích trống, Esc → hộp mở. `vk10-quyen-do` `hoiKhiDongChuaLuu:false` →
  «vk10-quyen: dong khong hoi».
- [ ] **Step 2: Đỏ** — `<DOM> -t "vk10-sua|vk10-tai|vk10-quyen"` → FAIL ở ô mới.
- [ ] **Step 3: Viết**.
- [ ] **Step 4: Xanh** — `<DOM>` cả tệp PASS.
- [ ] **Step 5: Commit** `feat(che-do-soan-bo-okr): sửa, xoá, khoá theo trạng thái, giữ chữ khi lưu lỗi, hỏi khi đóng`.

### Task 9: Khối Chất lượng

**Files:**
- Create: `soan-bo/khoi-chat-luong.tsx`
- Modify: `soan-bo/khung-soan-bo.tsx` (đặt khối trên cột bên), `soan-bo/tai-lieu-bo.tsx` (xuất trạng thái tài liệu)
- Test: `che-do-soan-bo-okr.dom.tsx` (ca `vk10-chat-luong`, `vk10-chat-luong-do`)

**Interfaces:**
- Consumes: `chamBo` qua `usePhuThuocSoan().chamBo`; nội dung đang hiện của tài liệu (chữ trong ô, không chỉ dữ liệu đã
  lưu) dưới dạng `MucTieuCham[]` với `ownerUserId` của từng dòng.
- Produces: `KhoiChatLuong({ bo, denDong }: { bo: MucTieuCham[]; denDong: (mucTieu: number, kr: number | null, truong: "title" | "startValue" | "targetValue" | "nguoi") => void })`
  — `[data-khoi=chat-luong]`, `SectionHeading` «Chất lượng», «N trên M điểm đạt», `Progress`, mỗi lỗi một `Item`
  `[data-diem-con]` nêu tên luật và tên dòng (`translate="no"`), nút «Đến dòng» đặt focus đúng ô. Không `KaraMark`.
  Bộ trống: «Gõ mục tiêu đầu tiên để máy chấm». Không gọi máy chủ.

- [ ] **Step 1: Viết ca** — `vk10-chat-luong` theo E7 (chữ bằng `chamBo` gọi thật trong bài; gõ sửa tên KR → chữ đổi
  trong cùng lượt dựng, số lời gọi tRPC không đổi; mỗi lỗi một `[data-diem-con]`; «Đến dòng» → `document.activeElement`
  là ô tên của đúng KR; không `[data-slot=kara-mark]` trong khối; nút «Công bố 1 mục tiêu» bật dù N < M).
  `vk10-chat-luong-do`: `chamBo: () => hằng` → «vk10-chat-luong: khong cap nhat»; `denDong` trỏ ô đầu → «vk10-chat-luong:
  den dong sai o» (lật bằng tham số `denDong` của bài).
- [ ] **Step 2: Đỏ** — `<DOM> -t vk10-chat-luong` → FAIL.
- [ ] **Step 3: Viết**.
- [ ] **Step 4: Xanh** — `<DOM>` cả tệp PASS.
- [ ] **Step 5: Commit** `feat(che-do-soan-bo-okr): khối Chất lượng chấm theo từng lần gõ`.

### Task 10: Khối góp ý Kara

**Files:**
- Create: `soan-bo/khoi-gop-y.tsx`
- Modify: `soan-bo/khung-soan-bo.tsx`, `soan-bo/tai-lieu-bo.tsx` (chữ đã nhận + dấu «đổi theo Kara»; lối «Nhờ Kara soạn
  nháp» khi bộ trống qua `useDuongSoan`)
- Test: `che-do-soan-bo-okr.dom.tsx` (ca `vk10-gop-y`, `vk10-gop-y-do`)

**Interfaces:**
- Consumes: `useGopYMucTieu` (`okr/gop-y-kara.ts`, không sửa), thẻ đề xuất có sẵn của `okr/nhom-kara.tsx`,
  `KaraProposalGroup`, `KaraState`, `KaraTrace` (`@crm/ui/components/kara`), `useDuongSoan`.
- Produces: `KhoiGopY({ mucTieu, docLai }: { mucTieu: MucTieuSoan[]; docLai: (id: string, chu: { truong: string; giaTri: string } | null) => void })`
  — một con `GopYMucTieuSoan` mỗi mục tiêu gọi `useGopYMucTieu` và đăng ký `nho` vào sổ của khối; nút «Nhờ Kara đọc bộ»
  gọi `nho` của mọi mục tiêu (`troLyDeXuat` mỗi mục tiêu một lần); lúc `ban` → `KaraState kind="working"` «Kara đang đọc
  bộ OKR này…»; thẻ chờ của mọi mục tiêu nằm trong **một** `KaraProposalGroup` (nhãn Kara một lần); nhận → `quyet`
  (`troLyQuyet`), `docLai(dongId, giaTri)` để tài liệu đổi chữ ngay và hiện `KaraTrace` «đổi theo Kara» (khi
  `docLaiSauNhan`), thẻ thành biên nhận có Hoàn tác (`hoanTac` của hook → `updateKeyResult` chữ cũ). Kara tắt/hết lượt/
  lỗi: `KaraState` theo `tat`/`noiDung`; khối Chất lượng vẫn hiện (`chatLuongKhiKaraTat`).

- [ ] **Step 1: Viết ca** theo E8 (hai mục tiêu, `troLyDeXuat` đúng 2 lần với hai `objectiveId`; chờ có câu đang đọc; hai
  đề xuất → một nhóm, một nhãn Kara, hai thẻ; «Thay câu» → `troLyQuyet` `cach:"nhan"`; dòng KR đổi chữ, có dấu; Hoàn tác
  → `updateKeyResult` chữ cũ, dòng về chữ cũ; ma trận {tắt, hết lượt, lỗi} → đúng `KaraState`, còn «N trên M»).
  `vk10-gop-y-do`: `docLaiSauNhan:false` → «vk10-gop-y: dong khong doi»; `chatLuongKhiKaraTat:"an"` → «vk10-gop-y: tat an
  chat luong».
- [ ] **Step 2: Đỏ** — `<DOM> -t vk10-gop-y` → FAIL.
- [ ] **Step 3: Viết**.
- [ ] **Step 4: Xanh** — `<DOM>` cả tệp PASS.
- [ ] **Step 5: Commit** `feat(che-do-soan-bo-okr): góp ý Kara ở cột bên, nhận đổi dòng ngay, hoàn tác`.

### Task 11: Công bố

**Files:**
- Create: `soan-bo/cong-bo.tsx`
- Modify: `soan-bo/tai-lieu-bo.tsx` (chân tài liệu), `soan-bo/khung-soan-bo.tsx`
- Test: `che-do-soan-bo-okr.dom.tsx` (ca `vk10-cong-bo`, `vk10-cong-bo-do`)

**Interfaces:**
- Consumes: `MucTieuSoan.quyen` (Task 5), `demCongBo`, `ConfirmDialog`, `Checkbox`, `okrMessages().sheet.hoiCongBo.body`.
- Produces: `CongBo({ mucTieu, veTheoDoi }: { mucTieu: MucTieuSoan[]; veTheoDoi: () => void })` — nút chính duy nhất
  `data-nut="cong-bo-bo"`: «Công bố N mục tiêu» (N = `demCongBo`), «Gửi duyệt N mục tiêu» khi mọi mục được đếm có
  `quyen.guiDuyet`, «Công bố» khoá khi N = 0. Hộp `ConfirmDialog`: liệt N mục tiêu, mỗi mục `Checkbox` đã tích, câu khoá
  khởi điểm, nút xác nhận đếm số mục đang tích; mục nháp chưa có KR được gọi tên dưới câu «ở lại Nháp». Xác nhận: lần lượt
  `publishObjective({id})` (hay `guiDuyet({id})`) cho mục được tích (`goiTheoOTich`); lỗi một mục không đổi kết quả mục
  khác (`giuKetQuaKhiLoi`), tên mục lỗi kèm «Thử lại» gọi lại riêng id ấy. Xong: biên nhận «Đã công bố N mục tiêu» và
  nút «Về màn theo dõi» (đóng khung).

- [ ] **Step 1: Viết ca** năm ô của E10 (1, 1b, 2, 3, 4) — dữ liệu: nháp đủ KR do người soạn vừa gõ trong lượt, nháp đủ
  KR có sẵn người tạo khác, nháp chưa KR, một công bố. `vk10-cong-bo-do`: `demCongBo` gồm mục chưa KR → «vk10-cong-bo:
  o1 lech»; `goiTheoOTich:false` → «vk10-cong-bo: o1b lech»; `giuKetQuaKhiLoi:false` → «vk10-cong-bo: o3 lech».
- [ ] **Step 2: Đỏ** — `<DOM> -t vk10-cong-bo` → FAIL.
- [ ] **Step 3: Viết**.
- [ ] **Step 4: Xanh** — `<DOM>` cả tệp PASS.
- [ ] **Step 5: Commit** `feat(che-do-soan-bo-okr): công bố từ chế độ Soạn với ô tích từng mục tiêu`.

### Task 12: Ngăn theo dõi một chip

**Files:**
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx` (`TabKr`: bỏ `VungKara`, mọi `DeXuatNeo` kể cả
  nhóm `viSao`, bỏ `diemKara.duoiKr`; giữ `useGopYMucTieu` cho `coHoiDoiTrong`, `KaraTrace`), `okr/chip-gop-y.tsx`
  (thêm `ChipGopYKhung`), `soan-bo/tai-lieu-bo.tsx` (cuộn tới `soanMt`, xoá tham số sau khi cuộn)
- Test: `che-do-soan-bo-okr.dom.tsx` (ca `vk10-ngan`, `vk10-ngan-do`)

**Interfaces:**
- Produces: `ChipGopYKhung({ mt }: { mt: { id: string; soGopYCho: number; cycleId: string; donChon: DonChonOkr } })` —
  `Badge` + `KaraMark scope={m.chip(N)}` («Kara · N góp ý»), `data-chip-gop-y`, `null` khi N = 0; bấm →
  `useMoSoanBo`-kiểu mở `soan-bo` với khoá bộ chứa mục tiêu và `soanMt = mt.id`. Đặt ở đầu khung (`note` của
  `RecordSheetFrame`). `donChon` suy từ `level`/`unitId` của `okr.objective`. `VungKara`, `DeXuatNeo` vẫn xuất ở
  `nhom-kara.tsx` (bài của hồ sơ đã ký dựng chúng trực tiếp). `neoGopY` của chip dòng danh sách cuộn tới chip đầu khung.

- [ ] **Step 1: Viết ca `vk10-ngan`** — `ObjectiveSheet` thẻ KR, ma trận N ∈ {0, 1, 3}: không `[data-vung-kara]`, không
  `[data-de-xuat-neo]`, số `[data-okr-sheet] [data-chip-gop-y]` = 0 khi N = 0, 1 khi N > 0, chữ chứa N; bấm chip → URL có
  `record` kết thúc bằng `soan-bo:<khoa bộ chứa mục tiêu>` và `soanMt=<id>`. `vk10-ngan-do`: khung dựng với
  `diemCam.duoiKr` chèn `<div data-vung-kara />` (tham số có sẵn của khung) → «vk10-ngan: n=3 vung con»; chip dựng với
  N = 0 qua prop thử của bài (`soGopYCho` ép 1 cho thẻ hiện) → «vk10-ngan: n=0 chip».
- [ ] **Step 2: Đỏ** — `<DOM> -t vk10-ngan` → FAIL.
- [ ] **Step 3: Viết**.
- [ ] **Step 4: Xanh** — `<DOM>` cả tệp PASS; `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-sheet.dom.tsx` chạy và ghi lại ô đỏ (đưa vào Task 15).
- [ ] **Step 5: Commit** `feat(che-do-soan-bo-okr): ngăn theo dõi chỉ còn chip góp ý mở chế độ Soạn`.

### Task 13: Bàn đo màn

**Files:**
- Create: `_acceptance/che-do-soan-bo-okr/rang/man-soan.mjs` (vào lệnh, chọn `EVAL`), `man-soan-du-lieu.mjs` (dựng dữ
  liệu qua đường ghi thật: `apps/api` service/tRPC; gieo đề xuất theo khuôn `_acceptance/kara-gop-y-luot-2/rang/gieo.mjs`
  chép vào đây, không import chéo), `man-soan-do.mjs` (các phép đo), `man-soan-chieu-do.mjs` (bản sao theo khuôn
  `_acceptance/trang-bo-okr/rang/man-bo-okr-chieu-do.mjs`)

**Interfaces:**
- Khuôn: `_acceptance/trang-bo-okr/rang/man-bo-okr.mjs` (kiểm `isMeasureDatabase`, `canhCay`, `MOI_EVAL`, `ket`, `khongDo`).
  `EVAL` nhận `E2,E4,E9,E11,E13,E16,E20` và `chieu-do-mo|chieu-do-viet|chieu-do-hoan-tac|chieu-do-bam|chieu-do-ngan|chieu-do-tran|chieu-do-xoa`.
- In đúng các dòng của evals: «MO: <n> muc tieu = API · tai lai giu», «VIET: 1 muc tieu nhap · 3 KR khop · tai lai giu»,
  «GOP Y: nhan → moi · hoan tac → cu», «BAM <n>» + «CONG BO: cong-bo · 3 KR», «NGAN vung <a> neo <b> chip <c>» (đếm trong
  `[data-okr-sheet]`), «KHO 1280: hai o · KHO 375: hai the · khong tran», «ANH 10/10», «XOA MT: vang · SUA KR CONG BO: ten
  moi, so giu · XOA KR: vang»; sai in «SAI AC-n: …» mã 1. Mười ảnh vào `_acceptance/che-do-soan-bo-okr/evidence/` đúng
  tên E16. Mỗi khổ một phiên trình duyệt; cuộn bằng con lăn; đếm bấm bằng `pointerdown` ở `window`.
- [ ] **Step 1: Viết bốn tệp** (song song được với T5–T12).
- [ ] **Step 2 (sau T12): Chạy chiều đỏ** — với mỗi `EVAL=chieu-do-*` → mã 1 và dòng ghim đúng regex của evals.
- [ ] **Step 3: Chạy xanh** — `EVAL= <vk10_man>` → mã 0, đủ dòng khẳng định.
- [ ] **Step 4: Commit** `test(che-do-soan-bo-okr): bàn đo màn chế độ Soạn, mười ảnh, hai chiều`.

### Task 14: Sàn thiết kế

**Files:** Create `_acceptance/che-do-soan-bo-okr/rang/san-thiet-ke.mjs` (khuôn `_acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca thiet-ke`).

- Chạy `design-gate.mjs --mode static` (đường giải như khoá `design.gate`) trên mọi `git ls-files` `.tsx` của
  `okr/soan-bo/` và `objective-sheet.tsx`: 0 P0 → in tên tệp; rồi bản sao một tệp thêm mã màu hex vào `className`: phải
  P0 và mã khác 0, in tên luật màu. Mã 0 chỉ khi cả hai vế đúng.
- [ ] **Step 1: Viết**. **Step 2 (sau T12):** `bun _acceptance/che-do-soan-bo-okr/rang/san-thiet-ke.mjs` → mã 0.
  **Step 3: Commit** `test(che-do-soan-bo-okr): sàn thiết kế hai chiều`.

### Task 15: Giữ hồ sơ đã ký (AC-11)

**Files:**
- Create: `_acceptance/che-do-soan-bo-okr/rang/khong-doi-hinh.mjs` (khuôn `_acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs`
  và `giu-ho-so.mjs` của VK7), `rang/anh-xa-nghi.json`
- Modify (chỉ khi đo thấy đỏ do vòng này): thước và bài của 12 hồ sơ trong danh sách AC-11 — `evals.yaml` (thêm
  `superseded_by: che-do-soan-bo-okr#AC-7` cho ô đo khối Kara cũ), tệp thước `rang/**` và bài `apps/app/test/**`
  (chỉ đổi chuỗi bộ chọn hay chuỗi chữ), và `decisions.jsonl` của hồ sơ ấy (một dòng `fix` mang `decided_by` chủ kho,
  dẫn d-20261022T022444Z-12 Hỏi-6, kèm cặp đo hai chiều).

- [ ] **Step 1 (cổng chặn): đo quét trước khi sửa gì** — chạy bước (0) của `khong-doi-hinh.mjs` (mẫu chép nguyên từ E19).
  Đo của S2 (25/10, grep thô trên `rang/**` và `evals.yaml` của hồ sơ đã ký) thấy mẫu khớp cả hồ sơ ngoài danh sách
  (`dieu-huong-khu-muc-tieu`, `khung-okr-truoc-r1`, `okr-soat-anh-luot-3`, `trang-don-vi-mot-bang` qua
  `data-nhom-soan`/«Thêm mục tiêu»; thêm `dat-okr-trong-crm`, `khung-tao-okr-nhu-deal`, `okr-loai-hoc-tap`,
  `soan-okr-trang-rieng` nếu tính chữ trong `evals.yaml`), trong khi `gop-y-dung-cho`, `nen-kara`, `muc-tieu-va-kr`,
  `soan-okr-cung-tro-ly`, `khung-soan-chan-lien-ket` không khớp chữ mẫu trong `rang/`/`evals.yaml`. Nếu bước (0) cho
  «QUET n ≠ 12»: dừng, đưa danh sách lên phiên giám sát cho chủ kho quyết (đổi phạm vi quét hay danh sách là đổi hợp
  đồng — không tự đổi).
- [ ] **Step 2: Viết bước (1)–(3) và `--chieu-do`** đúng E19; chạy chiều đỏ → hai dòng ghim, mã 1.
- [ ] **Step 3: Chạy trên cây và trên worktree `origin/onehub`** — mọi ô không `not-run`; ghi «GIU»/«DO SAN TREN NEN»/«SAI».
- [ ] **Step 4: Với mỗi ô SAI do vòng này** — đổi bộ chọn/chuỗi hay khai `superseded_by` + dòng trong `anh-xa-nghi.json`,
  thêm dòng sổ `fix` của hồ sơ ấy, đo hai chiều; chạy lại step 3 tới khi không còn SAI.
- [ ] **Step 5: Commit** `test(che-do-soan-bo-okr): giữ hồ sơ đã ký — đổi thước theo AC-11, sổ fix từng hồ sơ`.

### Task 16: Năm lệnh chứng và lượt evals đủ

- [ ] `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` — cả năm mã 0.
- [ ] Chạy đủ khoá `vk10_*` một lượt (E1–E20 trừ E17 là ui-check của S4); so ảnh với `evidence/design-pass/` theo năm chỗ
  lệch của Notes.
- [ ] Commit nếu còn sửa: `chore(che-do-soan-bo-okr): năm lệnh chứng xanh`.

---

## Hợp đồng chỗ khó làm đúng chữ (S3 không tự đổi, đưa lên phiên giám sát)

1. **E19 bước (0)** — xem Task 15 step 1: mẫu quét chữ thô khớp hồ sơ ngoài 12, và năm hồ sơ trong danh sách không khớp
   chữ mẫu ở `rang/`/`evals.yaml`; «QUET n = DANH SACH 12» chưa đạt được nếu không định nghĩa lại phạm vi quét.
2. **E12 chiều đỏ «VungKara còn bật (tham số thử của khung)»** — sau vòng này khung không còn đường dựng `VungKara`; kế
   hoạch lật bằng tham số có sẵn `diemCam.duoiKr` của `ObjectiveSheet` chèn `[data-vung-kara]`, không giữ mã chết sau cờ.
3. **E11 «BAM ≤ 3»** — đạt được chỉ khi dòng mục tiêu đầu tự nhận focus lúc khung mở ở bộ trống (Task 7); nếu
   `onOpenAutoFocus` của `DetailSheet` đưa focus về khung, cần đặt focus sau khi khung mở.
