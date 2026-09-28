# Đo CI trước/sau — lai-ra-man-tran-gio (AC-5)

Mọi số dưới đây đọc từ log của runner GitHub, lấy bằng
`gh run view <run_id> --repo phanlemanh/crm-onehub --attempt <n> --log`, workflow `ci.yml`,
job «check-types, lint, test». Log của hai PR đo-thử còn trên GitHub dù PR đã đóng.

## Trước — 33 lượt CI trên trần mặc định 5000 ms

Nguồn: `rang/bang-do-ci.json`, gồm 30 run gần nhất tới 2026-09-28 và các lượt chạy lại.

| | ms |
| --- | --- |
| ca lái, xanh nhanh nhất | 2812 |
| ca lái, xanh trung vị | 4643 |
| ca lái, xanh chậm nhất | 4996 (36356634041/1) |
| ca lái, đỏ (3/33) | 5000 (36358001739/1) · 5004 (36378005030/1) · ≥ 7469 (36371259813/1) |
| tại chỗ, Mac mini | ~1135 |

Trong ba lượt đỏ, hai lượt kéo đỏ «chuoi da va den man» (36358001739/1, 36371259813/1).
Lượt 36371259813/1 kéo thêm 20 ca render-diff.

## Sau — cô lập, hai PR nháp ép trần ca lái còn 500 ms

Cả hai nhánh chỉ khác nhau ở bản vá. Trong cả hai run, `test/lai-ra-man.spec.tsx` chạy ngay
trước `test/render-diff.spec.tsx` trong cùng tiến trình `@crm/ui#test` (thấy qua thứ tự
`##[group]` trong log), nên ô «tệp sau» của trục B có đo thật.

| Nhánh | PR | Run | Ca lái | «mo tung» | «chuoi da va» | Ca đỏ khác |
| --- | --- | --- | --- | --- | --- | --- |
| có bản vá (`do-thu/lai-ra-man-co-va`, c1cea720) | phanlemanh/crm-onehub#189 | 36390650557/1 | đỏ, quá hạn | xanh 477 ms | xanh 2396 ms | **0** — render-diff xanh cả 75 ca |
| chưa vá (`do-thu/lai-ra-man-chua-va`, dc7bd53e) | phanlemanh/crm-onehub#190 | 36390059764/1 | đỏ, quá hạn | xanh 1789 ms | **đỏ 216 ms** | **22 ca render-diff** («bản vẽ không có chữ nào»…) |

Run 36390055115/1 của #189 đỏ ở `lint` (biome muốn gộp dòng khi tham số thứ ba là số),
nên không tới bước test. Nhánh được định dạng lại ở c1cea720 rồi đo bằng run
36390650557.

Danh sách 22 ca render-diff đỏ ở nhánh chưa vá: AttendeeList, Command, CopyValue,
DataTable · chọn dòng không có nhãn, DataTable · dòng mở rộng được, DataTable · menu Cột,
DataTable · menu Sắp xếp khi dòng mở rộng được, DataTable · menu con của mục lọc thường,
DataTable · menu con của mục lọc tìm được, DotMatrix, GiuThayDoi, Heatmap,
MessageScrollerButton · lên đầu, OkrStatus, PeriodSelect, Progress, Sheet, SortableItem,
Spinner, TablePagination · không kết quả, TargetLineChart, ThreadMessage.

Cả hai PR đo-thử đã đóng, và các nhánh đã xoá.

## Sau — lượt CI của PR phanlemanh/crm-onehub#191 (trần 30 000 ms)

Cùng run 36390451637, ba lượt, nhánh `fix/lai-ra-man-tran-gio` ở 93aba832.

| Lượt | Kết luận job | Ca lái | «mo tung» | «chuoi da va» | Ca đỏ |
| --- | --- | --- | --- | --- | --- |
| 1 | đỏ ở `@crm/validation#test`, trước khi tới `@crm/ui#test` | — (không chạy) | — | — | 1: `tai-lieu-diff > tat-dinh` quá trần 5000 ms (5590 ms) — ngoài phạm vi, đã mở chip riêng |
| 2 | **xanh** | 4280 ms | 121 ms | 1491 ms | 0 |
| 3 | **xanh** | **7241 ms** | 91 ms | 1322 ms | 0 |

Lượt 3 chạy ca lái 7241 ms. Trên trần cũ 5000 ms, lượt này đã đỏ như 36371259813/1, và theo
phép đo cô lập ở trên thì đã kéo đổ dây chuyền. Trên trần 30 000 ms, lượt này xanh với hệ
số dư 4,1. Mẫu 7241 ms cũng cho thấy thời gian thật của ca lái trên máy chậm vượt xa lượt
xanh chậm nhất của bảng «trước» (4996 ms): bảng đó bị cắt cụt ở 5000 ms, nên các lượt chậm
hơn chỉ hiện ra dưới dạng lượt đỏ.

Ngoài phạm vi, ghi lại để người đọc: lượt 1 cho thấy `packages/validation/test/tai-lieu-diff.spec.ts`
ca «tat-dinh» cũng sát trần mặc định (5590 · 3469 · 3036 ms qua ba lượt). Vòng này không
sửa ca đó.
