# Kế hoạch — ve-khung-muc-tieu-dung-kr (HT6)

Ba việc nối tiếp; việc sau dùng chữ ký của việc trước, không việc nào chạy song song.

| # | Việc | Tệp | Kiểm từng việc | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | `thayDinh(ref, duoi?)`: có `duoi` thì ghi `[...stack.slice(0,-2) bỏ bản trùng của duoi, duoi, ref]` trong một lần `write(…, "replace")` | `apps/app/components/crm/record-sheet/record-stack.ts` | `bun run check-types --filter=app` | E1–E5 | false |
| 2 | `useThuTuHopTuan` trả `DongThuTu[]` (`{ keyResultId, objectiveId }`) thay vì `string[]` | `apps/app/components/crm/record-sheet/thu-tu-hop-tuan.ts` | như trên | E1–E5 | false |
| 3 | `DauNganHanhDong.sang`: theo thứ tự bảng gọi `thayDinh(kr đích, objective của kr đích)`; đếm và nút dùng `ds` rút từ dòng | `apps/app/components/crm/record-sheet/kr-sheet.tsx` | năm lệnh `vkm_*` xanh; `httb_sang`, `httb_nguon`, `httb_sau_gui`, `httb_chu` xanh | E1–E6 | false |
