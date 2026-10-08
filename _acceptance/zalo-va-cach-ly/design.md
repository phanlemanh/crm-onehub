# zalo-va-cach-ly — design

Hàng F15 của đợt `sau-14-10`, dãy P4, `uu_tien` 2.5. Hạng T2. Cổng Đáng `build` (luật 20).

## Gốc

Khối `cau-chao` của `apps/agent/test/zalo-va.integration.spec.ts` có bốn bài. Hai bài không đụng app («người
chưa nói nhận câu hướng dẫn» cần CSDL; «không câu nào còn chữ Thông báo của bạn»). Hai bài và một hàm —
«câu hướng dẫn chỉ tới Nhắc buổi sáng và nút Nối Zalo», «đối chứng chèn Cài đặt», và hàm `nhanDieuHuongKhac` —
cần `khungUngDungMessages`, `nhacQuaZaloMessages` của `apps/app`. Hai dòng import đó phạm `cach-ly-hai-agent`.

## Cách sửa

1. Tệp mới `apps/app/test/zalo-cau-chao-nhan.spec.ts`: nhập `ZALO` từ `../../agent/agent/lib/zalo-config`
   (chỉ hằng) và hai bộ chữ của app; chứa `nhanDieuHuongKhac` và hai bài đã dời NGUYÊN VĂN trong
   `describe("cau-chao", …)` — để `-t cau-chao` vẫn chọn chúng.
2. Spec agent: bỏ hai dòng import, hàm và hai bài đó; không đổi gì khác.
3. `config.yaml`: `r1g_cau_chao` chạy thêm `cd apps/app && bun test ./test/zalo-cau-chao-nhan.spec.ts`;
   thêm `zvc_agent_ca_tep`, `zvc_nguyen_van_xanh`, `zvc_nguyen_van_do`.
4. Ghim lại `soan-okr-cung-tro-ly` ở cuối nhánh.

## Đo

`do-cay --du-luat` (đỏ trên 0426cc9d0, xanh ở HEAD); cả spec agent; `r1g_cau_chao`; răng so nguyên văn với
bản ghim, có chiều đỏ là bản trong bộ nhớ đã bỏ một khẳng định của bài đối chứng.
