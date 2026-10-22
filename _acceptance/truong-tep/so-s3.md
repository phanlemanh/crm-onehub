# Sổ S3 — truong-tep

Lượt phá-thử của các phép đo mới (khuôn `MEASURE-BIRTH-CLAUSE`): mỗi đột biến làm trên cây làm việc, chạy đúng lệnh của
eval, rồi trả tệp về nguyên (so `diff` với bản chép trước khi phá).

| Eval | Đột biến | Lệnh | Kết quả |
|---|---|---|---|
| E8 vế a | `blob-tep-truong.ts` lùi về `KHO_TAI_LIEU_BLOB_TOKEN` khi khoá tệp vắng | `bun test test/blob-tep-truong.spec.ts -t ttp-khoa` | đỏ: `ttp khoa: bat tep-vang kho-co`; ca thiếu khoá treo 5 giây vì gọi thật tới `127.0.0.1:9` (dừng tay PID của lượt). Tệp đã về nguyên. |
| E8b | thêm một dòng trống cuối `blob-nguon.ts` trên worktree tạm, commit tạm | cặp hai chiều nằm trong `rang/bai-cu-nguyen.mjs` | đỏ đúng `ttp kho tai lieu: sua packages/db/src/blob-nguon.ts`; worktree tạm đã gỡ. |
| E9b | xoá `case "FILE"` của `coerceValue` trong bản chép | cặp hai chiều nằm trong `rang/quet-kieu.mjs` | đỏ đúng `ttp quet: switch thieu FILE packages/db/src/fields.ts:`. |
