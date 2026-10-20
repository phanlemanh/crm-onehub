---
schema_version: 1
feature: "Kara không ghi đè giá trị trường tuỳ chỉnh đã có — chỉ thay khi người bán hàng bảo thay trong hội thoại"
slug: kara-khong-ghi-de-truong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, docs]
status: draft
design_doc: docs/superpowers/specs/2026-10-20-kara-khong-ghi-de-truong-design.md
---

# Acceptance Contract: kara-khong-ghi-de-truong

## Context

Phát hiện trong phiên phân tích UX trường tuỳ chỉnh và đính kèm hợp đồng, 20/10/2026. `writeField`
(`apps/agent/agent/lib/fields.ts`) chỉ kiểm «ô đã có giá trị» trong tác vụ `field-backfill`. Ở phiên hội thoại và ở
mọi tác vụ nền khác, `set_field_value` ghi đè giá trị người bán hàng đã gõ, và người đó không được báo.

Hợp đồng viết theo lối B của design doc: chặn mọi lần ghi lên ô đã có giá trị, trừ khi người gọi nói rõ là thay
(`replace: true`), và chỉ phiên có người mới được thay. Lối A (cột xuất xứ, `migration`, T3) là Hỏi-1 ở Cổng Phạm vi;
chọn A thì hợp đồng soạn lại.

Source input: design doc · `docs/plan/dynamic-fields.md` §5 · `docs/ai-ux.md` §4 · `docs/agent.md` «Evidence, not
confidence» · `apps/agent/agent/lib/approval.ts` (`isAutomated`) · `apps/agent/agent/lib/dispatch.ts` (`taskAuth`).

Trong mọi tiêu chí:

- C: một liên hệ thử; F: trường TEXT `agentFilled: true` của liên hệ; M: trường TEXT `agentFilled: false`.
- «Giá trị người gõ» ghi qua `writeValues` của `@crm/db/fields` — cùng hàm `FieldsService.applyValues` của API dùng
  khi người bán hàng sửa ô.
- «Phiên có người»: ngữ cảnh công cụ có `auth.current` dựng bằng `thanhVienPrincipal(<người>, "crm-app")` — cùng hàm
  kênh `channels/eve.ts` dùng cho hội thoại ở tab bản ghi — với một thành viên thử của workspace.
- «Phiên nền»: ngữ cảnh công cụ có `auth.current = taskAuth(<tác vụ>)` của `lib/dispatch.ts`.
- «Lượt Tác nhân»: ngữ cảnh mang `purpose: "team-agent"`, `principalType: "user"`, chép đúng khuôn mà
  `runDeployedAgent` (`lib/custom-agent-dispatch.ts`) gửi — khuôn ấy viết liền trong hàm, không có hàm dựng riêng.
- Mọi lần gọi đi qua `set_field_value.execute` chạy trong ngữ cảnh eve thử (`trongNguCanhEve`).

## Criteria

- AC-1 (cross-layer): Given F của C đang là «Người gõ», When Kara gọi `set_field_value` ở phiên có người với
  `value: "Kara thấy"`, không có `replace`, Then kết quả là `written: false`; lý do chứa «Người gõ», chữ `replace`
  và câu điều kiện «only if the rep asked you to in this conversation»; và giá trị F đọc lại từ cơ sở dữ liệu vẫn là
  «Người gõ».
- AC-2 (cross-layer): Given F của C đang là «Người gõ», When Kara gọi `set_field_value` ở phiên có người với
  `value: null`, không có `replace`, Then kết quả là `written: false`, và hàng `FieldValue` của F trên C vẫn còn, giá
  trị «Người gõ».
- AC-3 (cross-layer): Given F của C đang là «Người gõ», When Kara gọi `set_field_value` ở phiên có người với
  `value: "Kara thấy"`, `replace: true`, Then kết quả là `written: true` và F đọc lại là «Kara thấy». When gọi tiếp
  với `value: null`, `replace: true`, Then kết quả là `written: true` và không còn hàng `FieldValue` của F trên C.
- AC-4 (cross-layer): Given F của C đang là «Người gõ», When Kara gọi `set_field_value` ở phiên nền của tác vụ
  `field-backfill`, của tác vụ `profile`, và ở lượt Tác nhân, mỗi loại hai lần — có và không có `replace: true` —
  Then cả sáu lần trả `written: false`, và F vẫn là «Người gõ».
- AC-5 (cross-layer): Given F của C đang trống, When Kara gọi `set_field_value` không có `replace` ở phiên có người
  (giá trị «A») rồi, trên một liên hệ trống khác, ở phiên nền `profile` (giá trị «B»), Then cả hai lần `written: true`
  và mỗi ô đọc lại đúng giá trị đã ghi. When gọi `value: null` lên một ô trống, Then `written: true` và không có hàng
  nào được tạo.
