# Sổ lệch chuẩn — phép đo chạy tay

Hai phép đo của AC-3 và AC-8 chạy `bunx --bun ai-elements@latest add` để kéo
bản thượng nguồn tươi. Lệnh đó cần MẠNG và GHI vào `node_modules`, nên khi bộ
kiểm chạy nó song song với các lệnh khác thì cây hỏng giữa chừng — lượt kiểm 5
và 6 đều bị chặn vì đúng lý do đó (EEXIST ở js-yaml, json5; và `bun run test`
báo exit 1 trong khi chạy rời thì xanh).

Chủ kho quyết gỡ hai phép đo này khỏi bộ đo máy và chạy chúng bằng tay, có hồ
sơ riêng. Thước không đổi — chỉ đổi chỗ chạy.

- Cây đo: `447e881efd7403fffd2d59b4989f7e540ae15aaf`
- Chạy lúc: 2026-09-10T01:26:51Z
- Máy: Darwin arm64

## AC-3 — bản `conversation` tươi so sổ

```
RĂNG SỔ LỆCH CHUẨN
Gốc kho: /Users/manhphan/dev/crm-onehub-chat
Sổ: _acceptance/nen-chat-ai-elements/so-lech-chuan.md
Bản tươi: bunx --bun ai-elements@latest add conversation (sân tạm, đã xoá)

Đo bản tươi so bản trong cây — 1 tệp:
   conversation.tsx: 62 dòng khác · vân tay d6b6b975f09e45d2

Tệp lệch đo được (1): conversation.tsx
Mục trong sổ (1): conversation.tsx

XANH: 1 tệp lệch, 1 mục trong sổ, hai tập trùng nhau; mỗi mục đủ ba phần và khai đúng số dòng lẫn vân tay lệch.
mã thoát: 0
```

## AC-8 — cả bốn tệp so sổ

```
RĂNG SỔ LỆCH CHUẨN
Gốc kho: /Users/manhphan/dev/crm-onehub-chat
Sổ: _acceptance/nen-chat-ai-elements/so-lech-chuan.md
Bản tươi: bunx --bun ai-elements@latest add conversation message reasoning shimmer (sân tạm, đã xoá)

Đo bản tươi so bản trong cây — 4 tệp:
   conversation.tsx: 62 dòng khác · vân tay d6b6b975f09e45d2
   message.tsx: 214 dòng khác · vân tay c6cc192e6eb2eecc
   reasoning.tsx: 132 dòng khác · vân tay 8a50edd800279466
   shimmer.tsx: 35 dòng khác · vân tay 23762b9328bc901c

Tệp lệch đo được (4): conversation.tsx, message.tsx, reasoning.tsx, shimmer.tsx
Mục trong sổ (4): conversation.tsx, message.tsx, reasoning.tsx, shimmer.tsx

XANH: 4 tệp lệch, 4 mục trong sổ, hai tập trùng nhau; mỗi mục đủ ba phần và khai đúng số dòng lẫn vân tay lệch.
mã thoát: 0
```
