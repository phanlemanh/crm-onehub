# Vá paths chết của chín hồ sơ đã ký — thiết kế (F38)

Hàng F38 của `docs/plan/lo-trinh-okr.json`, đợt `don-dep-3110`, dãy D của `ban-do-khuon-3010`. Hồ sơ
`_acceptance/paths-chet-chin-ho-so/`.

## Vấn đề

Bộ lọc hoá cũ theo `paths` (`staleByPaths`, `lib/evidence-core.cjs` của kit) chỉ lọc khi MỌI mục `paths` của hồ sơ
trỏ tới tệp có thật trên cây git. Một mục chết → bộ lọc tắt → mọi PR làm hồ sơ hoá cũ → lưới đòi ghim lại.

Đo 31/10 trên `onehub` ed4e85288 bằng `rang/chet.mjs` (dùng `phanLoaiMucPaths` của kit): 9 hồ sơ, 25 mục chết, 10 đường.

## Phát hiện: phần lớn là tệp đã xoá, không phải đổi tên

| Loại | Đường | Hồ sơ · eval | Cách sửa |
|---|---|---|---|
| Xoá, eval đã nghỉ | `okr/cay-can-chinh.tsx`, `test/cay-can-chinh-ly-do.dom.tsx` | cay-can-chinh-co-ly-do E3–E8, E10, E11 | gỡ mục |
| Xoá, eval đã nghỉ | `test/gop-y-dung-cho-k3c.dom.tsx` | quyet-gop-y-noi-dung-ly-do E3–E5 | gỡ mục |
| Chưa từng có, eval đã nghỉ | `lib/okr-search-params.ts` | kara-gop-y-luot-2 E13 | gỡ mục |
| Xoá, có tệp thay | `okr/hop-thoai-cap-nhat-kr.tsx` | ngan-kr-mot-cho E5, E9 | thay bằng `record-sheet/khoi-cap-nhat-kr.tsx` |
| Dời thư mục | `okr/suc-khoe/**` | toan-canh-okr E21 | thay bằng `okr/toan-canh/suc-khoe/**` |
| Glob không khớp | `lib/thong-bao*.ts` | cho-tac-nhan-lau E5 | thay bằng `lib/thong-bao/**` |
| Xoá, mục khác đã phủ | `agent-okr/agent/instructions.md` | hoi-dap-okr E11 | gỡ mục (`instructions/**` đã có) |
| Chưa từng có | `validation/src/goi-y-ke-hoach.ts` | goi-y-mo-ke-hoach E3 | gỡ mục |
| Sai gói | `db/src/okr-can-chinh.ts` | tro-ly-okr-nen E21 | thay bằng `validation/src/okr-can-chinh.ts` (thước E21 đọc export ấy) |
| Eval thiếu paths | (không có) | goi-y-mo-ke-hoach E9, hoi-dap-okr E9j | Hỏi-1: khai paths = inputs hội đồng đọc |

Căn cứ từng dòng (commit xoá, import của bài kiểm) ở `rang/bang-sua.json`.

## Lựa chọn

- **Eval đã nghỉ: gỡ mục, không thay.** Kit bỏ qua eval `status: not-run` không có `paths` (`staleByPaths`, nhánh
  `normaliseEvalStatus(e.status) !== EVAL_STATUS_NOT_RUN`). Eval đã nghỉ không đo vật nào; thay đường cho nó là bịa vật.
  Danh sách `paths` gỡ hết thì xoá cả dòng `paths:`, không để `[]`.
- **Gỡ mục ở eval đang chạy chỉ khi lệnh của eval không đọc tệp ấy** (goi-y E3: bài kiểm không nhắc; hoi-dap E11:
  bài kiểm chỉ khẳng định tệp không còn). Đọc thì thay (tro-ly E21).
- **Tệp thay chọn theo import của bài kiểm** mà eval chạy (`ngan-kr-mot-cho.dom.tsx`, `cho-tac-nhan-lau-chuong.dom.tsx`).
- **Chỉ dòng `paths:` đổi** (luật 39 của đợt). Bước chạy cũ của toan-canh-okr E21 vẫn mở `/okr/suc-khoe` — ngoài phạm vi.
- **Sổ hỏng của gom-tin-hieu-tu-chay**: bỏ một dấu `}` thừa ở dòng 20–23 (lỗi ô `target` tự đóng ngoặc), không đổi chữ.

## Đo

- E1 quét mục chết; E2, E3 đo hai chiều bằng chính `staleByPaths`; E4 đối chiếu bảng sửa; E5 chứng chỉ dòng `paths:`
  đổi; E6 chứng sổ chỉ đổi dấu thừa; E7 đọc lượt ghim lại sau F37.
- Mọi thước nạp hàm của kit qua `scripts/resolve-plugin.mjs`, không chép luật, và có đối chứng dương cùng lượt.
