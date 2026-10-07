---
schema_version: 1
slug: ca-chap-chon-cach-ly
feature: Các ca kiểm chập chờn theo máy thôi làm đỏ cả lượt dài hay CI — làm kín từng ca, dọn trạng thái sót trước mỗi lượt, ca chưa kín thì cách ly có người phụ trách
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07
prototype:
  base_commit:
  disposition:
---

Gốc: điều phối làn «lên trước 14/10», 04–06/10/2026 (`.acceptance-runs/dieu-phoi-1410/LUAT.md`). Cùng đợt với `kiem-cheo-sau-gop`.

## Vấn đề & ai gặp

Một ca chập chờn trong suite làm đỏ cả lượt, và lượt đó phải chạy lại từ đầu. Các ca đã gặp:

| Ca | Biểu hiện | Lượt xuất hiện | Thời gian mất |
| --- | --- | --- | --- |
| `apps/agent-okr/test/app-rieng.integration.spec.ts` «chạy cạnh apps/agent» | `apps/agent` không lên kịp, ConnectionRefused ở `/health`, «killed 2 dangling processes», timeout 5000 ms | 2 lần trong đêm 05–06/10 (một lần trong E11) | ~2 giờ 20 phút lượt dài; đêm 06/10 phải bỏ ca bằng `SOKR_KHONG_CHAY_AGENT_CU=1` |
| Trạng thái eve dev sót (`apps/agent*/.eve` dev-runtime, dev-hosts) sau một lượt bị ngắt | suite 4 đỏ 503 lặp 3/3 ở lượt kế | 1 lần (06/10 01:5x) | ~10 phút + chẩn đoán |
| `tai-lieu-khong-ro`, `tai-lieu-thay-trang` (api) | hook dựng Nest hết 5 s, «(fail) (unnamed)» | 1 lần CI #269 (05/10) | 1 lượt CI chạy lại ~25 phút |
| `nguoi-huy` | hết giờ 5 s | ≥1 lần CI (05/10) | 1 lượt CI chạy lại |
| `to-chuc-chi-tiet.dom.tsx` o-so-man | đọc URL trước khi nuqs ghi | đã vá ở #269 | — |

**Người gặp:** mọi phiên chạy pre-push, ghim lại hay S4; người điều phối giữ hàng `s4`.

## Giả định chốt sinh tử

- Mỗi ca sửa được thành kín ở tầng test (cổng tự do, dọn tiến trình và `.eve` trong `beforeAll`/`afterAll`, chờ sẵn sàng bằng vòng thử có trần thay vì một lần gọi), không đổi mã sản phẩm.
- Ca chưa kín được thì cách ly có tên, lý do và người phụ trách, CI vẫn chạy nó ở job riêng không chặn — chứ không xoá.

## Câu hỏi mở cho Cổng Đáng

- Sổ cách ly đặt ở đâu (một tệp trong kho, hay nhãn trong tên ca)?
- Trần thời gian của ca tích hợp dựng máy chủ: nâng riêng (30 s như `lai-ra-man`) hay giữ 5 s và chờ sẵn sàng trước?
- Dọn `.eve` sót là việc của test, của `scripts/lan-do`, hay của làn ghim lại ở bộ kit?

## Hạng mục cùng lớp

`kiem-cheo-sau-gop`, `eval-model-that-dung-luc`, `thuoc-khong-tu-het-han`. Phần «chạy lại một lần trước khi kết luận đỏ» trong làn ghim lại thuộc bộ kit, đi chip riêng.

## Quyết định Cổng Đáng

07/10/2026, chủ kho: «Đưa F9-F12 vào đợt» — `build`, làm trong dãy P4 của đợt `sau-14-10`. Các câu hỏi mở ở trên chuyển sang Cổng Phạm vi của vòng.