- AC-6 (cross-layer): Given F của C đang trống, When hai lần gọi `set_field_value` ở phiên nền `profile` chạy đồng
  thời, giá trị «X» và «Y», Then đúng một lần `written: true`, lần kia `written: false`, và F đọc lại bằng giá trị của
  lần đã ghi.
- AC-7 (cross-layer): Given M của C đang trống, When Kara gọi `set_field_value` lên M ở phiên có người với
  `replace: true`, Then `written: false` với lý do «manual only» như hôm nay, và không có hàng nào được tạo.
- AC-8 (judgment): Given mô tả của `set_field_value` (`description` và mô tả khoá `replace`), các câu từ chối trong
  `writeField` và `docs/agent.md`,
  When đọc, Then:
  - mô tả công cụ nói: ô đã có giá trị thì không ghi; chỉ đặt `replace: true` khi người bán hàng đã bảo thay giá trị đó
    trong chính hội thoại này;
  - không câu nào — mô tả công cụ hay lý do từ chối — mời Kara đặt `replace: true` khi chưa có lời bảo của người;
  - `docs/agent.md` có một mục nói luật không ghi đè của trường tuỳ chỉnh: phiên nền không bao giờ thay ô đã có giá
    trị, phiên có người chỉ thay khi có `replace: true`, và phiên nền xác định bằng `isAutomated`, không bằng lời model.

## Coverage

Quét bằng `morphological-scan`, tự dựng trục (không preset nào khớp đúng một đường ghi). Bốn trục:

- phiên: có người (hội thoại tab bản ghi) · nền `field-backfill` · nền loại khác (`profile`, `company-profile`…) ·
  lượt Tác nhân · Zalo [SUY-TỪ-REPO: apps/agent/agent/lib/approval.ts, apps/agent/agent/lib/dispatch.ts];
- ô trước khi ghi: trống · có giá trị [SUY-TỪ-REPO: packages/db/src/fields.ts];
- thao tác: đặt giá trị · xoá (`null`) [SUY-TỪ-REPO: apps/agent/agent/tools/set_field_value.ts];
- cờ: không · `replace: true`; cùng trục với `agentFilled` của định nghĩa (bật · tắt).

Thước CE:

- luật «never overwrite a human» của đường ghi thông tin liên hệ [SUY-TỪ-REPO: docs/agent.md];
- `docs/plan/dynamic-fields.md` §5 «Nothing a rep typed is ever overwritten» [SUY-TỪ-REPO: docs/plan/dynamic-fields.md];
- [NGÀNH: HubSpot Data Enrichment — «Continuously enrich existing records» chỉ cập nhật bản ghi *đã được làm giàu*,
  «Overwrite incorrect enrichment values» chỉ xoá giá trị *do làm giàu điền*; tra knowledge.hubspot.com
  `manage-data-enrichment-settings` ngày 20/10/2026]. Ngành phân biệt theo xuất xứ — đó là lối A; lối B là bản chặt
  hơn, không làm mới được giá trị máy tự điền (Later).

Ánh xạ Core sang AC:

- có người × có giá trị × đặt/xoá × không cờ → AC-1, AC-2;
- có người × có giá trị × có cờ → AC-3;
- nền (hai loại tác vụ và lượt Tác nhân) × có giá trị × cả hai cờ → AC-4;
- mọi phiên × trống → AC-5;
- nền × trống × hai lần cùng lúc → AC-6;
- `agentFilled` tắt × có cờ → AC-7;
- lời nói với model và người đọc mã → AC-8.

Later:

- Kara làm mới giá trị chính nó điền trước đó ở phiên nền — cần xuất xứ (lối A) hoặc đề xuất (`tac-tu-xin-duyet`).
- Ghi lại cùng giá trị lên ô đã có: hôm nay bị từ chối như mọi lần thay; Kara đọc lý do là thấy trùng.

Never:

- Zalo: `assertNotZaloQuestion` từ chối trước khi tới `writeField`.

## Đường đo

Bỏ theo khuyến nghị — hồ sơ không có `opportunity.md`. Đo hay không là Hỏi-2 ở Cổng Phạm vi (dòng sổ
thay dòng `d-20261020T131406Z-5`).

## Out of scope

- Cột xuất xứ trên `FieldValue` và mọi `migration` (lối A).
- Đổi `set_field_value` thành đề xuất người duyệt (`docs/ai-ux.md` §4, lượt `tac-tu-xin-duyet`, T3).
- Đường ghi của API (`FieldsService`, `listing-ingest`): người và máy nạp tin đăng vẫn ghi như hôm nay.
- Giao diện: không màn nào đổi.

## Notes

- Chiều đỏ trong lịch sử: commit bài kiểm đứng trước commit sửa; trên commit bài kiểm, E1, E2, E4, E6 đỏ với thông
  điệp ghim trong `evals.yaml`.
- Đường nền hạ tầng chưa chạy: khoá `duong-nen` đang do đợt `dieu-phoi-viec-du-an-kho-tai-lieu` giữ, phiên này không
  thuộc dãy nào nên không xin được lượt.
