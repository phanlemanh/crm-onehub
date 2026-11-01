# Răng giữ khung ngăn (BK2 · `rang-giu-khung-ngan`)

Hàng BK2 của `docs/plan/lo-trinh-okr.json`, đợt `ban-do-khuon-3010`, dãy K, đứng trên BK1 (#611, onehub `b65feb175`).
Gộp BK4 (một dòng màn mẫu trong `docs/proto.md`). Ô cơ hội ký `build` ngày 31/10.

## Vấn đề, đo trên cây `b65feb175`

BK1 đưa bảy ngăn vào `RecordSheetFrame` và ghi khuôn `design/patterns/ngan-ban-ghi.md`. Không bài nào của kho đỏ khi một
ngăn mới thoát khung: răng của BK1 nằm trong hồ sơ (`_acceptance/khung-chung-ngan-ban-ghi/rang/quet-ngan.mjs`), không
chạy trong `bun run test` hay `bun run lint:slop`, và danh sách khối cấm viết cứng trong răng.

Trong `apps/app/components/crm/record-sheet/` (đo bằng `grep` nhập):

| Khối | Tệp nhập (ngoài `record-parts.tsx`) |
| --- | --- |
| `DetailSheetHeader` | 0 |
| `Spinner` | company-plans, khoi-cap-nhat-kr, kr-bang-chung, objective-duyet, objective-hien-thi, objective-trao-doi, quick-add |
| `Skeleton` | contact-plans, kr-sheet, kr-viec, lich-su-kr, objective-dien-bien, objective-trao-doi, so-kr-sheet |
| `VungTaiLoi` | contact-plans, lich-su-kr, plan-steps |
| `Dialog` (họ `Dialog…`) | kr-bang-chung, objective-duyet, objective-hien-thi |
| `Sheet` (họ `Sheet…`) | 0 |

Mọi chỗ này nằm trong một **mục** của thân ngăn đã tải (chờ tải hay lỗi tải của Lịch sử, Bước, Kế hoạch…), trên một
**nút đang chạy**, hoặc là **hộp nhỏ** chọn danh sách hay lý do mà `docs/design.md` mục «Ghi vào bản ghi» cho phép. Không
chỗ nào là trạng thái của chính ngăn — BK1 đã đưa trạng thái ngăn vào khung.

## Thiết kế

Ba lớp, một nguồn: frontmatter của `design/patterns/ngan-ban-ghi.md`.

1. **Khuôn là nguồn.** `cam_ngoai_khuon` thêm `Sheet`, `Dialog` (tiêu chí cộng 31/10). Khoá mới `cam_ho: [Sheet, Dialog]`
   nói khối nào cấm cả **họ**: tên bắt đầu bằng tên khối rồi một chữ hoa (`DialogContent`, `SheetTitle`) — dựng thô là
   ghép các mảnh ấy. Khối không có trong `cam_ho` chỉ cấm đúng tên (`SkeletonRow` không bị bắt). `ConfirmDialog`,
   `PickListDialog`, `DetailSheetSection` không thuộc họ nào. Khoá mới `thay_cho` ghi thành phần thay cho từng khối
   (`DetailSheetHeader: RecordSheetFrame`, `Spinner: ChoTaiNgan`, …); khối thiếu dòng `thay_cho` thì bộ đọc ném lỗi gọi
   tên khối. `ngoai_le` liệt mọi tệp đo ở trên, **một dòng một tệp** (`khoi` là một tên hay danh sách), mỗi dòng có
   `ly_do`: 14 dòng, 20 cặp (tệp, khối). Dòng `DetailSheetEmpty` của `so-kr-sheet.tsx` bỏ vì khối ấy không cấm.
2. **Bộ đọc chung** `tools/oxlint/onehub/shared/doc-khuon-ngan.ts`: đọc frontmatter (tập con YAML mà khuôn dùng — danh
   sách `[a, b]`, khoá lồng một cấp, danh sách bản ghi `- tep:`), trả kiểu đã kiểm; khuôn sai hình thì ném lỗi gọi tên
   khoá. Luật lint và bài quét cùng gọi nó.
3. **Luật oxlint** `onehub/ngan-trong-khung` (`tools/oxlint/onehub/rules/ngan-trong-khung.ts`), bật trong
   `.oxlintrc.json` cho glob `apps/app/components/crm/record-sheet/**`. Với mỗi `ImportDeclaration`, mỗi tên nhập thuộc
   một tên cấm hay họ của nó thì báo, trừ khi tệp là `khuon.nhap` hoặc cặp (tệp, khối) có dòng `ngoai_le` mang `ly_do`
   khác rỗng. Thông điệp: tệp, khối, thành phần thay (`RecordSheetFrame` cho đầu ngăn, `ChoTaiNgan` cho chờ tải,
   `KhungTaiLoi` cho lỗi tải, khối soạn trong ngăn hay `ConfirmDialog`/`PickListDialog` cho hộp), và đường khai ngoại lệ.
   Thành phần thay đọc từ `thay_cho`. Không danh sách nào nằm trong mã luật.
4. **Bài quét** `apps/app/test/khung-ngan.spec.ts` trên `apps/app/test/lib/quet-jsx.ts`, chạy trong `bun run test` của
   app:
   - mọi `kind` mà `record-sheet-host.tsx` đăng ký ↔ `nhan_dien.kind` của khuôn, hai chiều, cùng số với `doi_tuong`;
   - tệp của từng ngăn suy từ host (nhánh `kind === "…"` → thẻ JSX → câu nhập) — gốc JSX của thành phần ngăn là
     `RecordSheetFrame`, hoặc một thành phần cùng tệp mà gốc là `KhungNgan`;
   - `ngoai_le`: tệp có thật, khối thuộc `cam_ngoai_khuon`, `ly_do` khác rỗng, và tệp còn nhập khối ấy (không thì
     «ngoại lệ thừa»);
   - `docs/proto.md` có dòng màn mẫu trỏ `mau_dang_chay.tep` và đường khuôn.
   Bài nhận một bộ đọc tệp tiêm vào (`DocTep`), nên ca đỏ chạy trên bản ghi trong bộ nhớ.
5. **BK4.** `docs/proto.md` thêm mục «Màn mẫu của một khuôn»: vòng chạm ngăn bản ghi đặt ảnh ngăn mới cạnh ngăn deal
   (`mau_dang_chay` của khuôn) trong gói design-pass.

## Hai chiều (luật 34 của đợt)

Răng `_acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs` chạy đúng lệnh của script `lint:slop` trong `package.json`
(đọc từ tệp, không chép tay) trên bản sao tạm gồm
`.oxlintrc.json`, `tools/oxlint`, `design/patterns`, `apps/app/components/crm/record-sheet` và tệp tiêm:

- chiều đỏ: tiêm nhập từng khối của ma trận sáu khối (+ một tên họ của `Sheet` và `Dialog`) vào một ngăn → đỏ, thông
  điệp ghim tệp và khối;
- đối chứng cùng hình: `ConfirmDialog`, `PickListDialog`, `DetailSheetSection` → im;
- danh sách đọc từ khuôn: thêm một tên vào `cam_ngoai_khuon` trên bản sao → nó đỏ; bỏ `Spinner` → im;
- miễn khung đọc từ `khuon.nhap`: đổi `khuon.nhap` sang tệp khác → `record-parts.tsx` đỏ, tệp mới im;
- ngoại lệ: xoá `ly_do` của một dòng → tệp ấy đỏ;
- chiều im: cùng câu nhập trong `docs/`, `_acceptance/`, và `apps/app/components/` ngoài `record-sheet/` → không dòng
  `ngan-trong-khung` nào;
- đối chứng dương: `bun run lint:slop` trên cây thật → không dòng `ngan-trong-khung` nào.

Bài quét có ca so bộ đọc tự viết với `Bun.YAML.parse` trên khuôn thật (khứ hồi), và ca khuôn viết danh sách dạng khối
(`- Spinner`) → bộ đọc ném lỗi gọi tên khoá. Bản ghi tiêm vào các ca đỏ dựng bằng cách sửa chữ đọc từ tệp thật, không
viết tay. Ca «bài chạy trong `bun test` của app» chạy `bun test -t proto-mau` trong `apps/app` (cùng lệnh `bun test`
của script `test`) và tìm tên tệp bài trong đầu ra.

## Lựa chọn và căn cứ

- Cấm theo thư mục chứ không theo bảy tệp ngăn: ghi chú của hàng nói «trong components/crm/record-sheet/ trừ tệp khung».
  Giá: 12 tệp mục con vào `ngoai_le` (mỗi tệp một dòng, cộng hai dòng có sẵn của `kr-sheet.tsx`, `so-kr-sheet.tsx`); tệp mục mới cần `Spinner` trên nút phải thêm một dòng.
- Một bộ đọc cho lint và test: ghi chú của hàng nói «danh sách cấm đọc từ design/patterns/ngan-ban-ghi.md».
- Bộ đọc YAML tự viết (tập con), không thêm gói `yaml`: kho không có gói YAML cho Node; luật oxlint chạy trong Node.
- Họ khai trong khuôn (`cam_ho`), không phải luật tiền tố trong mã cho mọi khối: danh sách cấm đọc từ khuôn, và
  `SkeletonRow` tương lai không bị cấm oan (gap-probe P0-2).
- Bỏ design-pass: vòng không đổi màn nào.

## Ngoài vòng

- Sửa nợ (dời `Dialog` thô của ba tệp sang khối soạn hay `PickListDialog`): bảng chặn nợ mới, không dọn nợ cũ.
- Răng chặn ngăn mở `Sheet` chồng lên ngăn (quan hệ giữa hai tệp).
- Luật cho tầng trang (`VungTaiLoi` ở trang) — BK3, BK5.

## Ghim lại

Vòng chạm `design/patterns/ngan-ban-ghi.md` (trong `paths` của BK1 E2) và `.oxlintrc.json`, `tools/oxlint/onehub/**`
(trong `paths` của hồ sơ `khong-re-theo-ten-thanh-luat-kho`). Cuối vòng chạy `pre-merge-check` và ghim lại hồ sơ nào lưới
gọi tên, trong cùng PR.
