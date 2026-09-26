## Ngữ cảnh

- Sản phẩm: CRM OneHub, khu OKR — chân sản phẩm: đào repo (ba chỗ gọi khối, `danh-sach.ts`, `cay.ts`, `okr-xem.contracts.ts`, sổ lượt 5) · chân ngành: NN/g «Error-Message Guidelines»; TanStack Query «Advanced Server Rendering» (khoá tải trước phải trùng khoá trình duyệt).

## Trục

- A — nơi khối hiện: Tổng quan | Tổng quan «chỉ OKR» | trang một người [CE: SUY-TỪ-REPO ba chỗ gọi `KhoiKrCuaToi`]
- B — trạng thái truy vấn: chu kỳ lỗi | KR lỗi | đang tải | không chu kỳ | có dữ liệu | rỗng | thử lại hết lỗi | thử lại vẫn lỗi [CE: NGÀNH NN/g + luật ST lượt 5]
- C — người đã chọn ở bộ lọc phụ trách: có KR khớp | không khớp, còn trong tổ chức | đã rời [CE: SUY-TỪ-REPO `danh-sach.ts`, `cay.ts`]
- D — bộ lọc trên URL khi mở Theo đơn vị: không lọc | chỉ tự tin | chỉ mặt khác | đủ bốn [CE: NGÀNH TanStack Query + `locDanhSach`]

## Không gian (A×B 24 ô, C 3 ô, D 4 ô)

- Trang một người × chu kỳ lỗi: gạch — khối nhận `cycleId`, truy vấn chu kỳ của khối tắt; trang tự hiện Empty lỗi.
- Tổng quan «chỉ OKR» × mọi B: cùng component, cùng nhánh — đi chung ô Tổng quan.

## Core

1. Tổng quan × chu kỳ lỗi → AC-1 (lỗ gốc Ngoài-8).
2. Tổng quan × thử lại hết lỗi / vẫn lỗi → AC-2.
3. {Tổng quan, trang một người} × KR lỗi → AC-3 (khối lỗi cũ không có Thử lại; câu sai chủ ngữ ở trang người).
4. Tổng quan × không chu kỳ / đang tải → AC-4 (đối chứng: không được vá quá tay).
5. C: không khớp còn trong tổ chức → AC-5; đã rời → AC-6.
6. D: không lọc, chỉ tự tin, đủ bốn → AC-7 (khoá lệch cả khi không lọc); tập mặt → AC-8.

## Later

- Trang một người × thử lại vẫn lỗi (cùng nhánh AC-2, đo ở Tổng quan).
- D «chỉ mặt khác» (cùng đường với «đủ bốn»).

## Never

- C «có KR khớp» — hành vi cũ đúng, đã có đo ở lượt 5 (E2 toan-canh-okr).
- Tổng quan × có dữ liệu / rỗng — không đổi, lượt 5 E19 đo.

## Cross-cutting

- Câu lỗi và nhãn có bản vi và en (`messages-guard`).
- Dữ liệu người nhập (tên người) giữ `translate="no"` ở chỗ đã có.
