---
schema_version: 1
feature: Thành viên mở Cài đặt hay Hội thoại và gặp cùng một thanh bên khu — cùng bề rộng, cùng nhãn nhóm, trên điện thoại thành một hàng cuộn ngang
slug: thanh-ben-khu-dung-chung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-19T11:49:46Z
design_doc: docs/superpowers/specs/2026-10-19-thanh-ben-khu-dung-chung-design.md
---

# Acceptance Contract: thanh-ben-khu-dung-chung

## Context

Cài đặt dựng thanh bên 224px bằng `NavGroup`/`NavItem`/`NavStrip`; Hội thoại tự dựng vỏ
213px với nhãn nhóm 11px và dòng tô nền tay, và trên điện thoại không có thanh nào ngoài ngăn
của thanh biểu tượng. Vòng này dựng một thành phần `AreaSidebar` trong `packages/ui` (khung dọc
`w-56` từ `md`, hàng cuộn ngang dưới `md`, nhóm có nhãn, đầu và chân thanh), chuyển cả hai khu
sang dùng nó, và viết luật «khi nào thanh bên khu, khi nào thẻ con» vào `docs/design.md`. Khu
Mục tiêu (VK2) là nơi dùng thứ ba, ở hàng kế.

«Máy tính» là khổ từ 768px, «điện thoại» là dưới 768px. Bàn đo màn chạy trên phiên đo riêng
của cây (`scripts/lan-do/tien-de.mjs`), dữ liệu mẫu của seed, quản trị `ada@trycomp.ai`,
tiếng Việt, hai khổ 1280×800 và 375×812.

## Criteria

