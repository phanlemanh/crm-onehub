# Điểm quyết định — duong-proto-cho-design-pass

Kê từ artifact cuối S1: 7 entry sổ quyết định chờ seal + 1 chỗ thiết kế lệch so
với bản đã bày ở brainstorm (phát hiện proxy). Không dòng `[GIẢ ĐỊNH]` nào trong
Coverage. Không finding gap-probe nào xử lý `human-gate1` (cả 5 đều `fixed`).

| Điểm | Đếm | Hình |
|---|---|---|
| Proxy mở `/proto` vào `ANONYMOUS` (d-…-4) + phát hiện giữa S1 | 5 bước nối tiếp, 4 nhánh rẽ | `luong-canh-duong.html/.png` |
| Sổ đăng ký tách `catalog.ts` / `registry.ts` (d-…-1, vá P0 gap-probe) | 3 bước nối tiếp, 3 nhánh rẽ | `duong-doc-so.html/.png` |
| Cờ dev là biến riêng, không dùng `NODE_ENV` (d-…-3) | dưới ngưỡng: 2 nhánh, 1 bước | — |
| Proto ở lại vĩnh viễn, nhận drift (d-…-2) | dưới ngưỡng: 2 nhánh, 1 bước | — |
| Không khai `capture_cmd` (d-…-6) | dưới ngưỡng: 2 nhánh, 1 bước | — |
| Không wire `executors.design.static` (d-…-7) | dưới ngưỡng: 2 nhánh, 1 bước | — |
| Bỏ design-pass ở vòng này — nút mồi (d-…-5) | dưới ngưỡng: 1 nhánh (không né được) | — |

## Đề bài hình 1 — `luong-canh-duong`

- Loại: sơ đồ luồng quyết định, một cột dọc
- Nút: một yêu cầu `GET /proto/duong-proto` không cookie phiên → `proxy.ts`:
  `/sign-in`? → **`ANONYMOUS` (thêm `/proto` ở ĐÂY)** → kiểm cookie phiên →
  `UNGATED` → hai cổng onboarding → `app/proto/layout.tsx`: `PROTO_ROUTE === "1"`?
  → trang proto hoặc `notFound()`
- Nhãn bằng chữ: đánh dấu rõ nhánh `ANONYMOUS` là đường thoát SỚM (trước lần kiểm
  phiên), và đánh dấu `PROTO_ROUTE` là **lớp chặn duy nhất còn lại** sau đó
- AC liên quan: AC-2, AC-13

## Đề bài hình 2 — `duong-doc-so`

- Loại: sơ đồ phụ thuộc, hai khối nguồn và ba khối tiêu thụ
- Nút: `catalog.ts` (dữ liệu thuần, không nhập gì) ← `registry.ts` (slug →
  Component) ; ba bên đọc: `page.tsx` mục lục, `[slug]/page.tsx`, và răng đo
  (`import`, KHÔNG bóc văn bản)
- Nhãn bằng chữ: gạch chéo đường "bóc văn bản registry.ts bằng biểu thức chuỗi"
  và ghi lý do một dòng — khai bằng `.map()` thì đọc ra 0 mục, vòng lặp trên tập
  rỗng đúng vô nghĩa, ba eval xanh mà chưa từng đọc sổ
- AC liên quan: AC-4, AC-7, AC-8
