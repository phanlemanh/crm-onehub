---
schema_version: 1
feature: "Helper test gieoNguoi() chịu được gọi song song trên kho test mới — upsert tổ chức bắt P2002 rồi đọc lại, không đổi chỗ gọi"
slug: gieo-nguoi-chiu-song-song
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: approved
approved_by: Mạnh
approved_at: 2026-10-14T08:41:26Z
design_doc: docs/superpowers/specs/2026-10-14-gieo-nguoi-chiu-song-song-design.md
---

# Acceptance Contract: gieo-nguoi-chiu-song-song

## Context

`gieoNguoi()` trong `apps/api/test/dieu-phoi-gieo.ts` upsert hàng tổ chức `WORKSPACE_ID`.
Hai lượt gọi cùng lúc trên kho test mới (chưa có hàng tổ chức) cùng chèn, lượt thua ném
P2002. Tái hiện 3/3 trên onehub `f3e8192fa` bằng ca `dieu-phoi-va.spec.ts -t dem-qua-han`.
Hướng sửa đã thống nhất với Mac Studio (chủ vùng DA0a): sửa trong helper, không đổi chỗ gọi.

Source input: prompt

## Criteria

- AC-1: Given một kho test mới chưa có hàng tổ chức `WORKSPACE_ID`, When bốn lượt `gieoNguoi()` chạy cùng lúc bằng `Promise.all`, Then cả bốn xong không lỗi, kho có đúng một hàng tổ chức `WORKSPACE_ID` và đúng bốn hàng thành viên của bốn người vừa gieo.
- AC-2: Given bản sao cây ở HEAD mà nhánh bắt P2002 của helper bị vô hiệu, When chạy cùng bài kiểm của AC-1 trên kho test mới, Then bài kiểm đỏ và đầu ra mang câu ``Unique constraint failed on the fields: (`id`) [organization.upsert]``; và ở cây lành bài kiểm thật sự chạy (dòng `(pass)`), không bị bỏ qua.
- AC-3: Given một kho test mới cho mỗi lượt, When chạy riêng từng ca có chỗ gọi song song đã kể — ca tái hiện `dieu-phoi-va.spec.ts -t dem-qua-han` (ở dạng chỗ gọi đang có trên onehub), `dieu-phoi.spec.ts -t xoa-ghi-danh` và `dieu-phoi-diem-nhan.spec.ts -t khong-khop-agenttask` (hai `gieoKeHoach` cùng lúc), Then cả ba xanh và không lượt nào in `Unique constraint failed`.
- AC-4: Given diff của vòng so với điểm rẽ khỏi `origin/onehub`, When liệt kê tệp đã đổi, Then không tệp nào ngoài helper, bài kiểm mới, thiết kế và `_acceptance/**` (cùng hai trang máy vẽ) — không chỗ gọi nào và không mã sản phẩm nào bị đổi.
- AC-5: Given `upsert` tổ chức ném một lỗi không phải P2002, hoặc ném P2002 mà hàng `WORKSPACE_ID` vẫn không có, When `gieoNguoi()` chạy, Then lỗi hiện ra cho bài kiểm — helper không nuốt lỗi nào ngoài đúng ca «lượt khác vừa chèn hàng này». (judgment)

## Coverage

Bỏ quét không gian bằng morphological-scan — xem dòng `descope` «bỏ coverage-scan» trong
sổ quyết định. Không gian một chiều: một hàm, một ca đua, một hướng sửa đã chốt.

- Trục chiều đo: dương — lượt song song xong (AC-1, AC-3) | âm — thước đỏ khi bỏ cách sửa (AC-2) | không nuốt lỗi khác (AC-5) [thước CE: ba nhánh của khối `catch`]
- Trục phạm vi: helper (AC-1, AC-5) | chỗ gọi không đổi (AC-3, AC-4)

## Out of scope

- Không đổi chỗ gọi nào. Bỏ `Promise.all` → tuần tự ở DA1b (#405) là việc của hồ sơ `chep-viec-can-lam-cu` nếu nó ghim lại.
- Không sửa các bản upsert tổ chức khác trong test (`phien-thu.ts`, `support/ke-hoach-gieo.ts`, các spec tự gieo). Hai spec có `Promise.all([gieoKeHoach(), gieoKeHoach()])` đi qua `dieu-phoi-gieo.ts`, không qua `support/ke-hoach-gieo.ts`; AC-3 chạy riêng chúng.
- Không đổi mã sản phẩm. `packages/auth/src/organization.ts` có upsert riêng trong giao dịch; không thuộc vòng này.

## Notes

Mã sửa đã được thử viết trước khi hợp đồng có (lúc tái hiện), rồi cất ra ngoài cây để đường
nền chạy trên cây chưa đụng; mã vào cây sau Cổng Phạm vi.

Hai ca `dieu-phoi.spec.ts -t xoa-ghi-danh` và `dieu-phoi-diem-nhan.spec.ts -t
khong-khop-agenttask` xanh cả trên cây CHƯA sửa (đo 14/10 07:3xZ, mỗi ca một kho mới):
chúng không tái hiện được cuộc đua. E6, E7 vì thế đo không-hồi-quy ở chỗ gọi, không đo
ca đua; chỗ đo ca đua là E1, E2, E3.

Nhánh này đặt lên onehub `2f53f8fa2` để làm S1 và gộp onehub lần nữa SAU khi DA1b (#405) vào (lô 10:00Z, theo Điều phối M5). #405 đổi
`dieu-phoi-va.spec.ts:244` sang gieo tuần tự, nên sau đó E3 không còn tái hiện cuộc đua;
nó đo không-hồi-quy như E6, E7. Đối chứng đỏ-trên-bản-cũ của ca đua nằm ở E2.