- AC-1: Given một `AreaSidebar` có nhãn, đầu thanh, chân thanh, một nhóm không nhãn và hai nhóm có nhãn, một mục đang mở, When dựng, Then trong `aside[data-slot=area-sidebar]` có một `nav` mang đúng nhãn, mỗi nhóm là `[data-slot=nav-group]`, nhóm có nhãn mang `[data-slot=nav-group-label]` đúng chữ còn nhóm không nhãn thì không, mọi mục là `[data-slot=nav-item]`, đúng một mục mang `aria-current="page"`, đầu thanh đứng trước `nav` và chân thanh đứng sau; và ngoài `aside` có một `[data-slot=nav-strip]` mang cùng nhãn chứa đúng các mục ấy cùng thứ tự, không nhãn nhóm, không chân thanh, có đầu thanh, cùng mục đang mở.
- AC-2: Given `AreaSidebar placement="panel"`, When dựng, Then chỉ có bố cục dọc (không `[data-slot=nav-strip]`), khung không mang lớp ẩn theo khổ (`hidden`) và không mang tên chuyển cảnh, còn `placement="area"` mang tên chuyển cảnh `area-sidebar` trên cả hai bố cục; và một phần tử bên gọi bọc bằng điều kiện `useAreaSidebarOrientation() === "vertical"` chỉ xuất hiện trong bố cục dọc.
- AC-3: Given Cài đặt ở mọi trang con và mọi vai, When thanh bên dựng, Then nhóm, mục, thứ tự, mục sáng và lọc theo vai giữ đúng như bài kiểm đã ký `khung-trang-cai-dat-thanh-ben.dom.tsx`, và thanh bên ấy (cả lúc đang tải) nằm trong `aside[data-slot=area-sidebar]`.
- AC-4: Given Hội thoại có cuộc hôm nay, hôm qua, trong 7 ngày (một chưa đọc, một đang chạy) và hai tác nhân của đội, đang mở một cuộc, When thanh bên dựng ở máy tính, Then nó nằm trong `aside[data-slot=area-sidebar]`; đầu thanh có chữ «Hội thoại» và liên kết «Hội thoại mới» tới `/chat`; ba nhóm ngày mang nhãn bằng `[data-slot=nav-group-label]` đúng chữ tiếng Việt theo thứ tự; mỗi cuộc là `[data-slot=nav-item]` liên kết tới `/chat/<id>` có tiêu đề cắt trên một dòng khi dài, cuộc đang mở mang `aria-current="page"`; mỗi cuộc có một nút xoá; nhóm tác nhân có nhãn là liên kết tới `/agents` kèm số 2 và mỗi tác nhân một `[data-slot=nav-item]`.
- AC-5: Given Hội thoại, When người bấm một cuộc chưa đọc trong thanh bên, Then `markRead` được gọi đúng một lần với mã cuộc ấy và `onNavigate` được gọi; When không có cuộc nào trong 7 ngày, Then bố cục dọc hiện câu rỗng của Hội thoại và vẫn có nhóm tác nhân.
- AC-6: Given Hội thoại ở điện thoại, When thanh bên dựng, Then có một `[data-slot=nav-strip]` mang nhãn danh sách hội thoại chứa mọi cuộc rồi mọi tác nhân theo đúng thứ tự của bố cục dọc, cuộc đang mở mang `aria-current`, không nút xoá, không nhãn nhóm; và đầu thanh «Hội thoại» với liên kết «Hội thoại mới» đứng trên hàng ngang; và ngăn điện thoại của thanh biểu tượng truyền `placement="panel"` (prop bắt buộc của `AgentBuilderSidebar`) và vẫn liệt cuộc theo nhóm có nhãn, mỗi cuộc có nút xoá.
- AC-7: Given lúc đang tải, When khung chờ của Cài đặt và của Hội thoại dựng, Then cả hai nằm trong `aside[data-slot=area-sidebar]` có `nav` mang `aria-busy="true"` và đúng nhãn của khu, và Hội thoại không còn chuỗi `w-[213px]`.
- AC-8: Given cây đã sửa chạy thật trên phiên đo riêng, When bàn đo gieo cho người đo tám cuộc hội thoại qua đường ghi thật (`conversations.createBuilder`) rồi mở `/settings` và một cuộc `/chat/<id>` ở 1280×800 và 375×812, Then ở 1280 thanh bên của hai khu cùng rộng 224px, nhãn nhóm của hai khu cùng `font-size`, `font-weight`, `letter-spacing`, `text-transform`, `color`, không thấy hàng ngang, và bàn đo in số dòng hội thoại thấy được; ở 375 không thấy `aside` thanh khu, không thấy nhãn nhóm, hàng ngang của Hội thoại cuộn được (`scrollWidth > clientWidth`) còn của Cài đặt cuộn được hoặc vừa khung, và trang không tràn ngang (`documentElement.scrollWidth ≤ clientWidth`) ở cả hai khu; kèm bốn ảnh hai khu × hai khổ mà người xem thấy cùng một thanh.
- AC-9: Given `apps/app` (trừ thư mục test và proto), When quét, Then không tệp nào còn tự dựng thanh bên khu — không chuỗi `w-[213px]`, không `<aside` nào mang lớp bề rộng cố định (`w-56`, `w-[…px]`) kèm lớp ẩn theo khổ — và `settings-sidebar.tsx` cùng `agent-builder-sidebar.tsx` nhập `AreaSidebar` từ `@crm/ui/components/area-sidebar`.
- AC-11: Given một cuộc trò chuyện ở 375×812 có nội dung cao hơn khung (bàn đo chèn vào `[data-slot=message-scroller-content]` một khối cao 3000px, đại diện cho cuộc dài), When đo lại, Then vùng tin `[data-slot=message-scroller-viewport]` tự cuộn (`scrollHeight > clientHeight`), đáy của nó và của ô soạn tin nằm trong khung nhìn, và trang không tràn dọc (`documentElement.scrollHeight ≤ clientHeight`); kèm ảnh.
- AC-10 (judgment): Given `docs/design.md` và `docs/settings.md` sau vòng này, When người đọc cần chọn giữa thanh bên khu và thẻ con cho một màn mới, Then `docs/design.md` có một mục nói khi nào dùng thanh bên khu (các nơi đến ngang hàng của một khu, đặt ở layout của khu, nhóm có nhãn, điện thoại thành hàng ngang), khi nào dùng thẻ con (các phần của một vật trên một trang), giới hạn một thanh khu và một hàng thẻ con trên một màn, ví dụ thật của kho cho mỗi bên, và một dòng «Dấu hiệu vẽ tay» trỏ `AreaSidebar`; `docs/settings.md` mục «Thanh bên» trỏ cùng thành phần.

## Coverage

Quét không gian tiêu chí bằng morphological-scan (preset entity-feature, thực thể «thanh bên khu»), bốn trục:

- Trục khu: Cài đặt | Hội thoại | Hội thoại trong ngăn điện thoại của thanh biểu tượng | Mục tiêu (VK2) [thước CE: hàng VK1–VK2 `docs/plan/lo-trinh-okr.json` và `app-icon-rail.tsx` — SUY-TỪ-REPO]
- Trục khổ: máy tính ≥768 | điện thoại <768 [thước CE: mốc `md` của `app-icon-rail.tsx` và `KHO_MAN.dienThoaiDuoi` trong `packages/ui/src/hooks/use-kho-man.ts` — SUY-TỪ-REPO]
- Trục trạng thái: đang tải | có dữ liệu, một mục đang mở | rỗng | lọc theo vai [thước CE: bảng trạng thái của design doc — SUY-TỪ-REPO; NGÀNH: Web Interface Guidelines «Handle empty states»]
- Trục phần tử: đầu thanh | nhóm có nhãn | nhóm không nhãn | mục | hành động trên dòng | chân thanh [thước CE: bản mẫu `/proto/vo-khu-muc-tieu` `khung.tsx` (ô chu kỳ ở đầu, nhóm «dau» không nhãn, «Chương trình OKR» ở chân) — SUY-TỪ-REPO; NGÀNH: shadcn `sidebar` (SidebarHeader · SidebarGroupLabel · SidebarMenuAction · SidebarFooter)]
- Cắt ngang mọi ô Core: mục là liên kết thật, đúng một mục sáng (AC-1, AC-3, AC-4, AC-6).

