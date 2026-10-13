---
slug: kanban-viec
preset: entity-feature
at: 2026-10-13
---

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: đào repo (`CONTEXT.md` mục «Việc», `docs/api.md` mục «Việc»,
  `_acceptance/viec-chung/contract.md`, `packages/db/src/viec.ts`) · chân ngành: khảo sát 29 nền tảng trong kho
  (`docs/plan/viec-du-an-nghien-cuu/04-quan-ly-cong-viec.md`, `06-thi-truong-viet.md` — Asana, Jira, ClickUp,
  monday, Planner, Base, 1Office, MISA AMIS, Getfly, Fastwork), cộng chuẩn giao diện kho đã khai
  `web-design-guidelines` (bản tải 13/10).

## Trục

Preset entity-feature có bốn trục (vòng đời · người × quyền · vào–ra · thời gian). Ở lượt này «vào–ra» co lại thành
bề mặt thao tác (chuột, chạm, bàn phím, lệnh không qua bảng), vì việc vào và ra đã do DA1 phủ.

- **A. Thao tác trên bảng:** xem bảng · kéo sang cột · sắp trong cột · tách việc con · đóng hay huỷ việc cha còn con
  mở · xoá việc có con hay việc con
  [thước CE: câu giao hàng DA2 + năng lực D1, A3, A9 của `00-khung.md`; `[NGÀNH: Asana, Jira, ClickUp, Base,
  1Office]` theo `04-quan-ly-cong-viec.md` dòng A3 và `06-thi-truong-viet.md` dòng A3, D1]
- **B. Người × phạm vi:** người giao · người thực hiện · người theo dõi · thành viên khác thấy việc gắn đối tác ·
  vai «chỉ OKR»
  [thước CE: bảng chuyển trạng thái `docs/api.md` mục «Việc» và ma trận 5 người × 20 cặp của DA1
  (`apps/api/test/viec-ghi.spec.ts`) `[SUY-TỪ-REPO: docs/api.md]`]
- **C. Bề mặt:** chuột ở 1280 · chạm ở 375 · bàn phím · lệnh không qua bảng (khung việc, «xong n» Zalo, tác nhân)
  [thước CE: `web-design-guidelines` «mọi cử chỉ kéo có lối bấm và lối bàn phím»; AC-13 của DA1 đo 1280 và 375]
- **D. Đồng thời và lỗi:** một người · hai người đổi cùng việc · máy chủ từ chối · mạng hỏng
  [thước CE: `docs/design.md` «Chờ tải và lỗi tải»; `web-design-guidelines` «kéo lạc quan hỏng thì trả về chỗ cũ và
  báo bước kế»]

## Core (≤20%)

1. A·kéo sang cột × B·người giao/người thực hiện × C·chuột — lời hứa chính của câu giao.
2. A·kéo sang cột × B·mọi vai × cặp trạng thái — cột không nhận được phải bị chặn ở máy chủ đúng như bảng chuyển
   trạng thái (ma trận đủ 100 ô), và hiện mờ trên bảng khi đang kéo.
3. A·kéo sang cột × C·chạm/bàn phím — menu «Chuyển sang…» và kéo bằng phím.
4. A·sắp trong cột × B·người có quyền sửa — thứ tự còn sau khi tải lại (khoá chèn giữa).
5. A·kéo × D·máy chủ từ chối/đồng thời — thẻ về chỗ cũ, báo lý do, bảng tải lại.
6. A·tách việc con × B·người giao/người thực hiện — con là một Việc đủ, một tầng.
7. A·tách việc con × B·người không quyền/vai «chỉ OKR» — chặn.
8. A·đóng/huỷ cha còn con mở × B·người giao — hỏi lại, không tự đóng con.
9. A·xem bảng × B·thành viên khác — con giữ luật thấy việc: mang bản ghi gắn của cha.
10. Đường đo: lần kéo ghi nguồn riêng; thước đọc số.

## Later

- Kéo đổi người thực hiện, cột theo trường khác (D2), làn ngang (D3), giới hạn WIP (D4), bắt điền trường khi sang cột (D5).
- Việc con nhiều tầng; đổi cha; gỡ con khỏi cha.
- Bảng cột trong khối «Việc» của từng bản ghi (thoả thuận, công ty); bảng cột của Dự án (DA4).
- Thao tác hàng loạt trên bảng (chọn nhiều thẻ).
- Checklist trong việc (A9) — chờ chủ kho chốt ở Cổng Phạm vi (Hỏi-3).

## Never

- Kéo thả bảng cột kế hoạch onboard 30 ngày — chủ kho giữ «không làm» ở Cổng Đáng 13/10.
- Cột «Huỷ» trên bảng — huỷ là kết cục nghiệp vụ, `docs/vong-doi.md` để nó ở dòng gập.
- Tiến độ việc cha tự cộng từ con (kể cả việc huỷ) — `06-thi-truong-viet.md` dòng A3 ghi đúng lỗi này ở một hãng;
  thẻ chỉ đếm «x/y việc con xong».
- Tự đóng việc con khi đóng cha — `da_bac` x4 của lộ trình.

## Cross-cutting áp mọi ô Core

- Trạng thái chờ tải, lỗi tải, rỗng theo `docs/design.md`; khung xương cùng hình bảng.
- Không cuộn ngang trang ở 375 (bảng tự cuộn trong khung của nó).
- Mọi lần đổi để lại đúng một vết; thứ tự riêng không phải lịch sử.
- Chữ trên màn theo `CONTEXT.md`; dữ liệu người nhập không dịch.
