# Sổ S3 — truong-tep

Lượt phá-thử của các phép đo mới (khuôn `MEASURE-BIRTH-CLAUSE`): mỗi đột biến làm trên cây làm việc, chạy đúng lệnh của
eval, rồi trả tệp về nguyên (so `diff` với bản chép trước khi phá).

| Eval | Đột biến | Lệnh | Kết quả |
|---|---|---|---|
| E8 vế a | `blob-tep-truong.ts` lùi về `KHO_TAI_LIEU_BLOB_TOKEN` khi khoá tệp vắng | `bun test test/blob-tep-truong.spec.ts -t ttp-khoa` | đỏ: `ttp khoa: bat tep-vang kho-co`; ca thiếu khoá treo 5 giây vì gọi thật tới `127.0.0.1:9` (dừng tay PID của lượt). Tệp đã về nguyên. |
| E8b | thêm một dòng trống cuối `blob-nguon.ts` trên worktree tạm, commit tạm | cặp hai chiều nằm trong `rang/bai-cu-nguyen.mjs` | đỏ đúng `ttp kho tai lieu: sua packages/db/src/blob-nguon.ts`; worktree tạm đã gỡ. |
| E9b | xoá `case "FILE"` của `coerceValue` trong bản chép | cặp hai chiều nằm trong `rang/quet-kieu.mjs` | đỏ đúng `ttp quet: switch thieu FILE packages/db/src/fields.ts:`. |
| E3 | `complete` nhận kiểu theo đuôi tên thay cho byte | `bun test test/truong-tep.spec.ts -t ttp-tu-choi` | đỏ: `ttp tu choi: rac duoi pdf nhan`. Tệp đã về nguyên. |
| E4 | `coTheMoTep` trả `true` cho mọi vai | `bun test test/truong-tep.spec.ts -t ttp-quyen` | đỏ: `ttp quyen: member downloadUrl url`. Tệp đã về nguyên. |
| E9 | gỡ chặn `FILE` ở đầu `coerceValue` và nhánh `case "FILE"` | `bun test test/truong-tep.spec.ts -t ttp-ghi-chu` | đỏ: `ttp ghi chu: deals.update abc nhan`. Tệp đã về nguyên. |
| E6 | `remove` xoá Blob trước, xoá hàng ngoài giao dịch, bỏ hàng chờ | `bun test test/truong-tep.spec.ts -t ttp-xoa` | đỏ: `ttp xoa: blob hong khong cho`. Tệp đã về nguyên. |
| E7 | `deals.purge` không ghi hàng chờ (`tepXoa = []`) | `bun test test/truong-tep.spec.ts -t ttp-vong-doi` | đỏ: `ttp vong doi: deals.purge xoa []`. Tệp đã về nguyên. |