Core: thành phần × mọi phần tử × hai khổ (AC-1, AC-2) · Cài đặt × hai khổ × đang tải, đang mở, lọc vai (AC-3, AC-7) · Hội thoại × máy tính × có dữ liệu, rỗng, hành động trên dòng (AC-4, AC-5) · Hội thoại × điện thoại × ngăn (AC-6) · hai khu cạnh nhau trên màn thật (AC-8) · một nguồn (AC-9) · luật (AC-10).

Later: Mục tiêu dùng thành phần (VK2) · phím mũi tên giữa các mục · danh sách hội thoại trên 50 cuộc (ảo hoá).

Never: thu gọn thanh bên thành biểu tượng — thanh biểu tượng cấp ứng dụng đã làm việc đó · thanh khu mở thành `Sheet` ở điện thoại — câu giao đòi hàng cuộn ngang.

## Đường đo

Ngưỡng của `opportunity.md`: «Cài đặt và Hội thoại dùng chung một thành phần thanh bên khu trong packages/ui; docs/design.md có luật khi nào dùng thanh bên khu, khi nào dùng thẻ con».

- Dùng chung một thành phần: số từ bài quét `rang/quet-vo-tay.mjs` (hai tệp nhập `AreaSidebar`, không vỏ tự dựng) và hai bài kiểm DOM tìm `aside[data-slot=area-sidebar]` ở cả hai khu — AC-3, AC-4, AC-9.
- Có luật: hội đồng đọc `docs/design.md` — AC-10.

## Out of scope

- Khu Mục tiêu dùng `AreaSidebar` — hàng VK2.
- Bỏ danh sách hội thoại khỏi ngăn điện thoại của thanh biểu tượng — ngăn là chỗ duy nhất ở điện thoại có nút xoá và danh sách tác nhân dọc.
- Thu gọn thanh bên, ô tìm trong thanh bên, phím mũi tên.
- Đổi chữ trên thanh bên của hai khu.

## Notes

- Hồ sơ đã ký `khung-trang-cai-dat` đọc DOM thanh bên Cài đặt (`aside nav`, `[data-slot=nav-group-label]`, `nav` ngoài `aside`, `nav[aria-label=Cài đặt]`); thiết kế giữ nguyên những bộ chọn ấy.
- S3 19/10: bài quét `rang/quet-vo-tay.mjs` trên mã chưa sửa (`1fce5d49`) đỏ đúng chỗ — 4 vỏ tự dựng (`settings-sidebar.tsx:81`, `agent-builder-shell.tsx:25–26`, `(agent-builder)/layout.tsx:44`), 0/2 tệp nhập `AreaSidebar`, mã 1; `TBK_PHA=gieo` gọi đúng tên tệp gieo.
- S3 19/10: bàn đo màn `rang/do-man.mjs` trên phiên đo riêng: 15 DUNG, 0 SAI; nhãn nhóm hai khu `12px/500/0.6px/uppercase/rgb(161, 161, 161)`; ở 1280×800 thấy 8 dòng hội thoại; `TBK_PHA=rong` → 2 SAI «aside 224px (mong 230px)»; `TBK_PHA=tran` → «SAI AC-8 hoi-thoai 375: tran ngang 825px».
- S3 19/10: `NavItem` cỡ `sm` là `h-7 text-xs` (`packages/ui/src/components/button.tsx`), bằng dòng hội thoại trước vòng — mật độ cột không đổi.
- Ở điện thoại, trang trò chuyện có hai dòng mang chữ «Hội thoại»: đầu thanh khu (kèm «+» Hội thoại mới) và đầu trang trò chuyện — đúng AC-6, nêu ra để người ký thấy.
- Gate 2 lượt 1 (19/10, Phan Le Manh): Ngoài-2 «nâng phạm vi sửa ngay» → AC-11, E12 (dòng sổ d-20261019T130202Z-15). Chiều đỏ trên `e613e64c` (trước bản sửa): «SAI AC-11 hoi-thoai 375 cuoc dai: vung tin khong cuon (3140/3140), day vung tin 3326px > 812px, day o soan 3375px > 812px, tran doc 2617px». Sau khi thêm `min-h-0` cho vỏ nội dung của `AgentBuilderShell`: 16 DUNG, 0 SAI (vùng tin 3140/523, ô soạn 758px); `TBK_PHA=cuon` trả lại đúng dòng SAI trên.
